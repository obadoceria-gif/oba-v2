/**
 * Unit Tests: Core Utilities
 * 
 * Testes para currency, date e format utilities
 */

import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  parseCurrency,
  isValidCurrency,
  sumCurrency,
  multiplyCurrency
} from '../src/core/utils/currency.js';
import {
  formatDate,
  parseDate,
  isValidDate,
  getCurrentDate,
  getCurrentTimestamp,
  compareDates,
  addDays
} from '../src/core/utils/date.js';
import {
  formatPhone,
  unformatPhone,
  generateId,
  generateUUID,
  capitalize,
  truncate,
  removeAccents,
  formatCPF,
  formatCNPJ,
  sanitizeForId
} from '../src/core/utils/format.js';

describe('Currency Utilities', () => {
  describe('formatCurrency', () => {
    it('should format cents to Brazilian currency', () => {
      const result1 = formatCurrency(1250);
      const result2 = formatCurrency(100);
      const result3 = formatCurrency(99);
      const result4 = formatCurrency(0);
      
      expect(result1).toContain('12,50');
      expect(result2).toContain('1,00');
      expect(result3).toContain('0,99');
      expect(result4).toContain('0,00');
    });

    it('should handle large values', () => {
      const result = formatCurrency(123456789);
      expect(result).toContain('1.234.567,89');
    });

    it('should throw on invalid input', () => {
      expect(() => formatCurrency('invalid')).toThrow();
      expect(() => formatCurrency(NaN)).toThrow();
    });
  });

  describe('parseCurrency', () => {
    it('should parse Brazilian currency to cents', () => {
      expect(parseCurrency('R$ 12,50')).toBe(1250);
      expect(parseCurrency('12,50')).toBe(1250);
      expect(parseCurrency('12,50')).toBe(1250); // Formato brasileiro
      expect(parseCurrency('1.234,56')).toBe(123456);
    });

    it('should handle values without decimals', () => {
      expect(parseCurrency('10')).toBe(1000);
      expect(parseCurrency('R$ 100')).toBe(10000);
    });

    it('should throw on invalid input', () => {
      expect(() => parseCurrency(123)).toThrow();
      expect(() => parseCurrency('abc')).toThrow();
    });
  });

  describe('isValidCurrency', () => {
    it('should validate currency values', () => {
      expect(isValidCurrency(0)).toBe(true);
      expect(isValidCurrency(1250)).toBe(true);
      expect(isValidCurrency(999999)).toBe(true);
    });

    it('should reject invalid values', () => {
      expect(isValidCurrency(-100)).toBe(false);
      expect(isValidCurrency(NaN)).toBe(false);
      expect(isValidCurrency('100')).toBe(false);
    });
  });

  describe('sumCurrency', () => {
    it('should sum currency values', () => {
      expect(sumCurrency(100, 200, 300)).toBe(600);
      expect(sumCurrency(1250, 2500)).toBe(3750);
    });

    it('should handle single value', () => {
      expect(sumCurrency(100)).toBe(100);
    });

    it('should handle empty sum', () => {
      expect(sumCurrency()).toBe(0);
    });

    it('should throw on invalid values', () => {
      expect(() => sumCurrency(100, -50)).toThrow();
      expect(() => sumCurrency(100, NaN)).toThrow();
    });
  });

  describe('multiplyCurrency', () => {
    it('should multiply currency by quantity', () => {
      expect(multiplyCurrency(1250, 2)).toBe(2500);
      expect(multiplyCurrency(333, 3)).toBe(999);
    });

    it('should handle decimal quantities', () => {
      expect(multiplyCurrency(1000, 1.5)).toBe(1500);
      expect(multiplyCurrency(100, 2.5)).toBe(250);
    });

    it('should throw on invalid inputs', () => {
      expect(() => multiplyCurrency(-100, 2)).toThrow();
      expect(() => multiplyCurrency(100, -2)).toThrow();
      expect(() => multiplyCurrency(100, NaN)).toThrow();
    });
  });
});

describe('Date Utilities', () => {
  describe('formatDate', () => {
    it('should format ISO date to Brazilian format', () => {
      expect(formatDate('2024-01-15')).toBe('15/01/2024');
      expect(formatDate('2024-12-31')).toBe('31/12/2024');
    });

    it('should handle ISO timestamp', () => {
      expect(formatDate('2024-01-15T10:30:00.000Z')).toBe('15/01/2024');
    });

    it('should throw on invalid input', () => {
      expect(() => formatDate(123)).toThrow();
      expect(() => formatDate('invalid')).toThrow();
    });
  });

  describe('parseDate', () => {
    it('should parse Brazilian date to ISO', () => {
      expect(parseDate('15/01/2024')).toBe('2024-01-15');
      expect(parseDate('31/12/2024')).toBe('2024-12-31');
    });

    it('should handle single digit days/months', () => {
      expect(parseDate('5/1/2024')).toBe('2024-01-05');
    });

    it('should throw on invalid input', () => {
      expect(() => parseDate(123)).toThrow();
      expect(() => parseDate('invalid')).toThrow();
      expect(() => parseDate('32/01/2024')).toThrow();
      expect(() => parseDate('15/13/2024')).toThrow();
    });
  });

  describe('isValidDate', () => {
    it('should validate ISO dates', () => {
      expect(isValidDate('2024-01-15')).toBe(true);
      expect(isValidDate('2024-12-31')).toBe(true);
      expect(isValidDate('2024-01-15T10:30:00.000Z')).toBe(true);
    });

    it('should reject invalid dates', () => {
      expect(isValidDate('invalid')).toBe(false);
      expect(isValidDate('2024-13-01')).toBe(false);
      expect(isValidDate('2024-01-32')).toBe(false);
      expect(isValidDate(123)).toBe(false);
    });
  });

  describe('getCurrentDate', () => {
    it('should return current date in ISO format', () => {
      const date = getCurrentDate();
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(isValidDate(date)).toBe(true);
    });
  });

  describe('getCurrentTimestamp', () => {
    it('should return current timestamp in ISO format', () => {
      const timestamp = getCurrentTimestamp();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(isValidDate(timestamp)).toBe(true);
    });
  });

  describe('compareDates', () => {
    it('should compare dates correctly', () => {
      expect(compareDates('2024-01-15', '2024-01-20')).toBe(-1);
      expect(compareDates('2024-01-20', '2024-01-15')).toBe(1);
      expect(compareDates('2024-01-15', '2024-01-15')).toBe(0);
    });

    it('should throw on invalid dates', () => {
      expect(() => compareDates('invalid', '2024-01-15')).toThrow();
    });
  });

  describe('addDays', () => {
    it('should add days to date', () => {
      expect(addDays('2024-01-15', 5)).toBe('2024-01-20');
      expect(addDays('2024-01-15', -5)).toBe('2024-01-10');
    });

    it('should handle month/year transitions', () => {
      expect(addDays('2024-01-31', 1)).toBe('2024-02-01');
      expect(addDays('2024-12-31', 1)).toBe('2025-01-01');
    });

    it('should throw on invalid inputs', () => {
      expect(() => addDays('invalid', 5)).toThrow();
      expect(() => addDays('2024-01-15', 'invalid')).toThrow();
    });
  });
});

