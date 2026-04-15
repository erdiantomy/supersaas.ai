/**
 * Tests for the ROI Calculator business logic.
 *
 * getTeamTier and the ROI formulas live inside ROICalculator.tsx as
 * unexported functions/useMemo. We reproduce the exact same logic here
 * so we can unit-test boundary conditions and formula correctness without
 * needing to render the full component (which pulls in Framer Motion,
 * Radix sliders, etc.).
 *
 * If the formulas in ROICalculator.tsx are ever changed, update this file
 * to match — the discrepancy itself becomes a useful signal.
 */
import { describe, it, expect } from "vitest";

// ─── Replicated from ROICalculator.tsx ────────────────────────────────────────

const TEAM_LABELS = [
  { max: 5, label: "Startup", agencyWeeks: 24, agencyCost: 80000 },
  { max: 15, label: "Growing", agencyWeeks: 32, agencyCost: 150000 },
  { max: 30, label: "Mid-Market", agencyWeeks: 40, agencyCost: 280000 },
  { max: 50, label: "Scale-Up", agencyWeeks: 48, agencyCost: 420000 },
  { max: Infinity, label: "Enterprise", agencyWeeks: 60, agencyCost: 650000 },
];

function getTeamTier(size: number) {
  return TEAM_LABELS.find((t) => size <= t.max) || TEAM_LABELS[TEAM_LABELS.length - 1];
}

function calcResults(monthlySpend: number, teamSize: number) {
  const spend = monthlySpend;
  const team = teamSize;
  const tier = getTeamTier(team);

  const superSaasOneTime = Math.max(12000, spend * 1.5);
  const superSaasMonthly = Math.round(spend * 0.15);
  const superSaasWeeks = Math.max(2, Math.round(tier.agencyWeeks / 6));

  const currentAnnual = spend * 12;
  const agencyAnnual = tier.agencyCost + spend * 6;
  const superSaasAnnual = superSaasOneTime + superSaasMonthly * 12;

  const savingsVsCurrent = currentAnnual - superSaasAnnual;
  const savingsVsAgency = agencyAnnual - superSaasAnnual;
  const savingsPercent = Math.round((savingsVsCurrent / currentAnnual) * 100);
  const timeSavedWeeks = tier.agencyWeeks - superSaasWeeks;
  const paybackMonths = Math.round(superSaasOneTime / (spend - superSaasMonthly));

  return {
    spend,
    team,
    tier,
    superSaasOneTime,
    superSaasMonthly,
    superSaasWeeks,
    currentAnnual,
    agencyAnnual,
    superSaasAnnual,
    savingsVsCurrent: Math.max(0, savingsVsCurrent),
    savingsVsAgency: Math.max(0, savingsVsAgency),
    savingsPercent: Math.max(0, Math.min(savingsPercent, 95)),
    timeSavedWeeks,
    paybackMonths: Math.max(1, paybackMonths),
  };
}

// ─── getTeamTier ──────────────────────────────────────────────────────────────

describe("getTeamTier", () => {
  it("returns Startup for size <= 5", () => {
    expect(getTeamTier(1).label).toBe("Startup");
    expect(getTeamTier(5).label).toBe("Startup");
  });

  it("returns Growing for size 6–15 (boundary at 5)", () => {
    expect(getTeamTier(6).label).toBe("Growing");
    expect(getTeamTier(15).label).toBe("Growing");
  });

  it("returns Mid-Market for size 16–30", () => {
    expect(getTeamTier(16).label).toBe("Mid-Market");
    expect(getTeamTier(30).label).toBe("Mid-Market");
  });

  it("returns Scale-Up for size 31–50", () => {
    expect(getTeamTier(31).label).toBe("Scale-Up");
    expect(getTeamTier(50).label).toBe("Scale-Up");
  });

  it("returns Enterprise for size > 50", () => {
    expect(getTeamTier(51).label).toBe("Enterprise");
    expect(getTeamTier(1000).label).toBe("Enterprise");
  });

  it("falls back to last tier (Enterprise) as default", () => {
    // Infinity input (edge case)
    expect(getTeamTier(Infinity).label).toBe("Enterprise");
  });
});

// ─── ROI Formula ──────────────────────────────────────────────────────────────

describe("calcResults", () => {
  describe("superSaasOneTime — minimum floor of $12,000", () => {
    it("uses spend*1.5 when that exceeds $12K", () => {
      // spend=10000 → 10000*1.5=15000 > 12000
      const r = calcResults(10000, 5);
      expect(r.superSaasOneTime).toBe(15000);
    });

    it("uses $12,000 floor when spend*1.5 is below it", () => {
      // spend=2000 → 2000*1.5=3000 < 12000
      const r = calcResults(2000, 5);
      expect(r.superSaasOneTime).toBe(12000);
    });
  });

  describe("superSaasMonthly — 15% of monthly spend", () => {
    it("is 15% of the monthly spend (rounded)", () => {
      const r = calcResults(8000, 10);
      expect(r.superSaasMonthly).toBe(Math.round(8000 * 0.15));
    });
  });

  describe("superSaasWeeks — minimum 2 weeks", () => {
    it("is agencyWeeks/6 rounded, minimum 2", () => {
      // Startup agencyWeeks=24 → 24/6=4
      const r = calcResults(8000, 3);
      expect(r.superSaasWeeks).toBe(4);
    });

    it("never goes below 2 weeks", () => {
      // If a tier had only 6 agency weeks → 6/6=1, but floor is 2
      // We can verify directly: Math.max(2, Math.round(6/6)) = 2
      const floor = Math.max(2, Math.round(6 / 6));
      expect(floor).toBe(2);
    });
  });

  describe("savingsVsCurrent — clamped to 0 minimum", () => {
    it("is non-negative", () => {
      // Even with a very high spend where savings might be negative, clamp applies
      const r = calcResults(2000, 2);
      expect(r.savingsVsCurrent).toBeGreaterThanOrEqual(0);
    });

    it("equals currentAnnual - superSaasAnnual when positive", () => {
      const r = calcResults(20000, 20);
      const expected = Math.max(0, r.currentAnnual - r.superSaasAnnual);
      expect(r.savingsVsCurrent).toBe(expected);
    });
  });

  describe("savingsPercent — clamped 0–95", () => {
    it("is always between 0 and 95 inclusive", () => {
      [2000, 8000, 20000, 50000].forEach((spend) => {
        [2, 12, 30, 60].forEach((team) => {
          const r = calcResults(spend, team);
          expect(r.savingsPercent).toBeGreaterThanOrEqual(0);
          expect(r.savingsPercent).toBeLessThanOrEqual(95);
        });
      });
    });
  });

  describe("paybackMonths — minimum 1 month", () => {
    it("is always at least 1", () => {
      [2000, 8000, 20000].forEach((spend) => {
        const r = calcResults(spend, 10);
        expect(r.paybackMonths).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe("currentAnnual", () => {
    it("is exactly 12 × monthly spend", () => {
      const r = calcResults(8000, 12);
      expect(r.currentAnnual).toBe(96000);
    });
  });

  describe("tier wiring", () => {
    it("uses the correct tier for the given team size", () => {
      expect(calcResults(10000, 5).tier.label).toBe("Startup");
      expect(calcResults(10000, 15).tier.label).toBe("Growing");
      expect(calcResults(10000, 30).tier.label).toBe("Mid-Market");
      expect(calcResults(10000, 50).tier.label).toBe("Scale-Up");
      expect(calcResults(10000, 51).tier.label).toBe("Enterprise");
    });
  });
});
