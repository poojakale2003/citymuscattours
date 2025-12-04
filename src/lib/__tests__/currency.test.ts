import {
  convertAmountToDisplayCurrency,
  formatDisplayCurrency,
  formatCompactCurrency,
  displayCurrencyCode,
  displayCurrencyLocale,
} from '../currency';

describe('currency utilities', () => {
  describe('convertAmountToDisplayCurrency', () => {
    it('should return the same value for OMR currency', () => {
      expect(convertAmountToDisplayCurrency(100, 'OMR')).toBe(100);
    });

    it('should return the same value for INR currency', () => {
      expect(convertAmountToDisplayCurrency(100, 'INR')).toBe(100);
    });

    it('should return 0 for non-finite values', () => {
      expect(convertAmountToDisplayCurrency(NaN)).toBe(0);
      expect(convertAmountToDisplayCurrency(Infinity)).toBe(0);
    });

    it('should handle default currency parameter', () => {
      expect(convertAmountToDisplayCurrency(100)).toBe(100);
    });
  });

  describe('formatDisplayCurrency', () => {
    it('should format currency with default options', () => {
      const result = formatDisplayCurrency(100);
      expect(result).toContain('OMR');
      expect(result).toContain('100');
    });

    it('should format currency with custom options', () => {
      const result = formatDisplayCurrency(100, 'INR', { minimumFractionDigits: 2 });
      expect(result).toContain('OMR');
    });

    it('should handle zero value', () => {
      const result = formatDisplayCurrency(0);
      expect(result).toContain('0');
    });
  });

  describe('formatCompactCurrency', () => {
    it('should format currency in compact notation', () => {
      const result = formatCompactCurrency(1000);
      expect(result).toContain('OMR');
    });

    it('should handle large numbers', () => {
      const result = formatCompactCurrency(1000000);
      expect(result).toContain('OMR');
    });
  });

  describe('constants', () => {
    it('should export displayCurrencyCode', () => {
      expect(displayCurrencyCode).toBe('OMR');
    });

    it('should export displayCurrencyLocale', () => {
      expect(displayCurrencyLocale).toBe('en-OM');
    });
  });
});