describe('Format Utilities', () => {
  describe('formatPhone', () => {
    it('should format 11-digit phone (celular)', () => {
      expect(formatPhone('11987654321')).toBe('(11) 98765-4321');
      expect(formatPhone('21912345678')).toBe('(21) 91234-5678');
    });

    it('should format 10-digit phone (fixo)', () => {
      expect(formatPhone('1133334444')).toBe('(11) 3333-4444');
      expect(formatPhone('2122223333')).toBe('(21) 2222-3333');
    });

    it('should handle already formatted phones', () => {
      expect(formatPhone('(11) 98765-4321')).toBe('(11) 98765-4321');
      expect(formatPhone('(11) 3333-4444')).toBe('(11) 3333-4444');
    });

    it('should throw on invalid input', () => {
      expect(() => formatPhone(123)).toThrow();
      expect(() => formatPhone('123')).toThrow();
      expect(() => formatPhone('123456789012')).toThrow();
    });
  });

  describe('unformatPhone', () => {
    it('should remove phone formatting', () => {
      expect(unformatPhone('(11) 98765-4321')).toBe('11987654321');
      expect(unformatPhone('(11) 3333-4444')).toBe('1133334444');
    });

    it('should handle unformatted phones', () => {
      expect(unformatPhone('11987654321')).toBe('11987654321');
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
      expect(id2).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('generateUUID', () => {
    it('should generate valid UUIDs', () => {
      const uuid = generateUUID();
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('capitalize', () => {
    it('should capitalize words', () => {
      expect(capitalize('hello world')).toBe('Hello World');
      expect(capitalize('HELLO WORLD')).toBe('Hello World');
      expect(capitalize('hello')).toBe('Hello');
    });

    it('should handle empty string', () => {
      expect(capitalize('')).toBe('');
    });

    it('should handle non-string input', () => {
      expect(capitalize(123)).toBe('');
    });
  });

  describe('truncate', () => {
    it('should truncate long text', () => {
      expect(truncate('Hello World', 8)).toBe('Hello...');
      expect(truncate('Hello World', 5)).toBe('He...');
    });

    it('should not truncate short text', () => {
      expect(truncate('Hello', 10)).toBe('Hello');
    });

    it('should handle empty string', () => {
      expect(truncate('', 5)).toBe('');
    });
  });

  describe('removeAccents', () => {
    it('should remove accents', () => {
      expect(removeAccents('José')).toBe('Jose');
      expect(removeAccents('São Paulo')).toBe('Sao Paulo');
      expect(removeAccents('açúcar')).toBe('acucar');
    });

    it('should handle text without accents', () => {
      expect(removeAccents('Hello')).toBe('Hello');
    });
  });

  describe('formatCPF', () => {
    it('should format CPF', () => {
      expect(formatCPF('12345678901')).toBe('123.456.789-01');
    });

    it('should handle already formatted CPF', () => {
      expect(formatCPF('123.456.789-01')).toBe('123.456.789-01');
    });

    it('should throw on invalid input', () => {
      expect(() => formatCPF('123')).toThrow();
      expect(() => formatCPF(123)).toThrow();
    });
  });

  describe('formatCNPJ', () => {
    it('should format CNPJ', () => {
      expect(formatCNPJ('12345678000190')).toBe('12.345.678/0001-90');
    });

    it('should handle already formatted CNPJ', () => {
      expect(formatCNPJ('12.345.678/0001-90')).toBe('12.345.678/0001-90');
    });

    it('should throw on invalid input', () => {
      expect(() => formatCNPJ('123')).toThrow();
      expect(() => formatCNPJ(123)).toThrow();
    });
  });

  describe('sanitizeForId', () => {
    it('should sanitize text for HTML IDs', () => {
      expect(sanitizeForId('Hello World')).toBe('hello-world');
      expect(sanitizeForId('São Paulo')).toBe('sao-paulo');
      expect(sanitizeForId('Test@123')).toBe('test-123');
    });

    it('should remove leading/trailing dashes', () => {
      expect(sanitizeForId('  Hello  ')).toBe('hello');
      expect(sanitizeForId('---test---')).toBe('test');
    });

    it('should handle empty string', () => {
      expect(sanitizeForId('')).toBe('');
    });
  });
});
