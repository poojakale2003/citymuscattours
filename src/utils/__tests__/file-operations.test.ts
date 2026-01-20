/**
 * File Operations Tests
 * Tests for file system operations and utilities
 */

describe('File Operations', () => {
  it('should read files correctly', () => {
    const fs = require('fs');
    const path = require('path');
    
    // Test reading a file
    const testFilePath = path.join(process.cwd(), 'package.json');
    expect(fs.existsSync(testFilePath)).toBe(true);
    
    const content = fs.readFileSync(testFilePath, 'utf8');
    expect(content).toBeDefined();
    expect(typeof content).toBe('string');
    expect(content.length).toBeGreaterThan(0);
  });

  it('should write files correctly', () => {
    const fs = require('fs');
    const path = require('path');
    
    // Test writing a file
    const testContent = 'test content';
    const testFilePath = path.join(process.cwd(), 'test-write.txt');
    
    fs.writeFileSync(testFilePath, testContent);
    
    const writtenContent = fs.readFileSync(testFilePath, 'utf8');
    expect(writtenContent).toBe(testContent);
    
    // Clean up
    fs.unlinkSync(testFilePath);
  });

  it('should handle file paths correctly', () => {
    const path = require('path');
    
    // Test path operations
    const testDir = path.join(process.cwd(), 'test');
    const testFile = path.join(testDir, 'test.txt');
    
    expect(path.basename(testFile)).toBe('test.txt');
    expect(path.dirname(testFile)).toBe(testDir);
    expect(path.extname(testFile)).toBe('.txt');
  });

  it('should handle directory operations', () => {
    const fs = require('fs');
    const path = require('path');
    
    // Test directory operations
    const testDir = path.join(process.cwd(), 'test-dir');
    
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir);
      expect(fs.existsSync(testDir)).toBe(true);
      
      // Test creating files in directory
      const testFile = path.join(testDir, 'nested.txt');
      fs.writeFileSync(testFile, 'nested content');
      
      const files = fs.readdirSync(testDir);
      expect(files).toContain('nested.txt');
      
      // Clean up
      fs.rmSync(testDir, { recursive: true });
      expect(fs.existsSync(testDir)).toBe(false);
    }
  });
});
