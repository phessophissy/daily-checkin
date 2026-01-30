;; Daily Check-in Points System — FINAL DEPLOYABLE VERSION
;; Contract Name: daily-checkin-v2
;; Deployer: SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09
;; Network: Stacks Mainnet

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Constants
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-constant CONTRACT-OWNER tx-sender)

(define-constant ERR-ALREADY-CHECKED-IN (err u100))
(define-constant ERR-NOT-AUTHORIZED (err u101))
(define-constant ERR-INVALID-AMOUNT (err u102))
(define-constant ERR-STX-TRANSFER-FAILED (err u103))

(define-constant CHECKIN-FEE u1000)
(define-constant BLOCKS-PER-DAY u144)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Data vars
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-data-var points-per-checkin uint u100)
(define-data-var streak-bonus uint u10)
(define-data-var total-checkins uint u0)
(define-data-var unique-users uint u0)
(define-data-var fee-amount uint CHECKIN-FEE)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Maps
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-map last-checkin principal uint)
(define-map user-points principal uint)
(define-map user-streak principal uint)
(define-map user-total-checkins principal uint)
(define-map user-fee-paid principal uint)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Read-only helpers
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-read-only (get-user-points (u principal))
  (default-to u0 (map-get? user-points u))
)

(define-read-only (get-last-checkin (u principal))
  (default-to u0 (map-get? last-checkin u))
)

(define-read-only (can-checkin (u principal))
  (let ((last (get-last-checkin u)))
    (or
      (is-eq last u0)
      (>= (- block-height last) BLOCKS-PER-DAY)
    )
  )
)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Public functions
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-public (check-in)
  (let (
        (user tx-sender)
        (last (get-last-checkin user))
        (points (default-to u0 (map-get? user-points user)))
        (streak (default-to u0 (map-get? user-streak user)))
        (checkins (default-to u0 (map-get? user-total-checkins user)))
        (paid (default-to u0 (map-get? user-fee-paid user)))
        (fee (var-get fee-amount))
        (is-new (is-eq last u0))
       )

    ;; Time gate
    (asserts! (can-checkin user) ERR-ALREADY-CHECKED-IN)

    ;; Fee
    (asserts!
      (is-ok (stx-transfer? fee user CONTRACT-OWNER))
      ERR-STX-TRANSFER-FAILED
    )

    ;; Streak logic
    (let (
          (new-streak
            (if (and (not is-new)
                     (< (- block-height last) (* BLOCKS-PER-DAY u2)))
                (+ streak u1)
                u1
            )
          )
          (earned (+ (var-get points-per-checkin)
                      (* new-streak (var-get streak-bonus))))
         )

      ;; Update user state
      (map-set last-checkin user block-height)
      (map-set user-points user (+ points earned))
      (map-set user-streak user new-streak)
      (map-set user-total-checkins user (+ checkins u1))
      (map-set user-fee-paid user (+ paid fee))

      ;; Global stats
      (var-set total-checkins (+ (var-get total-checkins) u1))
      (when is-new
        (var-set unique-users (+ (var-get unique-users) u1))
      )

      (ok {
        earned: earned,
        total-points: (+ points earned),
        streak: new-streak,
        total-checkins: (+ checkins u1),
        fee-paid: fee
      })
    )
  )
)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Admin
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-public (set-points-per-checkin (n uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (asserts! (> n u0) ERR-INVALID-AMOUNT)
    (var-set points-per-checkin n)
    (ok n)
  )
)

(define-public (set-streak-bonus (n uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (var-set streak-bonus n)
    (ok n)
  )
)

(define-public (set-fee-amount (n uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (asserts! (> n u0) ERR-INVALID-AMOUNT)
    (var-set fee-amount n)
    (ok n)
  )
)
