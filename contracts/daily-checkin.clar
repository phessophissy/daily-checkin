;; Daily Check-in Points System
;; Users can check in once per day to earn points
;; Points accumulate and can be used for future rewards
;; Fee: 0.001 STX per check-in

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-ALREADY-CHECKED-IN (err u100))
(define-constant ERR-NOT-AUTHORIZED (err u101))
(define-constant ERR-INVALID-AMOUNT (err u102))
(define-constant ERR-STX-TRANSFER-FAILED (err u103))

;; Check-in fee in microSTX (0.001 STX = 1000 microSTX)
(define-constant CHECKIN-FEE u1000)

;; Points per check-in (can be adjusted by owner)
(define-data-var points-per-checkin uint u100)
(define-data-var streak-bonus uint u10) ;; Extra points per day of streak
(define-data-var total-checkins uint u0)
(define-data-var unique-users uint u0)

;; Data maps
;; Track last check-in block for each user
(define-map last-checkin principal uint)

;; Track total points for each user
(define-map user-points principal uint)

;; Track check-in streak (consecutive days)
(define-map user-streak principal uint)

;; Track total check-ins per user
(define-map user-total-checkins principal uint)

;; Blocks per day (~144 blocks on Stacks, ~10 min/block)
(define-constant BLOCKS-PER-DAY u144)

;; Read-only functions
(define-read-only (get-user-points (user principal))
  (default-to u0 (map-get? user-points user))
)

(define-read-only (get-user-streak (user principal))
  (default-to u0 (map-get? user-streak user))
)

(define-read-only (get-last-checkin (user principal))
  (default-to u0 (map-get? last-checkin user))
)

(define-read-only (get-user-total-checkins (user principal))
  (default-to u0 (map-get? user-total-checkins user))
)

(define-read-only (get-total-checkins)
  (var-get total-checkins)
)

(define-read-only (get-unique-users)
  (var-get unique-users)
)

(define-read-only (get-points-per-checkin)
  (var-get points-per-checkin)
)

(define-read-only (get-streak-bonus)
  (var-get streak-bonus)
)

(define-read-only (can-checkin (user principal))
  (let (
    (last-block (get-last-checkin user))
    (current-block block-height)
  )
    (or 
      (is-eq last-block u0)
      (>= (- current-block last-block) BLOCKS-PER-DAY)
    )
  )
)

(define-read-only (get-user-stats (user principal))
  {
    points: (get-user-points user),
    streak: (get-user-streak user),
    total-checkins: (get-user-total-checkins user),
    last-checkin: (get-last-checkin user),
    can-checkin: (can-checkin user)
  }
)

(define-read-only (get-global-stats)
  {
    total-checkins: (var-get total-checkins),
    unique-users: (var-get unique-users),
    points-per-checkin: (var-get points-per-checkin),
    streak-bonus: (var-get streak-bonus)
  }
)

;; Public functions

;; Main check-in function
(define-public (check-in)
  (let (
    (user tx-sender)
    (last-block (get-last-checkin user))
    (current-block block-height)
    (current-points (get-user-points user))
    (current-streak (get-user-streak user))
    (current-user-checkins (get-user-total-checkins user))
    (is-new-user (is-eq last-block u0))
  )
    ;; Check if user can check in (24h passed)
    (asserts! (can-checkin user) ERR-ALREADY-CHECKED-IN)
    
    ;; Collect check-in fee (0.001 STX)
    (try! (stx-transfer? CHECKIN-FEE user CONTRACT-OWNER))
    
    ;; Calculate new streak
    (let (
      (new-streak (if (and (not is-new-user) 
                          (< (- current-block last-block) (* BLOCKS-PER-DAY u2)))
                    (+ current-streak u1)
                    u1))
      (streak-points (* new-streak (var-get streak-bonus)))
      (earned-points (+ (var-get points-per-checkin) streak-points))
    )
      ;; Update user data
      (map-set last-checkin user current-block)
      (map-set user-points user (+ current-points earned-points))
      (map-set user-streak user new-streak)
      (map-set user-total-checkins user (+ current-user-checkins u1))
      
      ;; Update global stats
      (var-set total-checkins (+ (var-get total-checkins) u1))
      (if is-new-user
        (var-set unique-users (+ (var-get unique-users) u1))
        true
      )
      
      ;; Return earned points and new totals
      (ok {
        earned: earned-points,
        total-points: (+ current-points earned-points),
        streak: new-streak,
        total-checkins: (+ current-user-checkins u1)
      })
    )
  )
)

;; Bulk operations

;; Bulk check-in for multiple users (up to 10 users per transaction)
(define-private (check-in-internal (user principal))
  (let (
    (last-block (get-last-checkin user))
    (current-block block-height)
    (current-points (get-user-points user))
    (current-streak (get-user-streak user))
    (current-user-checkins (get-user-total-checkins user))
    (is-new-user (is-eq last-block u0))
  )
    ;; Check if user can check in (24h passed)
    (asserts! (can-checkin user) ERR-ALREADY-CHECKED-IN)

    ;; Calculate new streak
    (let (
      (new-streak (if (and (not is-new-user)
                          (< (- current-block last-block) (* BLOCKS-PER-DAY u2)))
                    (+ current-streak u1)
                    u1))
      (streak-points (* new-streak (var-get streak-bonus)))
      (earned-points (+ (var-get points-per-checkin) streak-points))
    )
      ;; Update user data
      (map-set last-checkin user current-block)
      (map-set user-points user (+ current-points earned-points))
      (map-set user-streak user new-streak)
      (map-set user-total-checkins user (+ current-user-checkins u1))

      ;; Update global stats
      (var-set total-checkins (+ (var-get total-checkins) u1))
      (if is-new-user
        (var-set unique-users (+ (var-get unique-users) u1))
        true
      )

      ;; Return earned points and new totals
      (ok {
        earned: earned-points,
        total-points: (+ current-points earned-points),
        streak: new-streak,
        total-checkins: (+ current-user-checkins u1)
      })
    )
  )
)

(define-public (bulk-check-in (users (list 10 principal)))
  (let (
    (fee-total (* (len users) CHECKIN-FEE))
  )
    ;; Basic validations
    (asserts! (> (len users) u0) ERR-INVALID-AMOUNT)

    ;; Collect total fee from caller
    (try! (stx-transfer? fee-total tx-sender CONTRACT-OWNER))

    ;; Process all check-ins - each will validate individually
    (ok (map check-in-internal users))
  )
)

;; Admin functions
(define-public (set-points-per-checkin (new-points uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (asserts! (> new-points u0) ERR-INVALID-AMOUNT)
    (var-set points-per-checkin new-points)
    (ok new-points)
  )
)

(define-public (set-streak-bonus (new-bonus uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (var-set streak-bonus new-bonus)
    (ok new-bonus)
  )
)

;; Get contract owner
(define-read-only (get-contract-owner)
  (ok CONTRACT-OWNER))
