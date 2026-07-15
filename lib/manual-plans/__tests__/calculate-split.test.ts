import { describe, it, expect } from "vitest";
import { calculateSplit, resolveMemberWeight, type SplitMemberInput } from "../calculate-split";

function member(overrides: Partial<SplitMemberInput> & Pick<SplitMemberInput, "id">): SplitMemberInput {
  return {
    tierLevel: "peer",
    weightOverride: null,
    organizerDiscount: null,
    ...overrides,
  };
}

describe("calculateSplit", () => {
  it("splits equally when all members share the same tier", () => {
    const members = [member({ id: "a" }), member({ id: "b" }), member({ id: "c" }), member({ id: "d" })];
    const result = calculateSplit(20000, members, 100);
    expect(result).not.toBeNull();
    expect(result!.map((r) => r.amount)).toEqual([5000, 5000, 5000, 5000]);
  });

  it("rounds up to the rounding unit, same direction as perPersonFee", () => {
    const members = [member({ id: "a" }), member({ id: "b" }), member({ id: "c" })];
    const result = calculateSplit(20000, members, 100)!;
    // 20000 / 3 = 6666.67 -> ceil to nearest 100 = 6700
    expect(result.map((r) => r.amount)).toEqual([6700, 6700, 6700]);
  });

  it("splits proportionally by tier weight (boss vs junior)", () => {
    const members = [
      member({ id: "boss", tierLevel: "boss" }), // weight 1.5
      member({ id: "junior", tierLevel: "junior" }), // weight 0.8
    ];
    // total weight = 2.3, per-unit = 10000/2.3 ≈ 4347.8
    const result = calculateSplit(10000, members, 100)!;
    const boss = result.find((r) => r.id === "boss")!;
    const junior = result.find((r) => r.id === "junior")!;
    expect(boss.weight).toBe(1.5);
    expect(junior.weight).toBe(0.8);
    expect(boss.amount).toBeGreaterThan(junior.amount);
    expect(boss.amount).toBe(6600); // ceil(1.5 * 10000/2.3 = 6521.7) -> 6600
    expect(junior.amount).toBe(3500); // ceil(0.8 * 10000/2.3 = 3478.3) -> 3500
  });

  it("applies organizer_discount=free as weight 0", () => {
    const members = [
      member({ id: "organizer", tierLevel: "organizer", organizerDiscount: "free" }),
      member({ id: "peer1" }),
      member({ id: "peer2" }),
    ];
    const result = calculateSplit(10000, members, 100)!;
    const organizer = result.find((r) => r.id === "organizer")!;
    expect(organizer.weight).toBe(0);
    expect(organizer.amount).toBe(0);
    // remaining cost is fully redistributed across the two peers
    const peer1 = result.find((r) => r.id === "peer1")!;
    const peer2 = result.find((r) => r.id === "peer2")!;
    expect(peer1.amount).toBe(5000);
    expect(peer2.amount).toBe(5000);
  });

  it("applies organizer_discount=half, overriding the base organizer weight of 1.0", () => {
    const organizer = member({ id: "organizer", tierLevel: "organizer", organizerDiscount: "half" });
    expect(resolveMemberWeight(organizer)).toBe(0.5);
  });

  it("prefers weight_override over the tier default", () => {
    const overridden = member({ id: "x", tierLevel: "boss", weightOverride: 2.5 });
    expect(resolveMemberWeight(overridden)).toBe(2.5);
  });

  it("falls back to an equal split when every member's weight resolves to 0", () => {
    const members = [
      member({ id: "a", weightOverride: 0 }),
      member({ id: "b", weightOverride: 0 }),
    ];
    const result = calculateSplit(10000, members, 100)!;
    expect(result.map((r) => r.amount)).toEqual([5000, 5000]);
  });

  it("returns null when feeAmount is null", () => {
    expect(calculateSplit(null, [member({ id: "a" })], 100)).toBeNull();
  });

  it("returns null when there are no members", () => {
    expect(calculateSplit(10000, [], 100)).toBeNull();
  });

  it("returns all-zero amounts (not null) when feeAmount is 0", () => {
    const members = [member({ id: "a" }), member({ id: "b" })];
    const result = calculateSplit(0, members, 100)!;
    expect(result).not.toBeNull();
    expect(result.map((r) => r.amount)).toEqual([0, 0]);
  });

  it("respects a 500 yen rounding unit", () => {
    const members = [member({ id: "a" }), member({ id: "b" }), member({ id: "c" })];
    const result = calculateSplit(20000, members, 500)!;
    // 6666.67 -> ceil to nearest 500 = 7000
    expect(result.map((r) => r.amount)).toEqual([7000, 7000, 7000]);
  });

  it("respects a 1000 yen rounding unit", () => {
    const members = [member({ id: "a" }), member({ id: "b" }), member({ id: "c" })];
    const result = calculateSplit(20000, members, 1000)!;
    // 6666.67 -> ceil to nearest 1000 = 7000
    expect(result.map((r) => r.amount)).toEqual([7000, 7000, 7000]);
  });
});
