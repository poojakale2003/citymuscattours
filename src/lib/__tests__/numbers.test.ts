import { formatNumber } from '../numbers';

describe('numbers utilities', () => {
  describe('formatNumber', () => {
    it('should format number with default locale', () => {
      const result = formatNumber(1234.56);
      expect(result).toBe('1,234.56');
    });

    it('should format number with custom options', () => {
      const result = formatNumber(1234.56, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      expect(result).toBe('1,234.56');
    });

    it('should format number with custom locale', () => {
      const result = formatNumber(1234.56, undefined, 'de-DE');
      expect(result).toContain('1');
    });

    it('should handle zero', () => {
      const result = formatNumber(0);
      expect(result).toBe('0');
    });

    it('should handle negative numbers', () => {
      const result = formatNumber(-1234.56);
      expect(result).toContain('-');
    });

    it('should handle large numbers', () => {
      const result = formatNumber(1234567.89);
      expect(result).toContain('1,234,567');
    });
  });
});

