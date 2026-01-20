/**
 * Package Validation Tests
 * Tests for package.json validation and dependencies
 */

describe('Package Validation', () => {
  it('should have valid package.json', () => {
    const fs = require('fs');
    const path = require('path');
    
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    expect(fs.existsSync(packageJsonPath)).toBe(true);
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Check for required fields
    expect(packageJson.name).toBeDefined();
    expect(packageJson.version).toBeDefined();
    expect(packageJson.scripts).toBeDefined();
    expect(packageJson.dependencies).toBeDefined();
    expect(packageJson.devDependencies).toBeDefined();
  });

  it('should have valid dependencies', () => {
    const fs = require('fs');
    const path = require('path');
    
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Check for React and Next.js
    expect(packageJson.dependencies.react).toBeDefined();
    expect(packageJson.dependencies.next).toBeDefined();
    expect(packageJson.devDependencies['@types/react']).toBeDefined();
    expect(packageJson.devDependencies['@types/react-dom']).toBeDefined();
  });

  it('should have build scripts', () => {
    const fs = require('fs');
    const path = require('path');
    
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Check for build and export scripts
    expect(packageJson.scripts.build).toBeDefined();
    expect(packageJson.scripts.export).toBeDefined();
    expect(packageJson.scripts.dev).toBeDefined();
    expect(packageJson.scripts.test).toBeDefined();
  });

  it('should have test configuration', () => {
    const fs = require('fs');
    const path = require('path');
    
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Check for Jest configuration
    expect(packageJson.devDependencies.jest).toBeDefined();
    expect(packageJson.devDependencies['@testing-library/react']).toBeDefined();
    expect(packageJson.devDependencies['@testing-library/jest-dom']).toBeDefined();
  });
});
