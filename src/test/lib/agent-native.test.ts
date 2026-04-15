import { describe, it, expect } from "vitest";
import {
  STATUS_TRANSITIONS,
  STATUS_LABELS,
  PRICING_TIERS,
} from "@/lib/agent-native";
import type { WorkflowStatus } from "@/lib/agent-native";

const ALL_STATUSES: WorkflowStatus[] = [
  "intake",
  "planning",
  "architecting",
  "validating",
  "quoting",
  "negotiating",
  "paid",
  "building",
  "testing",
  "deploying",
  "live",
  "optimizing",
  "paused",
  "shutdown",
];

// Statuses with no valid outgoing transition
const TERMINAL_STATUSES: WorkflowStatus[] = ["optimizing", "paused", "shutdown"];

// The expected linear happy path
const HAPPY_PATH: [WorkflowStatus, WorkflowStatus][] = [
  ["intake", "planning"],
  ["planning", "architecting"],
  ["architecting", "validating"],
  ["validating", "quoting"],
  ["quoting", "negotiating"],
  ["negotiating", "paid"],
  ["paid", "building"],
  ["building", "testing"],
  ["testing", "deploying"],
  ["deploying", "live"],
  ["live", "optimizing"],
];

describe("STATUS_TRANSITIONS", () => {
  it("every source key is a valid WorkflowStatus", () => {
    Object.keys(STATUS_TRANSITIONS).forEach((from) => {
      expect(ALL_STATUSES).toContain(from);
    });
  });

  it("every target value is a valid WorkflowStatus", () => {
    Object.values(STATUS_TRANSITIONS).forEach((to) => {
      expect(ALL_STATUSES).toContain(to);
    });
  });

  it.each(HAPPY_PATH)("%s → %s follows the correct order", (from, to) => {
    expect(STATUS_TRANSITIONS[from]).toBe(to);
  });

  it("terminal statuses have no outgoing transition", () => {
    TERMINAL_STATUSES.forEach((status) => {
      expect(STATUS_TRANSITIONS[status]).toBeUndefined();
    });
  });

  it("no transition points back to intake (no cycles)", () => {
    const targets = Object.values(STATUS_TRANSITIONS);
    expect(targets).not.toContain("intake");
  });

  it("no status transitions to itself", () => {
    Object.entries(STATUS_TRANSITIONS).forEach(([from, to]) => {
      expect(from).not.toBe(to);
    });
  });
});

describe("STATUS_LABELS", () => {
  it("has a label for every WorkflowStatus", () => {
    ALL_STATUSES.forEach((status) => {
      expect(STATUS_LABELS[status]).toBeDefined();
    });
  });

  it("every label is a non-empty string", () => {
    ALL_STATUSES.forEach((status) => {
      expect(typeof STATUS_LABELS[status]).toBe("string");
      expect(STATUS_LABELS[status].trim().length).toBeGreaterThan(0);
    });
  });

  it("labels start with an uppercase letter (Title Case)", () => {
    ALL_STATUSES.forEach((status) => {
      const label = STATUS_LABELS[status];
      expect(label[0]).toBe(label[0].toUpperCase());
    });
  });

  it("covers exactly the same set as ALL_STATUSES (no missing, no extras)", () => {
    const labelKeys = Object.keys(STATUS_LABELS).sort();
    const allStatusesSorted = [...ALL_STATUSES].sort();
    expect(labelKeys).toEqual(allStatusesSorted);
  });
});

describe("PRICING_TIERS", () => {
  it("contains at least 3 tiers", () => {
    expect(PRICING_TIERS.length).toBeGreaterThanOrEqual(3);
  });

  it("every tier has required fields with valid types", () => {
    PRICING_TIERS.forEach((tier) => {
      expect(typeof tier.name).toBe("string");
      expect(tier.name.length).toBeGreaterThan(0);
      expect(typeof tier.setupMin).toBe("number");
      expect(typeof tier.setupMax).toBe("number");
      expect(typeof tier.monthly).toBe("number");
      expect(typeof tier.sessionRate).toBe("number");
      expect(Array.isArray(tier.features)).toBe(true);
      expect(typeof tier.agentNative).toBe("boolean");
    });
  });

  it("setupMax is always >= setupMin for every tier", () => {
    PRICING_TIERS.forEach((tier) => {
      expect(tier.setupMax).toBeGreaterThanOrEqual(tier.setupMin);
    });
  });

  it("all numeric pricing values are non-negative", () => {
    PRICING_TIERS.forEach((tier) => {
      expect(tier.setupMin).toBeGreaterThanOrEqual(0);
      expect(tier.setupMax).toBeGreaterThanOrEqual(0);
      expect(tier.monthly).toBeGreaterThanOrEqual(0);
      expect(tier.sessionRate).toBeGreaterThanOrEqual(0);
    });
  });

  it("every tier has at least one feature listed", () => {
    PRICING_TIERS.forEach((tier) => {
      expect(tier.features.length).toBeGreaterThan(0);
    });
  });

  it("at least one tier is agent-native", () => {
    expect(PRICING_TIERS.some((t) => t.agentNative)).toBe(true);
  });

  it("tier names are unique", () => {
    const names = PRICING_TIERS.map((t) => t.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });
});
