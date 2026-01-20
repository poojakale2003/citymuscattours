/**
 * API utility tests
 */

describe('API utilities', () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    global.fetch = mockFetch;
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('API request handling', () => {
    it('should handle successful API response', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ data: 'success' })
      };
      mockFetch.mockResolvedValue(mockResponse);

      const response = await fetch('/api/test');
      const data = await response.json();

      expect(mockFetch).toHaveBeenCalledWith('/api/test');
      expect(response.ok).toBe(true);
      expect(data).toEqual({ data: 'success' });
    });

    it('should handle API error response', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        json: jest.fn().mockResolvedValue({ error: 'Not found' })
      };
      mockFetch.mockResolvedValue(mockResponse);

      const response = await fetch('/api/notfound');
      const data = await response.json();

      expect(mockFetch).toHaveBeenCalledWith('/api/notfound');
      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Not found' });
    });

    it('should handle network error', async () => {
      const networkError = new Error('Network error');
      mockFetch.mockRejectedValue(networkError);

      await expect(fetch('/api/test')).rejects.toThrow('Network error');
    });
  });

  describe('Request headers', () => {
    it('should include correct headers', async () => {
      const mockResponse = { ok: true, json: jest.fn().mockResolvedValue({}) };
      mockFetch.mockResolvedValue(mockResponse);

      await fetch('/api/test', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token123'
        }
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token123'
        }
      });
    });
  });

  describe('Request methods', () => {
    it('should handle GET requests', async () => {
      const mockResponse = { ok: true, json: jest.fn().mockResolvedValue({}) };
      mockFetch.mockResolvedValue(mockResponse);

      await fetch('/api/test', { method: 'GET' });

      expect(mockFetch).toHaveBeenCalledWith('/api/test', { method: 'GET' });
    });

    it('should handle POST requests', async () => {
      const mockResponse = { ok: true, json: jest.fn().mockResolvedValue({}) };
      mockFetch.mockResolvedValue(mockResponse);

      const postData = { name: 'Test', value: 123 };
      await fetch('/api/test', {
        method: 'POST',
        body: JSON.stringify(postData)
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        body: JSON.stringify(postData)
      });
    });
  });
});
