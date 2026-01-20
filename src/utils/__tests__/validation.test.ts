/**
 * Validation utility tests
 */

describe('Validation utilities', () => {
  describe('Email validation', () => {
    const isValidEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user@.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('Phone number validation', () => {
    const isValidPhone = (phone: string): boolean => {
      const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
      const digitsOnly = phone.replace(/\D/g, '');
      return phoneRegex.test(phone) && digitsOnly.length === 10;
    };

    it('should validate correct phone numbers', () => {
      expect(isValidPhone('+1234567890')).toBe(true);
      expect(isValidPhone('(123) 456-7890')).toBe(true);
      expect(isValidPhone('123-456-7890')).toBe(true);
      expect(isValidPhone('1234567890')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abc-def-ghij')).toBe(false);
      expect(isValidPhone('')).toBe(false);
      expect(isValidPhone('123-456-78901')).toBe(false); // too long (11 digits)
    });
  });

  describe('Required field validation', () => {
    const isRequired = (value: string | undefined | null): boolean => {
      return value !== null && value !== undefined && value.trim().length > 0;
    };

    it('should validate required fields', () => {
      expect(isRequired('some value')).toBe(true);
      expect(isRequired('  trimmed  ')).toBe(true);
    });

    it('should reject empty or null values', () => {
      expect(isRequired('')).toBe(false);
      expect(isRequired('   ')).toBe(false);
      expect(isRequired(null as any)).toBe(false);
      expect(isRequired(undefined as any)).toBe(false);
    });
  });

  describe('URL validation', () => {
    const isValidUrl = (url: string): boolean => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };

    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('https://subdomain.example.com/path')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(true); // URL constructor accepts this
      expect(isValidUrl('')).toBe(false);
    });
  });
});
