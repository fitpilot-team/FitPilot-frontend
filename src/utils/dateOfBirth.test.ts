import { describe, expect, it } from 'vitest';
import { calculateAgeFromDateOfBirth } from './dateOfBirth';

describe('calculateAgeFromDateOfBirth', () => {
  it('returns undefined for missing values', () => {
    expect(calculateAgeFromDateOfBirth(null)).toBeUndefined();
    expect(calculateAgeFromDateOfBirth(undefined)).toBeUndefined();
    expect(calculateAgeFromDateOfBirth('')).toBeUndefined();
  });

  it('returns undefined for invalid or future dates', () => {
    const now = new Date(2026, 2, 12, 12, 0, 0);
    expect(calculateAgeFromDateOfBirth('invalid-date', now)).toBeUndefined();
    expect(calculateAgeFromDateOfBirth('2030-01-01', now)).toBeUndefined();
  });

  it('calculates full years correctly around birthday boundary', () => {
    const now = new Date(2026, 2, 12, 12, 0, 0);

    expect(calculateAgeFromDateOfBirth('2000-03-11', now)).toBe(26);
    expect(calculateAgeFromDateOfBirth('2000-03-12', now)).toBe(26);
    expect(calculateAgeFromDateOfBirth('2000-03-13', now)).toBe(25);
  });
});
