/**
 * Security Audit Tests
 * Tests for security vulnerability scanning and audit functionality
 */

describe('Security Audit', () => {
  describe('npm audit command', () => {
    it('should detect moderate vulnerabilities', () => {
      // This test simulates finding moderate vulnerabilities
      const mockAuditResult = {
        vulnerabilities: [
          {
            name: 'test-package',
            severity: 'moderate',
            url: 'https://github.com/advisories/GHSA-test-123'
          },
          {
            name: 'another-package', 
            severity: 'low',
            url: 'https://github.com/advisories/GHSA-test-456'
          }
        ],
        metadata: {
          vulnerabilities: {
            info: 0,
            low: 1,
            moderate: 1,
            high: 0,
            critical: 0
          },
          dependencies: {
            production: 0,
            dev: 0,
            optional: 0,
            peer: 0,
            peer: 0
          }
        }
      };

      // Mock npm audit output
      const mockExec = jest.fn();
      mockExec.mockReturnValue(1, '', {
        stdout: JSON.stringify(mockAuditResult),
        stderr: ''
      });

      // Mock console methods
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;
      const originalConsoleWarn = console.warn;
      
      // Override console methods temporarily
      console.log = jest.fn();
      console.error = jest.fn();
      console.warn = jest.fn();

      // Import and run the audit function
      const { audit } = require('../../scripts/fix-paths.js');
      
      const result = audit();
      
      // Restore console methods
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;

      expect(result).toBe(true);
      expect(mockExec).toHaveBeenCalledWith('npm', ['audit', '--audit-level=moderate'], expect.any(Object));
    });

    it('should detect critical vulnerabilities', () => {
      // This test simulates finding critical vulnerabilities
      const mockAuditResult = {
        vulnerabilities: [
          {
            name: 'critical-package',
            severity: 'critical',
            url: 'https://github.com/advisories/GHSA-critical-123'
          }
        ],
        metadata: {
          vulnerabilities: {
            info: 0,
            low: 0,
            moderate: 0,
            high: 0,
            critical: 1
          },
          dependencies: {
            production: 0,
            dev: 0,
            optional: 0,
            peer: 0
          }
        }
      };

      // Mock npm audit output
      const mockExec = jest.fn();
      mockExec.mockReturnValue(1, '', {
        stdout: JSON.stringify(mockAuditResult),
        stderr: ''
      });

      // Mock console methods
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;
      const originalConsoleWarn = console.warn;
      
      // Override console methods temporarily
      console.log = jest.fn();
      console.error = jest.fn();
      console.warn = jest.fn();

      // Import and run the audit function
      const { audit } = require('../../scripts/fix-paths.js');
      
      const result = audit();
      
      // Restore console methods
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;

      expect(result).toBe(true);
      expect(mockExec).toHaveBeenCalledWith('npm', ['audit', '--audit-level=moderate'], expect.any(Object));
    });

    it('should handle no vulnerabilities', () => {
      // This test simulates no vulnerabilities found
      const mockAuditResult = {
        vulnerabilities: [],
        metadata: {
          vulnerabilities: {
            info: 0,
            low: 0,
            moderate: 0,
            high: 0,
            critical: 0
          },
          dependencies: {
            production: 0,
            dev: 0,
            optional: 0,
            peer: 0
          }
        }
      };

      // Mock npm audit output
      const mockExec = jest.fn();
      mockExec.mockReturnValue(0, '', {
        stdout: JSON.stringify(mockAuditResult),
        stderr: ''
      });

      // Mock console methods
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;
      const originalConsoleWarn = console.warn;
      
      // Override console methods temporarily
      console.log = jest.fn();
      console.error = jest.fn();
      console.warn = jest.fn();

      // Import and run the audit function
      const { audit } = require('../../scripts/fix-paths.js');
      
      const result = audit();
      
      // Restore console methods
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;

      expect(result).toBe(true);
      expect(mockExec).toHaveBeenCalledWith('npm', ['audit'], expect.any(Object));
    });

    it('should handle audit command failure', () => {
      // Mock npm audit failure
      const mockExec = jest.fn();
      mockExec.mockReturnValue(1, '', {
        stdout: '',
        stderr: 'npm ERR! audit command failed with exit code 1'
      });

      // Mock console methods
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;
      const originalConsoleWarn = console.warn;
      
      // Override console methods temporarily
      console.log = jest.fn();
      console.error = jest.fn();
      console.warn = jest.fn();

      // Import and run the audit function
      const { audit } = require('../../scripts/fix-paths.js');
      
      const result = audit();
      
      // Restore console methods
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;

      expect(result).toBe(false);
      expect(mockExec).toHaveBeenCalledWith('npm', ['audit'], expect.any(Object));
      expect(console.error).toHaveBeenCalledWith('npm ERR! audit command failed with exit code 1');
    });
  });

  describe('Dependency Security', () => {
    it('should check for known vulnerable packages', () => {
      // This test checks for known vulnerable package versions
      const vulnerablePackages = [
        'lodash<4.17.21',
        'request<2.88.2',
        'axios<0.21.1'
      ];

      // Mock package.json
      const mockPackageJson = {
        dependencies: {
          'lodash': '^4.17.21',
          'axios': '^0.21.1'
        }
      };

      // Check for vulnerable packages
      vulnerablePackages.forEach(pkg => {
        expect(mockPackageJson.dependencies[pkg]).toBeDefined();
      });
    });

    it('should validate package-lock.json integrity', () => {
      const fs = require('fs');
      const path = require('path');
      const packageLockPath = path.join(process.cwd(), 'package-lock.json');
      
      // Check if package-lock.json exists and is readable
      expect(fs.existsSync(packageLockPath)).toBe(true);
      
      if (fs.existsSync(packageLockPath)) {
        const content = fs.readFileSync(packageLockPath, 'utf8');
        expect(() => JSON.parse(content)).not.toThrow();
        expect(content).toContain('"lockfileVersion":');
      }
    });
  });

  describe('Environment Security', () => {
    it('should not expose sensitive data', () => {
      // This test checks that sensitive data is not exposed in CI/CD logs
      const sensitiveData = ['password', 'token', 'secret', 'key'];
      
      // Mock environment variables
      const originalEnv = process.env;
      
      // Mock environment with sensitive data
      const mockEnv = {
        ...originalEnv,
        SECRET_TOKEN: 'sensitive-token',
        DATABASE_PASSWORD: 'secret-password'
      };

      // Mock console methods
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;
      const originalConsoleWarn = console.warn;
      
      // Override console methods temporarily
      console.log = jest.fn();
      console.error = jest.fn();
      console.warn = jest.fn();

      // Temporarily set mock environment
      Object.assign(process.env, mockEnv);

      // Simulate CI/CD environment check
      sensitiveData.forEach(data => {
        expect(console.error).toHaveBeenCalledWith(
          expect.stringContaining(`Potential sensitive data exposure: ${data}`),
          expect.any(String)
        );
      });

      // Restore environment and console methods
      Object.assign(process.env, originalEnv);
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    });
  });
});
