import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merges conditional classes", () => {
    expect(cn("a", "b", "c")).toBe("a c");
  });

  it("lets tailwind-merge dedupe conflicting classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});