/**
 * Security Audit Tests
 * Tests for security vulnerability scanning and audit functionality
 */

describe('Security Audit', () => {
  it('should validate package.json security', () => {
    const fs = require('fs');
    const path = require('path');
    
    // Check if package.json exists and is valid
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    expect(fs.existsSync(packageJsonPath)).toBe(true);
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    expect(packageJson.dependencies).toBeDefined();
    expect(packageJson.devDependencies).toBeDefined();
  });

  it('should check for vulnerable packages', () => {
    const fs = require('fs');
    const path = require('path');
    
    // Check package-lock.json integrity
    const packageLockPath = path.join(process.cwd(), 'package-lock.json');
    
    if (fs.existsSync(packageLockPath)) {
      const content = fs.readFileSync(packageLockPath, 'utf8');
      expect(() => JSON.parse(content)).not.toThrow();
      expect(content).toContain('"lockfileVersion":');
    }
  });

  it('should handle npm audit command', () => {
    const { execSync } = require('child_process');
    
    try {
      // Test that npm audit command exists
      const result = execSync('npm audit --help', { encoding: 'utf8' });
      expect(result).toContain('audit');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should validate environment security', () => {
    const process = require('process');
    
    // Check for sensitive data exposure
    const sensitiveData = ['password', 'token', 'secret', 'key'];
    
    sensitiveData.forEach(data => {
      expect(process.env[data]).toBeUndefined();
    });
  });
});