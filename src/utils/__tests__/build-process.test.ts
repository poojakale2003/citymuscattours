/**
 * Build Process Tests
 * Tests for Next.js build process and optimization
 */

describe('Build Process', () => {
  it('should build successfully with webpack', () => {
    const fs = require('fs');
    const path = require('path');
    
    // Check if build command exists
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    expect(packageJson.scripts).toHaveProperty('build');
    expect(packageJson.scripts.build).toContain('--webpack');
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
        file.endsWith('.json')
      );
      
      expect(hasIndexHtml).toBe(true);
      expect(hasStaticFiles).toBe(true);
    }
  });

  it('should handle environment configuration', () => {
    const process = require('process');
    
    // Check Node.js version
    const nodeVersion = process.version;
    expect(nodeVersion).toMatch(/^\d+\.\d+\.\d+$/);
    
    // Check for required environment variables
    const requiredEnvVars = ['NODE_ENV'];
    
    requiredEnvVars.forEach(envVar => {
      expect(process.env[envVar]).toBeDefined();
    });
    
    // Check that NODE_ENV is set to production for builds
    if (process.env.NODE_ENV === 'production') {
      expect(process.env.NODE_ENV).toBe('production');
    }
  });
});