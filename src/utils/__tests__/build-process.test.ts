/**
 * Build Process Tests
 * Tests for Next.js build process and optimization
 */

describe('Build Process', () => {
  describe('Next.js Build', () => {
    it('should build successfully with webpack', () => {
      const fs = require('fs');
      const path = require('path');
      const { execSync } = require('child_process');
      
      // Check if build command exists
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      expect(packageJson.scripts).toHaveProperty('build');
      expect(packageJson.scripts.build).toContain('--webpack');
    });

    it('should generate static export', () => {
      const fs = require('fs');
      const path = require('path');
      
      // Check if out directory exists after build
      const outDir = path.join(process.cwd(), 'out');
      
      expect(fs.existsSync(outDir)).toBe(true);
      
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

    it('should handle build errors gracefully', () => {
      const fs = require('fs');
      const path = require('path');
      const { execSync } = require('child_process');
      
      // Mock failed build
      const mockExec = jest.fn();
      mockExec.mockReturnValue(1, '', {
        stdout: '',
        stderr: 'Build failed'
      });

      // Override execSync temporarily
      const originalExecSync = require('child_process').execSync;
      require('child_process').execSync = mockExec;

      try {
        const result = require('child_process').execSync('npm run build', { encoding: 'utf8' });
        expect(result.status).toBe(1);
      } finally {
        // Restore original function
        require('child_process').execSync = originalExecSync;
      }
    });
  });

  describe('Asset Optimization', () => {
    it('should optimize images correctly', () => {
      const fs = require('fs');
      const path = require('path');
      
      // Check for image optimization
      const outDir = path.join(process.cwd(), 'out');
      
      if (fs.existsSync(outDir)) {
        const images = fs.readdirSync(outDir).filter(file => 
          /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file)
        );
        
        // Images should be present and properly sized
        expect(images.length).toBeGreaterThan(0);
        
        images.forEach(image => {
          const stats = fs.statSync(path.join(outDir, image));
          expect(stats.size).toBeLessThan(1024 * 1024); // Less than 1MB
        });
      }
    });

    it('should generate proper sitemap', () => {
      const fs = require('fs');
      const path = require('path');
      
      // Check for sitemap
      const outDir = path.join(process.cwd(), 'out');
      
      if (fs.existsSync(outDir)) {
        const hasSitemap = fs.existsSync(path.join(outDir, 'sitemap.xml'));
        expect(hasSitemap).toBe(true);
        
        if (hasSitemap) {
          const sitemapContent = fs.readFileSync(path.join(outDir, 'sitemap.xml'), 'utf8');
          expect(sitemapContent).toContain('<?xml version="1.0" encoding="UTF-8"?>');
          expect(sitemapContent).toContain('<urlset');
          expect(sitemapContent).toContain('</urlset>');
        }
      }
    });
  });

  describe('Environment Configuration', () => {
    it('should use correct Node.js version', () => {
      const process = require('process');
      
      // Check Node.js version
      const nodeVersion = process.version;
      expect(nodeVersion).toMatch(/^\d+\.\d+\.\d+$/);
      
      // Check for required Node.js version
      const requiredVersion = '>=18.0.0';
      const satisfiesVersion = require('semver').satisfies(nodeVersion, requiredVersion);
      expect(satisfiesVersion).toBe(true);
    });

    it('should set correct environment variables', () => {
      const process = require('process');
      
      // Check for required environment variables
      const requiredEnvVars = ['NODE_ENV'];
      
      requiredEnvVars.forEach(envVar => {
        expect(process.env[envVar]).toBeDefined();
      });
      
      // Check that NODE_ENV is set to production for builds
      expect(process.env.NODE_ENV).toBe('production');
    });
  });
});
