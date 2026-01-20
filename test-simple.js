// Simple test to check if Jest environment works
const { formatNumber } = require('./src/lib/numbers');

describe('Simple Test', () => {
  it('should work', () => {
    expect(formatNumber(123)).toBeDefined();
    expect(typeof formatNumber(123)).toBe('string');
  });
});