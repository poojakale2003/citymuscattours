import fs from 'fs';
import path from 'path';

function fixPathsInFile(filePath, outDir) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Calculate relative path from this file to root (out directory)
  const relativeToRoot = path.relative(path.dirname(filePath), outDir).replace(/\\/g, '/');
  const prefix = relativeToRoot ? relativeToRoot + '/' : './';
  
  // Fix Next.js specific paths: /_next/static/... to ../_next/static/... (relative to root)
  content = content.replace(/="\/_next\//g, `="${prefix}_next/`);
  content = content.replace(/href="\/_next\//g, `href="${prefix}_next/`);
  content = content.replace(/src="\/_next\//g, `src="${prefix}_next/`);
  
  // First, convert route paths in href attributes to relative paths
  // This must be done BEFORE the general asset path conversion
  // Pattern: href="/route" -> href="./route/index.html" or "../route/index.html" depending on depth
  // Use a more comprehensive regex to catch all cases, including those with query strings
  // Also catch href in JSON payloads: "href":"/route"
  // Skip external URLs, mailto, tel, and anchor links
  // Skip if already relative
  // Skip file paths with extensions (these are assets, not routes)
  // Convert route path to relative path based on current file depth
  // Handle root path
  // Build relative path: prefix + route + /index.html
  // Also fix href in JSON payloads (Next.js uses these for client-side navigation)
  // Fix absolute paths for assets (but not external URLs or route paths)
  // Fix paths in inline JavaScript and JSON data
  // Fix preload links
  // Fix data attributes that might contain paths
  // Final pass: catch any remaining absolute paths in quotes (comprehensive)
  // Inject navigation fix script for file:// protocol
  // This must run BEFORE Next.js scripts load
  
  // Pattern: href="/route" -> href="./route/index.html" or "../route/index.html" depending on depth
  content = content.replace(/href=["']\/([^"'?#]*)([^"']*)["']/g, (match, routePath, queryOrHash) => {
    // Skip external URLs
    if (routePath.startsWith('http://') || routePath.startsWith('https://') || routePath.startsWith('//')) {
      return match;
    }
    // Skip mailto, tel, and anchor links
    if (routePath.startsWith('mailto:') || routePath.startsWith('tel:') || routePath.startsWith('#')) {
      return match;
    }
    // Skip if already relative
    if (routePath.startsWith('./') || routePath.startsWith('../')) {
      return match;
    }
    // Skip file paths with extensions (these are assets, not routes)
    if (routePath.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot|css|js|pdf|zip|txt|xml|json)$/i)) {
      return match;
    }
    
    // Convert route path to relative path based on current file depth
    let cleanPath = routePath;
    if (cleanPath.endsWith('/')) {
      cleanPath = cleanPath.substring(0, cleanPath.length - 1);
    }
    
    // Handle root path
    if (!cleanPath || cleanPath === '') {
      // For root, go to index.html at root level
      const rootPath = prefix === './' ? './index.html' : prefix + 'index.html';
      return `href="${rootPath}${queryOrHash || ''}"`;
    }
    
    // Build relative path: prefix + route + /index.html
    const relativePath = prefix + cleanPath + '/index.html';
    return `href="${relativePath}${queryOrHash || ''}"`;
  });
  
  // Fix absolute paths for assets (but not external URLs or route paths)
  // Pattern: href="/something" or src="/something" but not "//something" (external)
  // We only convert asset paths (files with extensions or known asset directories), not route paths
  // Note: Route paths in href should already be converted above
  // Known asset patterns: _next/, logo., favicon., partners/, payments/, img-, or has file extension
  const isAssetPath = assetPath.startsWith('_next/') ||
                       assetPath.startsWith('logo.') ||
                       assetPath.startsWith('favicon.') ||
                       assetPath.startsWith('partners/') ||
                       assetPath.startsWith('payments/') ||
                       assetPath.startsWith('img-') ||
                       assetPath.match(/\.(js|css|jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot|html)$/i);
  
  // If it's not an asset path, skip it (might be a route path that wasn't caught)
  if (!isAssetPath) {
    return match;
  }
  
  // Make asset paths relative to root
  return `${attr}="${prefix}${assetPath}"`;
  });
  
  // Fix preload links
  content = content.replace(/rel="preload" href="\/([^"]+)"/g, (match, assetPath) => {
    // Skip external URLs
    if (assetPath.startsWith('http://') || assetPath.startsWith('https://')) {
      return match;
    }
    return `rel="preload" href="${prefix}${assetPath}"`;
  });
  
  // Fix data attributes that might contain paths
  // Pattern: data-nextjs-router="\/([^"]+)"/g
  content = content.replace(/data-nextjs-router="\/([^"]+)"/g, (match, routerPath) => {
    // Skip external URLs
    if (routerPath.startsWith('http://') || routerPath.startsWith('https://') || routerPath.startsWith('//')) {
      return match;
    }
    return `data-nextjs-router="${prefix}${routerPath}"`;
  });
  
  // Fix paths in inline JavaScript and JSON data (more specific patterns)
  // Pattern: "/_next/static/chunks/..." in quotes (Next.js chunks)
  content = content.replace(/(["'])\/_next\/([^"]+)("])/g, (match, quote1, pathStr, quote2) => {
    // Skip external URLs
    if (pathStr.startsWith('http://') || pathStr.startsWith('https://') || pathStr.startsWith('//')) {
      return match;
    }
    return `${quote1}${prefix}_next/${pathStr}${quote2}`;
  });
  
  // Pattern: "/logo.jpg", "/favicon.ico", "/partners/...", "/payments/...", "/img-...", "/file.pdf", etc.
  content = content.replace(/(["'])\/(logo\.|favicon\.|partners\/|payments\/|img-|file\.)([^"']+)(["'])/g, (match, quote1, prefixPart, pathStr, quote2) => {
    // Skip external URLs
    if (pathStr.startsWith('http://') || pathStr.startsWith('https://') || pathStr.startsWith('//')) {
      return match;
    }
    return `${quote1}${prefix}${prefixPart}${pathStr}${quote2}`;
  });
  
  // Fix paths in script src attributes that might have been missed (more comprehensive)
  // Pattern: <script([^>]*?)src=["']\/([^"']+)["']([^>]*?)>/g
  content = content.replace(/<script([^>]*?)src=["']\/([^"']+)["']([^>]*?)>/g, (match, before, scriptPath, after) => {
    // Skip external URLs
    if (scriptPath.startsWith('http://') || scriptPath.startsWith('https://') || scriptPath.startsWith('//')) {
      return match;
    }
    return `<script${before}src="${prefix}${scriptPath}"${after}>`;
  });
  
  // Fix paths in link href attributes that might have been missed (more comprehensive)
  // Pattern: <link([^>]*?)href=["']\/([^"']+)["']([^>]*?)>/g
  content = content.replace(/<link([^>]*?)href=["']\/([^"']+)["']([^>]*?)>/g, (match, before, linkPath, after) => {
    // Skip external URLs
    if (linkPath.startsWith('http://') || linkPath.startsWith('https://') || linkPath.startsWith('//')) {
      return match;
    }
    // Skip if already relative
    if (linkPath.startsWith('./') || linkPath.startsWith('../')) {
      return match;
    }
    // Skip file paths with extensions (these are assets, not routes)
    if (linkPath.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot|css|js|pdf|zip|txt|xml|json)$/i)) {
      return match;
    }
    
    // Convert route path to relative path based on current file depth
    let cleanPath = linkPath;
    if (cleanPath.endsWith('/')) {
      cleanPath = cleanPath.substring(0, cleanPath.length - 1);
    }
    
    // Handle root path
    if (!cleanPath || cleanPath === '') {
      // For root, go to index.html at root level
      const rootPath = prefix === './' ? './index.html' : prefix + 'index.html';
      return `<link${before}href="${rootPath}${after}"${link}>`;
    }
    
    // Build relative path: prefix + route + /index.html
    const relativePath = prefix + cleanPath + '/index.html';
    return `<link${before}href="${relativePath}${after}"${link}>`;
  });
  
  // Final pass: catch any remaining absolute paths in quotes (comprehensive)
  // This catches paths in any context: JavaScript, JSON, HTML attributes, etc.
  content = content.replace(/(["`])\/([a-zA-Z0-9_-]+(?:\/[^"'`\s]+)*)(["'`])/g, (match, quote1, pathStr, quote2) => {
    // Skip external URLs
    if (pathStr.startsWith('http://') || pathStr.startsWith('https://') || pathStr.startsWith('//')) {
      return match;
    }
    // Skip if already relative
    if (pathStr.startsWith('./') || pathStr.startsWith('../')) {
      return match;
    }
    // Only fix if it looks like a file path
    // Must contain a slash or be a known asset file
    if (pathStr.includes('/') || /\.(js|css|jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot|html)$/i.test(pathStr)) {
      return `${quote1}${prefix}${pathStr}${quote2}`;
    }
    return match;
  });
  
  // Inject navigation fix script for file:// protocol
  // This script intercepts Next.js navigation and loads the correct HTML files
  const navigationScript = `
(function() {
    // Only run if we're using file:// protocol
    if (window.location.protocol === 'file:') {
      // Store original functions immediately to prevent Next.js from overriding
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;
      
      window.history.pushState = function() {
        // Call original function with arguments
        return originalPushState.apply(this, arguments);
      };
      
      window.history.replaceState = function() {
        // Call original function with arguments
        return originalReplaceState.apply(this, arguments);
      };
      
      // Override Next.js router to use file:// protocol
      window.__fileNavDebug = {
        routeToRelativePath: function(route) {
          const currentDepth = getCurrentDepth();
          console.log('[File Nav] Navigating to file:', route);
          console.log('[File Nav] Current depth:', currentDepth);
          console.log('[File Nav] Result:', routeToRelativePath(route));
        },
        getCurrentDepth: getCurrentDepth,
        test: function(route) {
          console.log('[File Nav] Testing route:', route);
          console.log('[File Nav] Current depth:', getCurrentDepth());
          console.log('[File Nav] Result:', routeToRelativePath(route));
        }
      };
    }
  })();
  
  // Inject script in HEAD section (before other scripts)
  if (content.includes('</head>')) {
    content = content.replace('</head>', navigationScript + '</head>');
  } else if (content.includes('</body>')) {
    content = content.replace('</body>', navigationScript + '</body>');
  } else {
    content = navigationScript + content;
  }
  
  // Only write if content changed
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}
