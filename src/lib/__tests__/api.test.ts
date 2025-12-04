// Mock fetch globally
global.fetch = jest.fn();

describe('API utilities', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('should have fetch available', () => {
    expect(global.fetch).toBeDefined();
  });

  // Note: The api.ts file has complex token refresh logic
  // that would require more extensive mocking
  // These are basic tests to ensure test framework is working
});

