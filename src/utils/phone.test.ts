import { describe, expect, it } from "vitest";
import {
  getComparablePhoneKey,
  isE164Phone,
  normalizePhoneInput,
  normalizePhoneToE164,
} from "./phone";

describe("phone utils", () => {
  it("normalizes a formatted international phone number", () => {
    expect(normalizePhoneInput("+52 1 81 1468 4648")).toBe("+5218114684648");
    expect(normalizePhoneInput("+1 (415) 555-2671")).toBe("+14155552671");
  });

  it("keeps non-plus values non-e164", () => {
    expect(normalizePhoneInput("52 1 81 1468 4648")).toBe("5218114684648");
    expect(normalizePhoneToE164("52 1 81 1468 4648")).toBeNull();
  });

  it("validates strict e164 values", () => {
    expect(isE164Phone("+14155552671")).toBe(true);
    expect(isE164Phone("+5218114684648")).toBe(true);
    expect(isE164Phone("14155552671")).toBe(false);
    expect(isE164Phone("+0123456789")).toBe(false);
  });

  it("returns the same comparable key for equivalent formatted values", () => {
    expect(getComparablePhoneKey("+52 1 81 1468 4648")).toBe("5218114684648");
    expect(getComparablePhoneKey("+5218114684648")).toBe("5218114684648");
  });

  it("rejects unsupported characters when converting to e164", () => {
    expect(normalizePhoneToE164("+52 1 81 1468 46AB")).toBeNull();
  });
});

