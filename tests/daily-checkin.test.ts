/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  Daily Check-in Points System Test Suite                                 ║
 * ║  Comprehensive tests for the Daily Check-in smart contract               ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { describe, it, expect, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;
const wallet4 = accounts.get("wallet_4")!;

const contractName = "daily-checkin";

// Helper to extract response values
function getResponseOk(result: any) {
  if (result.result.type === 7) { // ResponseOk
    return result.result.value;
  }
  throw new Error(`Expected ResponseOk, got ${result.result.type}`);
}

function getResponseErr(result: any) {
  if (result.result.type === 8) { // ResponseErr
    return result.result.value;
  }
  throw new Error(`Expected ResponseErr, got ${result.result.type}`);
}

// ════════════════════════════════════════════════════════════════════════════
// SINGLE CHECK-IN TESTS
// ════════════════════════════════════════════════════════════════════════════

describe("Single Check-in Tests", () => {
  it("should allow first-time check-in", () => {
    const { result } = simnet.callPublicFn(
      contractName,
      "check-in",
      [],
      wallet1
    );

    expect(result).toBeOk(Cl.tuple({
      earned: Cl.uint(100), // Base points
      "total-points": Cl.uint(100),
      streak: Cl.uint(1),
      "total-checkins": Cl.uint(1)
    }));
  });

  it("should prevent same-day check-in", () => {
    // First check-in
    simnet.callPublicFn(contractName, "check-in", [], wallet1);

    // Second check-in should fail
    const { result } = simnet.callPublicFn(
      contractName,
      "check-in",
      [],
      wallet1
    );

    expect(result).toBeErr(Cl.uint(100)); // ERR-ALREADY-CHECKED-IN
  });

  it("should allow check-in after 144 blocks", () => {
    // First check-in
    simnet.callPublicFn(contractName, "check-in", [], wallet1);

    // Advance 144 blocks (1 day)
    simnet.mineEmptyBlocks(144);

    // Second check-in should succeed
    const { result } = simnet.callPublicFn(
      contractName,
      "check-in",
      [],
      wallet1
    );

    expect(result).toBeOk(Cl.tuple({
      earned: Cl.uint(110), // Base + streak bonus
      "total-points": Cl.uint(210),
      streak: Cl.uint(2),
      "total-checkins": Cl.uint(2)
    }));
  });

  it("should track streak bonuses correctly", () => {
    // Day 1
    simnet.callPublicFn(contractName, "check-in", [], wallet1);
    expect(getResponseOk(simnet.callPublicFn(contractName, "check-in", [], wallet1)).data.streak).toBeUint(1);

    // Day 2
    simnet.mineEmptyBlocks(144);
    simnet.callPublicFn(contractName, "check-in", [], wallet1);
    expect(getResponseOk(simnet.callPublicFn(contractName, "check-in", [], wallet1)).data.streak).toBeUint(2);

    // Day 3
    simnet.mineEmptyBlocks(144);
    const { result } = simnet.callPublicFn(contractName, "check-in", [], wallet1);
    expect(result).toBeOk(Cl.tuple({
      earned: Cl.uint(120), // 100 + (3 * 10) streak bonus
      "total-points": Cl.uint(330),
      streak: Cl.uint(3),
      "total-checkins": Cl.uint(3)
    }));
  });

  it("should reset streak after missing a day", () => {
    // Day 1
    simnet.callPublicFn(contractName, "check-in", [], wallet1);

    // Skip more than 2 days (288 blocks)
    simnet.mineEmptyBlocks(289);

    // Next check-in should reset streak
    const { result } = simnet.callPublicFn(
      contractName,
      "check-in",
      [],
      wallet1
    );

    expect(result).toBeOk(Cl.tuple({
      earned: Cl.uint(100), // Back to base points
      "total-points": Cl.uint(200),
      streak: Cl.uint(1), // Streak reset
      "total-checkins": Cl.uint(2)
    }));
  });
});

// ════════════════════════════════════════════════════════════════════════════
// BULK CHECK-IN TESTS
// ════════════════════════════════════════════════════════════════════════════

describe("Bulk Check-in Tests", () => {
  it("should allow bulk check-in for multiple users", () => {
    const { result } = simnet.callPublicFn(
      contractName,
      "bulk-check-in",
      [Cl.list([
        Cl.principal(wallet1),
        Cl.principal(wallet2),
        Cl.principal(wallet3)
      ])],
      wallet4 // Payer
    );

    expect(result).toBeOk(Cl.list([
      Cl.tuple({
        earned: Cl.uint(100),
        "total-points": Cl.uint(100),
        streak: Cl.uint(1),
        "total-checkins": Cl.uint(1)
      }),
      Cl.tuple({
        earned: Cl.uint(100),
        "total-points": Cl.uint(100),
        streak: Cl.uint(1),
        "total-checkins": Cl.uint(1)
      }),
      Cl.tuple({
        earned: Cl.uint(100),
        "total-points": Cl.uint(100),
        streak: Cl.uint(1),
        "total-checkins": Cl.uint(1)
      })
    ]));
  });

  it("should collect correct total fee for bulk check-ins", () => {
    const users = [wallet1, wallet2, wallet3, wallet4];
    const { result } = simnet.callPublicFn(
      contractName,
      "bulk-check-in",
      [Cl.list(users.map(u => Cl.principal(u)))],
      deployer
    );

    expect(result).toBeOk(Cl.list([
      Cl.tuple({
        earned: Cl.uint(100),
        "total-points": Cl.uint(100),
        streak: Cl.uint(1),
        "total-checkins": Cl.uint(1)
      }),
      Cl.tuple({
        earned: Cl.uint(100),
        "total-points": Cl.uint(100),
        streak: Cl.uint(1),
        "total-checkins": Cl.uint(1)
      }),
      Cl.tuple({
        earned: Cl.uint(100),
        "total-points": Cl.uint(100),
        streak: Cl.uint(1),
        "total-checkins": Cl.uint(1)
      }),
      Cl.tuple({
        earned: Cl.uint(100),
        "total-points": Cl.uint(100),
        streak: Cl.uint(1),
        "total-checkins": Cl.uint(1)
      })
    ]));
  });

  it("should handle mixed successful and failed check-ins", () => {
    // wallet1 already checked in
    simnet.callPublicFn(contractName, "check-in", [], wallet1);

    const users = [wallet1, wallet2, wallet3]; // wallet1 should fail
    const { result } = simnet.callPublicFn(
      contractName,
      "bulk-check-in",
      [Cl.list(users.map(u => Cl.principal(u)))],
      wallet4
    );

    // Should fail due to wallet1 already checked in
    expect(result).toBeErr(Cl.uint(100)); // ERR-ALREADY-CHECKED-IN
  });

  it("should reject empty user list", () => {
    const { result } = simnet.callPublicFn(
      contractName,
      "bulk-check-in",
      [Cl.list([])],
      wallet1
    );

    expect(result).toBeErr(Cl.uint(102)); // ERR-INVALID-AMOUNT
  });

  it("should handle maximum bulk size (10 users)", () => {
    const users = Array.from({length: 10}, (_, i) => accounts.get(`wallet_${i + 1}`)!);
    const { result } = simnet.callPublicFn(
      contractName,
      "bulk-check-in",
      [Cl.list(users.map(u => Cl.principal(u)))],
      deployer
    );

    expect(result).toBeOk(Cl.list(users.map(() => Cl.tuple({
      earned: Cl.uint(100),
      "total-points": Cl.uint(100),
      streak: Cl.uint(1),
      "total-checkins": Cl.uint(1)
    }))));
  });

  it("should preserve streak bonuses in bulk check-ins", () => {
    // Set up streaks for users
    simnet.callPublicFn(contractName, "check-in", [], wallet1);
    simnet.mineEmptyBlocks(144);
    simnet.callPublicFn(contractName, "check-in", [], wallet1); // wallet1 has streak of 2

    simnet.callPublicFn(contractName, "check-in", [], wallet2); // wallet2 has streak of 1

    // Advance another day
    simnet.mineEmptyBlocks(144);

    // Bulk check-in should preserve individual streaks
    const { result } = simnet.callPublicFn(
      contractName,
      "bulk-check-in",
      [Cl.list([
        Cl.principal(wallet1), // Should get streak bonus (3 days)
        Cl.principal(wallet2)  // Should get minimal streak bonus (2 days)
      ])],
      wallet3
    );

    expect(result).toBeOk(Cl.list([
      Cl.tuple({
        earned: Cl.uint(130), // 100 + (3 * 10) streak bonus
        "total-points": Cl.uint(330),
        streak: Cl.uint(3),
        "total-checkins": Cl.uint(3)
      }),
      Cl.tuple({
        earned: Cl.uint(110), // 100 + (2 * 10) streak bonus
        "total-points": Cl.uint(210),
        streak: Cl.uint(2),
        "total-checkins": Cl.uint(2)
      })
    ]));
  });

  it("should update global statistics correctly", () => {
    // Initial stats
    const initialStats = simnet.callReadOnlyFn(contractName, "get-global-stats", [], wallet1);
    expect(initialStats.result.data["total-checkins"]).toBeUint(0);
    expect(initialStats.result.data["unique-users"]).toBeUint(0);

    // Bulk check-in with 3 new users
    simnet.callPublicFn(
      contractName,
      "bulk-check-in",
      [Cl.list([
        Cl.principal(wallet1),
        Cl.principal(wallet2),
        Cl.principal(wallet3)
      ])],
      wallet4
    );

    // Check updated stats
    const updatedStats = simnet.callReadOnlyFn(contractName, "get-global-stats", [], wallet1);
    expect(updatedStats.result.data["total-checkins"]).toBeUint(3);
    expect(updatedStats.result.data["unique-users"]).toBeUint(3);
  });

  it("should handle duplicate users in bulk list", () => {
    const users = [wallet1, wallet1, wallet2]; // Duplicate wallet1
    const { result } = simnet.callPublicFn(
      contractName,
      "bulk-check-in",
      [Cl.list(users.map(u => Cl.principal(u)))],
      wallet3
    );

    // Should fail on second check-in of wallet1
    expect(result).toBeErr(Cl.uint(100)); // ERR-ALREADY-CHECKED-IN
  });
});

// ════════════════════════════════════════════════════════════════════════════
// ADMIN FUNCTION TESTS
// ════════════════════════════════════════════════════════════════════════════

describe("Admin Function Tests", () => {
  it("should allow owner to set points per check-in", () => {
    const { result } = simnet.callPublicFn(
      contractName,
      "set-points-per-checkin",
      [Cl.uint(200)],
      deployer
    );

    expect(result).toBeOk(Cl.uint(200));

    // Verify change
    const newPoints = simnet.callReadOnlyFn(contractName, "get-points-per-checkin", [], wallet1);
    expect(newPoints.result).toBeUint(200);
  });

  it("should prevent non-owner from setting points", () => {
    const { result } = simnet.callPublicFn(
      contractName,
      "set-points-per-checkin",
      [Cl.uint(200)],
      wallet1
    );

    expect(result).toBeErr(Cl.uint(101)); // ERR-NOT-AUTHORIZED
  });

  it("should allow owner to set streak bonus", () => {
    const { result } = simnet.callPublicFn(
      contractName,
      "set-streak-bonus",
      [Cl.uint(20)],
      deployer
    );

    expect(result).toBeOk(Cl.uint(20));

    // Verify change
    const newBonus = simnet.callReadOnlyFn(contractName, "get-streak-bonus", [], wallet1);
    expect(newBonus.result).toBeUint(20);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// READ-ONLY FUNCTION TESTS
// ════════════════════════════════════════════════════════════════════════════

describe("Read-Only Function Tests", () => {
  beforeEach(() => {
    simnet.callPublicFn(contractName, "check-in", [], wallet1);
  });

  it("should return correct user stats", () => {
    const { result } = simnet.callReadOnlyFn(
      contractName,
      "get-user-stats",
      [Cl.principal(wallet1)],
      wallet1
    );

    expect(result).toBeTuple({
      points: Cl.uint(100),
      streak: Cl.uint(1),
      "total-checkins": Cl.uint(1),
      "last-checkin": Cl.uint(simnet.blockHeight),
      "can-checkin": Cl.bool(false) // Just checked in
    });
  });

  it("should correctly determine if user can check in", () => {
    // Just checked in, should not be able to check in again
    const cannotCheckin = simnet.callReadOnlyFn(
      contractName,
      "can-checkin",
      [Cl.principal(wallet1)],
      wallet1
    );
    expect(cannotCheckin.result).toBeBool(false);

    // After advancing blocks, should be able to check in
    simnet.mineEmptyBlocks(144);
    const canCheckin = simnet.callReadOnlyFn(
      contractName,
      "can-checkin",
      [Cl.principal(wallet1)],
      wallet1
    );
    expect(canCheckin.result).toBeBool(true);
  });

  it("should return zero values for non-existent users", () => {
    const points = simnet.callReadOnlyFn(contractName, "get-user-points", [Cl.principal(wallet2)], wallet1);
    expect(points.result).toBeUint(0);

    const streak = simnet.callReadOnlyFn(contractName, "get-user-streak", [Cl.principal(wallet2)], wallet1);
    expect(streak.result).toBeUint(0);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// INTEGRATION TESTS
// ════════════════════════════════════════════════════════════════════════════

describe("Integration Tests", () => {
  it("should handle complex scenario with single and bulk check-ins", () => {
    // Initial single check-ins
    simnet.callPublicFn(contractName, "check-in", [], wallet1);
    simnet.callPublicFn(contractName, "check-in", [], wallet2);

    // Advance time
    simnet.mineEmptyBlocks(144);

    // Bulk check-in for next day
    simnet.callPublicFn(
      contractName,
      "bulk-check-in",
      [Cl.list([
        Cl.principal(wallet1), // Streak continues
        Cl.principal(wallet2), // Streak continues
        Cl.principal(wallet3)  // New user
      ])],
      wallet4
    );

    // Verify final state
    const user1Stats = simnet.callReadOnlyFn(contractName, "get-user-stats", [Cl.principal(wallet1)], wallet1);
    expect(user1Stats.result.data.points).toBeUint(210); // 100 + 110
    expect(user1Stats.result.data.streak).toBeUint(2);

    const user3Stats = simnet.callReadOnlyFn(contractName, "get-user-stats", [Cl.principal(wallet3)], wallet1);
    expect(user3Stats.result.data.points).toBeUint(100);
    expect(user3Stats.result.data.streak).toBeUint(1);

    // Global stats
    const globalStats = simnet.callReadOnlyFn(contractName, "get-global-stats", [], wallet1);
    expect(globalStats.result.data["total-checkins"]).toBeUint(5);
    expect(globalStats.result.data["unique-users"]).toBeUint(4); // wallet1,2,3,4 (wallet4 paid fees)
  });

  it("should handle admin configuration changes affecting bulk operations", () => {
    // Change points configuration
    simnet.callPublicFn(contractName, "set-points-per-checkin", [Cl.uint(150)], deployer);
    simnet.callPublicFn(contractName, "set-streak-bonus", [Cl.uint(15)], deployer);

    // Bulk check-in should use new rates
    const { result } = simnet.callPublicFn(
      contractName,
      "bulk-check-in",
      [Cl.list([
        Cl.principal(wallet1),
        Cl.principal(wallet2)
      ])],
      wallet3
    );

    expect(result).toBeOk(Cl.list([
      Cl.tuple({
        earned: Cl.uint(150), // New base points
        "total-points": Cl.uint(150),
        streak: Cl.uint(1),
        "total-checkins": Cl.uint(1)
      }),
      Cl.tuple({
        earned: Cl.uint(150),
        "total-points": Cl.uint(150),
        streak: Cl.uint(1),
        "total-checkins": Cl.uint(1)
      })
    ]));
  });
});
