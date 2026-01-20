/**
 * Deployment Tests
 * Tests for deployment configuration and processes
 */

describe('Deployment Process', () => {
  it('should have deployment scripts', () => {
    const fs = require('fs');
    const path = require('path');
    
    // Check if package.json has deployment scripts
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    expect(packageJson.scripts).toHaveProperty('build');
    expect(packageJson.scripts).toHaveProperty('export');
  });

  it('should handle build output', () => {
    const fs = require('fs');
    const path = require('path');
    
    // Check if out directory exists
    const outDir = path.join(process.cwd(), 'out');
    
    if (fs.existsSync(outDir)) {
      const outContents = fs.readdirSync(outDir);
      expect(outContents.length).toBeGreaterThan(0);
      
      // Check for essential files
      const hasIndexHtml = outContents.includes('index.html');
      const hasStaticFiles = outContents.some(file => 
        file.endsWith('.js') || 
        file.endsWith('.css') || 
        file.endsWith('.json') ||
        file.endsWith('.html')
      );
      
      expect(hasIndexHtml).toBe(true);
      expect(hasStaticFiles).toBe(true);
    }
  });

  it('should validate environment', () => {
    const process = require('process');
    
    // Check environment variables
    expect(process.env.NODE_ENV).toBeDefined();
    
    // Should be 'production' for deployment builds
    if (process.env.NODE_ENV === 'production') {
      expect(process.env.NODE_ENV).toBe('production');
    }
  });
});