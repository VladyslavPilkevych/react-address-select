import { describe, expect, it } from "vitest";
import { distanceMeters } from "./distance";

describe("distanceMeters", () => {
  it("returns ~0 for same point", () => {
    const a = { lat: 48.1486, lon: 17.1077 };
    const d = distanceMeters(a, a);
    expect(d).toBeLessThan(0.001);
  });

  it("returns a plausible distance between Bratislava and Vienna", () => {
    const br = { lat: 48.1486, lon: 17.1077 };
    const vi = { lat: 48.2082, lon: 16.3738 };
    const d = distanceMeters(br, vi);
    expect(d).toBeGreaterThan(40000);
    expect(d).toBeLessThan(90000);
  });
});
