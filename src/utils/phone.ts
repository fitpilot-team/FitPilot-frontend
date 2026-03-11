const E164_REGEX = /^\+[1-9]\d{1,14}$/;
const PHONE_ALLOWED_CHARS_REGEX = /^[+\d\s().-]+$/;

export const normalizePhoneInput = (value: unknown): string | null => {
  if (typeof value !== "string") return null;

  const trimmedValue = value.trim();
  if (!trimmedValue) return null;

  if (!PHONE_ALLOWED_CHARS_REGEX.test(trimmedValue)) {
    return trimmedValue;
  }

  const plusMatches = trimmedValue.match(/\+/g) ?? [];
  if (plusMatches.length > 1 || (plusMatches.length === 1 && !trimmedValue.startsWith("+"))) {
    return trimmedValue;
  }

  const digits = trimmedValue.replace(/\D/g, "");
  if (!digits) {
    return trimmedValue;
  }

  return trimmedValue.startsWith("+") ? `+${digits}` : digits;
};

export const isE164Phone = (value: unknown): value is string => {
  return typeof value === "string" && E164_REGEX.test(value);
};

export const normalizePhoneToE164 = (value: unknown): string | null => {
  const normalizedValue = normalizePhoneInput(value);
  if (!normalizedValue) return null;

  return isE164Phone(normalizedValue) ? normalizedValue : null;
};

export const getComparablePhoneKey = (value: unknown): string | null => {
  const normalizedValue = normalizePhoneInput(value);
  if (!normalizedValue) return null;

  const digits = normalizedValue.replace(/\D/g, "");
  return digits || null;
};

