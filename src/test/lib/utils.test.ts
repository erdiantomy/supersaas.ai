import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("returns empty string with no arguments", () => {
    expect(cn()).toBe("");
  });

  it("merges multiple class strings", () => {
    expect(cn("foo", "bar", "baz")).toBe("foo bar baz");
  });

  it("drops falsy values (false, null, undefined, empty string)", () => {
    expect(cn("foo", false, null, undefined, "", "bar")).toBe("foo bar");
  });

  it("handles conditional object notation — truthy keys included", () => {
    expect(cn({ "text-primary": true, "text-secondary": false })).toBe("text-primary");
  });

  it("handles array inputs", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });

  it("resolves Tailwind conflicts — last class wins for same property", () => {
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  });

  it("resolves padding conflicts", () => {
    expect(cn("p-4", "px-2")).toBe("p-4 px-2");
    // More specific axis overrides shorthand
    expect(cn("px-4", "px-2")).toBe("px-2");
  });

  it("handles mixed inputs: string, object, array", () => {
    expect(cn("base", { "extra-a": true, "extra-b": false }, ["array-class"])).toBe(
      "base extra-a array-class"
    );
  });

  it("preserves non-conflicting Tailwind classes", () => {
    const result = cn("text-sm", "font-bold", "text-primary");
    expect(result).toContain("text-sm");
    expect(result).toContain("font-bold");
    expect(result).toContain("text-primary");
  });
});
