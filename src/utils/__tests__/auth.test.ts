import {
  saveToken,
  getToken,
  saveRefreshToken,
  getRefreshToken,
  clearToken,
  clearAccessToken,
  clearRefreshToken,
  isAuthenticated,
  isTokenExpired,
} from '../auth';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('auth utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveToken', () => {
    it('should save token to localStorage', () => {
      const token = 'test-token-123';
      const result = saveToken(token);
      expect(result).toBe(true);
      expect(getToken()).toBe(token);
    });

    it('should return false for invalid token', () => {
      const result = saveToken('');
      expect(result).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should return null when no token is stored', () => {
      expect(getToken()).toBeNull();
    });

    it('should return stored token', () => {
      const token = 'test-token-123';
      saveToken(token);
      expect(getToken()).toBe(token);
    });
  });

  describe('saveRefreshToken', () => {
    it('should save refresh token to localStorage', () => {
      const refreshToken = 'refresh-token-123';
      const result = saveRefreshToken(refreshToken);
      expect(result).toBe(true);
      expect(getRefreshToken()).toBe(refreshToken);
    });

    it('should return false for invalid refresh token', () => {
      const result = saveRefreshToken('');
      expect(result).toBe(false);
    });
  });

  describe('getRefreshToken', () => {
    it('should return null when no refresh token is stored', () => {
      expect(getRefreshToken()).toBeNull();
    });

    it('should return stored refresh token', () => {
      const refreshToken = 'refresh-token-123';
      saveRefreshToken(refreshToken);
      expect(getRefreshToken()).toBe(refreshToken);
    });
  });

  describe('clearToken', () => {
    it('should clear both tokens', () => {
      saveToken('test-token');
      saveRefreshToken('refresh-token');
      clearToken('user logout');
      expect(getToken()).toBeNull();
    });
  });

  describe('clearAccessToken', () => {
    it('should clear access token', () => {
      saveToken('test-token');
      clearAccessToken();
      expect(getToken()).toBeNull();
    });
  });

  describe('clearRefreshToken', () => {
    it('should clear refresh token when reason indicates invalid', () => {
      saveRefreshToken('refresh-token');
      clearRefreshToken('Invalid refresh token');
      expect(getRefreshToken()).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no token', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('should return true when token exists', () => {
      saveToken('test-token');
      expect(isAuthenticated()).toBe(true);
    });
  });

  describe('isTokenExpired', () => {
    it('should return true for null token', () => {
      expect(isTokenExpired(null)).toBe(true);
    });

    it('should return true for invalid token format', () => {
      expect(isTokenExpired('invalid-token')).toBe(true);
    });

    it('should return false for valid non-expired token', () => {
      // Create a JWT token with future expiration
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
      const signature = 'test-signature';
      const token = `${header}.${payload}.${signature}`;
      expect(isTokenExpired(token)).toBe(false);
    });

    it('should return true for expired token', () => {
      // Create a JWT token with past expiration
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 3600 }));
      const signature = 'test-signature';
      const token = `${header}.${payload}.${signature}`;
      expect(isTokenExpired(token)).toBe(true);
    });
  });
});

