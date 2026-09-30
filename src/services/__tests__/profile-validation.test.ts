// src/services/__tests__/profile-validation.test.ts
import { describe, expect, it } from '@jest/globals';
import { errorMessage } from '../errors';

function validateHeight(input: string): { valid: boolean; value: number | null; error?: string } {
  const trimmed = input.trim();
  if (!trimmed) return { valid: true, value: null };

  const num = Number(trimmed);
  if (!Number.isInteger(num) || Number.isNaN(num) || num < 90 || num > 250) {
    return { valid: false, value: null, error: 'Height must be a whole number between 90 and 250 cm.' };
  }
  return { valid: true, value: num };
}

function sanitizeDisplayName(name: string): string {
  return name.replace(/[\u200B-\u200D\uFEFF\u202A-\u202E\r\n]/g, '').trim();
}

describe('Profile Validation Rules & Security Guards', () => {
  describe('Height Validation Boundary & NaN Ingestion', () => {
    it('accepts valid integers within 90-250 range', () => {
      expect(validateHeight('180')).toEqual({ valid: true, value: 180 });
      expect(validateHeight('90')).toEqual({ valid: true, value: 90 });
      expect(validateHeight('250')).toEqual({ valid: true, value: 250 });
    });

    it('rejects alphanumeric strings and NaN equivalents', () => {
      expect(validateHeight('abc').valid).toBe(false);
      expect(validateHeight('NaN').valid).toBe(false);
      expect(validateHeight('180cm').valid).toBe(false);
      expect(validateHeight('undefined').valid).toBe(false);
    });

    it('rejects floating point numbers', () => {
      expect(validateHeight('182.5').valid).toBe(false);
    });

    it('rejects numbers strictly outside boundary range', () => {
      expect(validateHeight('89').valid).toBe(false);
      expect(validateHeight('251').valid).toBe(false);
      expect(validateHeight('-180').valid).toBe(false);
    });

    it('handles empty or whitespace input as null', () => {
      expect(validateHeight('   ')).toEqual({ valid: true, value: null });
      expect(validateHeight('')).toEqual({ valid: true, value: null });
    });
  });

  describe('Name Sanitization & Unicode Cloaking', () => {
    it('strips right-to-left override tokens and zero-width spaces', () => {
      const maliciousName = '\u202E\u200BJohn\u200D Doe';
      expect(sanitizeDisplayName(maliciousName)).toBe('John Doe');
    });

    it('strips newlines from display names', () => {
      const multiline = 'Jane\n\rSmith';
      expect(sanitizeDisplayName(multiline)).toBe('JaneSmith');
    });
  });

  describe('Error Message Masking', () => {
    it('masks internal PostgreSQL check constraints and returns safe advice', () => {
      const rawError = {
        message: 'new row for relation "profiles" violates check constraint "profiles_lifestyle_values_check"',
      };
      expect(errorMessage(rawError)).toBe('One of the selected lifestyle attributes is invalid.');
    });

    it('masks height check constraint violation', () => {
      const rawError = {
        message: 'new row for relation "profiles" violates check constraint "profiles_height_cm_check"',
      };
      expect(errorMessage(rawError)).toBe('Please enter a valid height between 90 and 250 cm.');
    });

    it('masks database syntax and table names completely', () => {
      const dbError = { message: 'syntax error at or near "SELECT" in table public.profiles' };
      expect(errorMessage(dbError)).toBe('Something went wrong. Please try again.');
    });
  });
});
