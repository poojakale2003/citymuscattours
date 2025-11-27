const fs = require('fs');
const path = require('path');

function fixPathsInFile(filePath, outDir) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Calculate relative path from this file to the root (out directory)
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
    // Check if the path ends with a file extension
    if (routePath.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot|css|js|pdf|zip|txt|xml|json)$/i)) {
      return match; // Let the asset path conversion handle this
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
  
  // Also fix href in JSON payloads (Next.js uses these for client-side navigation)
  // Pattern: "href":"/route" -> "href":"./route/index.html" or "href":"../route/index.html"
  content = content.replace(/"href":\s*["']\/([^"'?#]*)([^"']*)["']/g, (match, routePath, queryOrHash) => {
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
    // Check if the path ends with a file extension
    if (routePath.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot|css|js|pdf|zip|txt|xml|json)$/i)) {
      return match; // Let the asset path conversion handle this
    }
    
    // Convert route path to relative path based on current file depth
    let cleanPath = routePath;
    if (cleanPath.endsWith('/')) {
      cleanPath = cleanPath.substring(0, cleanPath.length - 1);
    }
    
    // Handle root path
    if (!cleanPath || cleanPath === '') {
      const rootPath = prefix === './' ? './index.html' : prefix + 'index.html';
      return `"href":"${rootPath}${queryOrHash || ''}"`;
    }
    
    // Build relative path: prefix + route + /index.html
    const relativePath = prefix + cleanPath + '/index.html';
    return `"href":"${relativePath}${queryOrHash || ''}"`;
  });
  
  // Fix absolute paths for assets (but not external URLs or route paths)
  // Pattern: href="/something" or src="/something" but not "//something" (external)
  // We only convert asset paths (files with extensions or known asset directories), not route paths
  // Note: Route paths in href should already be converted above
  content = content.replace(/(href|src|as)="\/([^"/][^"]*)"/g, (match, attr, assetPath) => {
    // Skip if it's an external URL (starts with http:// or https://)
    if (assetPath.startsWith('http://') || assetPath.startsWith('https://')) {
      return match;
    }
    // Skip if already relative (route paths should already be converted)
    if (assetPath.startsWith('./') || assetPath.startsWith('../')) {
      return match;
    }
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
    if (assetPath.startsWith('http://') || assetPath.startsWith('https://')) {
      return match;
    }
    return `rel="preload" href="${prefix}${assetPath}"`;
  });
  
  // Fix data attributes that might contain paths
  content = content.replace(/data-nextjs-router="\/([^"]+)"/g, (match, routerPath) => {
    if (routerPath.startsWith('http://') || routerPath.startsWith('https://')) {
      return match;
    }
    return `data-nextjs-router="${prefix}${routerPath}"`;
  });
  
  // Fix paths in inline JavaScript and JSON data (more specific patterns)
  // Pattern: "/_next/static/..." in quotes (Next.js chunks)
  content = content.replace(/(["'])\/_next\/([^"']+)(["'])/g, (match, quote1, pathStr, quote2) => {
    return `${quote1}${prefix}_next/${pathStr}${quote2}`;
  });
  
  // Pattern: "/logo.jpg", "/favicon.ico", "/partners/...", "/payments/..." etc.
  content = content.replace(/(["'])\/(logo\.|favicon\.|partners\/|payments\/|img-|file\.|globe\.|window\.|next\.|vercel\.)([^"']+)(["'])/g, (match, quote1, prefixPart, pathStr, quote2) => {
    return `${quote1}${prefix}${prefixPart}${pathStr}${quote2}`;
  });
  
  // Pattern: Paths in JSON arrays like ["/_next/static/chunks/..."]
  content = content.replace(/(\[")\/_next\/([^"]+)("])/g, (match, bracket, pathStr, close) => {
    return `${bracket}${prefix}_next/${pathStr}${close}`;
  });
  
  // Fix paths in script src attributes that might have been missed (more comprehensive)
  content = content.replace(/<script([^>]*?)src=["']\/([^"']+)["']([^>]*?)>/g, (match, before, scriptPath, after) => {
    if (scriptPath.startsWith('http://') || scriptPath.startsWith('https://') || scriptPath.startsWith('//')) {
      return match;
    }
    return `<script${before}src="${prefix}${scriptPath}"${after}>`;
  });
  
  // Fix paths in link href attributes that might have been missed (more comprehensive)
  content = content.replace(/<link([^>]*?)href=["']\/([^"']+)["']([^>]*?)>/g, (match, before, linkPath, after) => {
    if (linkPath.startsWith('http://') || linkPath.startsWith('https://') || linkPath.startsWith('//')) {
      return match;
    }
    return `<link${before}href="${prefix}${linkPath}"${after}>`;
  });
  
  // Fix paths in img src attributes (more comprehensive)
  content = content.replace(/<img([^>]*?)src=["']\/([^"']+)["']([^>]*?)>/g, (match, before, imgPath, after) => {
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://') || imgPath.startsWith('//')) {
      return match;
    }
    return `<img${before}src="${prefix}${imgPath}"${after}>`;
  });
  
  // Fix paths in any remaining attribute patterns
  content = content.replace(/(\w+)=["']\/([^"']+)["']/g, (match, attr, attrPath) => {
    // Skip common attributes that shouldn't be changed
    if (['id', 'class', 'type', 'rel', 'as', 'crossorigin', 'fetchpriority', 'async', 'defer', 'nonce'].includes(attr.toLowerCase())) {
      return match;
    }
    // Skip external URLs
    if (attrPath.startsWith('http://') || attrPath.startsWith('https://') || attrPath.startsWith('//')) {
      return match;
    }
    // Skip if already relative
    if (attrPath.startsWith('./') || attrPath.startsWith('../')) {
      return match;
    }
    // Only fix if it looks like a file path (contains / or ends with common extensions)
    if (attrPath.includes('/') || /\.(js|css|jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot)$/i.test(attrPath)) {
      return `${attr}="${prefix}${attrPath}"`;
    }
    return match;
  });
  
  // Final pass: catch any remaining absolute paths in quotes (comprehensive)
  // This catches paths in any context: JavaScript, JSON, HTML attributes, etc.
  // But only if they look like file paths
  content = content.replace(/(["'`])\/([a-zA-Z0-9_-]+(?:\/[^"'`\s]+)*)(["'`])/g, (match, quote1, pathStr, quote2) => {
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
      // Skip if it's a route path that doesn't look like a file (e.g., "/city-tours" without extension)
      if (!pathStr.includes('/') && !/\.(js|css|jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot|html)$/i.test(pathStr)) {
        return match;
      }
      return `${quote1}${prefix}${pathStr}${quote2}`;
    }
    return match;
  });
  
  // Inject navigation fix script for file:// protocol
  // This script intercepts Next.js navigation and loads the correct HTML files
  // IMPORTANT: This must run BEFORE Next.js scripts load
  const navigationScript = `
<script>
(function() {
  // Only run if we're using file:// protocol
  if (window.location.protocol === 'file:') {
    // Store original functions immediately to prevent Next.js from overriding
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    // Get current file's directory depth from root
    function getCurrentDepth() {
      let pathname = window.location.pathname;
      
      // On Windows, pathname might start with /C:/ or /c:/
      if (pathname.match(/^\/[A-Za-z]:/)) {
        pathname = pathname.substring(1);
      }
      
      // Split path and filter out empty parts and the filename
      const parts = pathname.split('/').filter(p => p && p !== 'index.html');
      return parts.length;
    }
    
    // Convert a route path (like "/city-tours" or "/packages/venice-romance") to a relative file path
    function routeToRelativePath(routePath) {
      const currentDepth = getCurrentDepth();
      
      // Remove leading slash - need to escape properly in template string
      let cleanPath = routePath.charAt(0) === '/' ? routePath.substring(1) : routePath;
      
      // Handle root path - navigate to home page
      if (!cleanPath || cleanPath === '' || cleanPath === '/') {
        // Go back to root index.html
        if (currentDepth === 0) {
          return './index.html';
        } else {
          return '../'.repeat(currentDepth) + 'index.html';
        }
      }
      
      // Remove trailing slash if present
      if (cleanPath.endsWith('/')) {
        cleanPath = cleanPath.substring(0, cleanPath.length - 1);
      }
      
      // Calculate how many levels up we need to go
      // For a path like "city-tours", we need to go up currentDepth levels, then into city-tours/
      const upLevels = currentDepth;
      const prefix = upLevels > 0 ? '../'.repeat(upLevels) : './';
      
      // Build the path: prefix + route + /index.html
      // Ensure we always have index.html at the end
      let finalPath = prefix + cleanPath;
      if (!finalPath.endsWith('/index.html') && !finalPath.endsWith('index.html')) {
        finalPath += '/index.html';
      }
      
      return finalPath;
    }
    
    // Convert a relative path (like "../city-tours/index.html") to absolute route path
    function relativeToRoute(relativePath) {
      // Count ../ at the beginning
      let path = relativePath;
      let upCount = 0;
      while (path.startsWith('../')) {
        path = path.substring(3);
        upCount++;
      }
      
      // Remove ./ if present
      if (path.startsWith('./')) {
        path = path.substring(2);
      }
      
      // Remove index.html if present
      if (path.endsWith('/index.html')) {
        path = path.substring(0, path.length - 11);
      } else if (path.endsWith('index.html')) {
        path = path.substring(0, path.length - 10);
      }
      if (path.endsWith('/')) {
        path = path.substring(0, path.length - 1);
      }
      
      return '/' + (path || '');
    }
    
    function navigateToFile(filePath) {
      // Ensure the path is correct
      console.log('[File Nav] Navigating to file:', filePath);
      console.log('[File Nav] Current location:', window.location.href);
      // Use replace to avoid adding to history (optional, can use href for normal navigation)
      try {
        window.location.href = filePath;
      } catch (e) {
        console.error('[File Nav] Navigation error:', e);
        // Fallback: try using replace
        window.location.replace(filePath);
      }
    }
    
    // Expose debug function to window for testing
    window.__fileNavDebug = {
      routeToRelativePath: routeToRelativePath,
      getCurrentDepth: getCurrentDepth,
      test: function(route) {
        console.log('Testing route:', route);
        console.log('Current depth:', getCurrentDepth());
        console.log('Result:', routeToRelativePath(route));
      }
    };
    
    // Override history methods immediately (before Next.js loads)
    history.pushState = function() {
      const path = arguments[2] || (typeof arguments[0] === 'string' ? arguments[0] : arguments[0]?.url);
      if (path && typeof path === 'string' && path.startsWith('/')) {
        const filePath = routeToRelativePath(path);
        navigateToFile(filePath);
        return;
      }
      return originalPushState.apply(history, arguments);
    };
    
    history.replaceState = function() {
      const path = arguments[2] || (typeof arguments[0] === 'string' ? arguments[0] : arguments[0]?.url);
      if (path && typeof path === 'string' && path.startsWith('/')) {
        const filePath = routeToRelativePath(path);
        navigateToFile(filePath);
        return;
      }
      return originalReplaceState.apply(history, arguments);
    };
    
    // Run init immediately and also on DOM ready
    // This ensures we catch everything as early as possible
    init();
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        // Re-run init to catch any links added during DOM load
        setTimeout(init, 0);
      });
    } else {
      // DOM already ready, but run init again after a short delay to catch late-loading content
      setTimeout(init, 100);
    }
    
    function init() {
      // Intercept link clicks - handle both relative and absolute paths
      // Use capture phase with high priority to catch events before Next.js
      function handleLinkClick(e) {
        // Find the closest link element (could be nested)
        let link = e.target;
        let depth = 0;
        while (link && link.tagName !== 'A' && depth < 10) {
          link = link.parentElement;
          depth++;
        }
        
        if (!link || !link.hasAttribute('href')) return;
        
        const href = link.getAttribute('href');
        
        // Skip external links, anchors, mailto, tel, and empty hrefs
        if (!href || 
            href.startsWith('http://') || 
            href.startsWith('https://') || 
            href.startsWith('mailto:') || 
            href.startsWith('tel:') || 
            href.startsWith('#') ||
            href.startsWith('javascript:')) {
          return;
        }
        
        // Handle absolute route paths (starting with /)
        if (href.startsWith('/')) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          const filePath = routeToRelativePath(href);
          console.log('[File Nav] Navigating from', window.location.pathname, 'to route', href, '-> file', filePath);
          navigateToFile(filePath);
          return false;
        }
        
        // Handle relative paths that look like route paths (../something/index.html or ./something/index.html)
        if (href.startsWith('./') || href.startsWith('../')) {
          // Check if it's a route path (contains /index.html or ends with / and doesn't have file extension)
          const isRoutePath = href.includes('/index.html') || 
                             (href.endsWith('/') && !href.match(/\.(js|css|jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot)$/i));
          
          if (isRoutePath) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            // Convert relative path to route, then to correct relative path
            const route = relativeToRoute(href);
            const filePath = routeToRelativePath(route);
            console.log('[File Nav] Converting relative path', href, 'to route', route, '-> file', filePath);
            navigateToFile(filePath);
            return false;
          }
          // Otherwise, it's probably an asset path, let it through
        }
      }
      
      // Add event listener with highest priority (capture phase, first)
      // This must run before Next.js handlers
      document.addEventListener('click', handleLinkClick, { capture: true, passive: false });
      
      // Also add to window for maximum coverage
      window.addEventListener('click', handleLinkClick, { capture: true, passive: false });
      
      // Also intercept on the document body once it's available
      function addBodyListener() {
        if (document.body) {
          document.body.addEventListener('click', handleLinkClick, { capture: true, passive: false });
        }
      }
      
      if (document.body) {
        addBodyListener();
      } else {
        const observer = new MutationObserver(function() {
          if (document.body) {
            addBodyListener();
            observer.disconnect();
          }
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
      }
      
      // Also override all anchor tags' default behavior by patching them
      function patchAllLinks() {
        const links = document.querySelectorAll('a[href]');
        links.forEach(function(link) {
          const href = link.getAttribute('href');
          if (href && href.startsWith('/') && !href.startsWith('http') && !href.startsWith('mailto') && !href.startsWith('tel') && !href.startsWith('#')) {
            link.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              const filePath = routeToRelativePath(href);
              console.log('[File Nav] Patched link clicked:', href, '->', filePath);
              navigateToFile(filePath);
            }, true);
          }
        });
      }
      
      // Patch existing links
      patchAllLinks();
      
      // Watch for dynamically added links
      const linkObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) { // Element node
              if (node.tagName === 'A' && node.hasAttribute('href')) {
                const href = node.getAttribute('href');
                if (href && href.startsWith('/') && !href.startsWith('http') && !href.startsWith('mailto') && !href.startsWith('tel') && !href.startsWith('#')) {
                  node.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    const filePath = routeToRelativePath(href);
                    console.log('[File Nav] Dynamic link clicked:', href, '->', filePath);
                    navigateToFile(filePath);
                  }, true);
                }
              }
              // Also check children
              const links = node.querySelectorAll && node.querySelectorAll('a[href]');
              if (links) {
                links.forEach(function(link) {
                  const href = link.getAttribute('href');
                  if (href && href.startsWith('/') && !href.startsWith('http') && !href.startsWith('mailto') && !href.startsWith('tel') && !href.startsWith('#')) {
                    link.addEventListener('click', function(e) {
                      e.preventDefault();
                      e.stopPropagation();
                      const filePath = routeToRelativePath(href);
                      console.log('[File Nav] Dynamic child link clicked:', href, '->', filePath);
                      navigateToFile(filePath);
                    }, true);
                  }
                });
              }
            }
          });
        });
      });
      
      linkObserver.observe(document.body || document.documentElement, { childList: true, subtree: true });
      
      // Also intercept Next.js router if it's available
      if (typeof window !== 'undefined' && window.next && window.next.router) {
        const originalPush = window.next.router.push;
        const originalReplace = window.next.router.replace;
        
        if (originalPush) {
          window.next.router.push = function(url) {
            if (typeof url === 'string' && url.startsWith('/')) {
              const filePath = routeToRelativePath(url);
              navigateToFile(filePath);
              return Promise.resolve();
            }
            return originalPush.apply(this, arguments);
          };
        }
        
        if (originalReplace) {
          window.next.router.replace = function(url) {
            if (typeof url === 'string' && url.startsWith('/')) {
              const filePath = routeToRelativePath(url);
              navigateToFile(filePath);
              return Promise.resolve();
            }
            return originalReplace.apply(this, arguments);
          };
        }
      }
    }
  }
})();
</script>`;
  
  // Inject script in the HEAD section (before other scripts) to ensure it runs first
  // This is critical for intercepting Next.js navigation
  if (content.includes('</head>')) {
    content = content.replace('</head>', navigationScript + '</head>');
  } else if (content.includes('</body>')) {
    content = content.replace('</body>', navigationScript + '</body>');
  } else if (content.includes('</html>')) {
    content = content.replace('</html>', navigationScript + '</html>');
  }
  
  // Only write if content changed
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

function fixPathsInDirectory(dir, outDir) {
  const files = fs.readdirSync(dir);
  let fixedCount = 0;
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip _next directory - those files are fine as-is
      if (file === '_next') {
        continue;
      }
      // Recursively process subdirectories
      fixedCount += fixPathsInDirectory(filePath, outDir);
    } else if (file.endsWith('.html')) {
      // Fix paths in HTML files
      if (fixPathsInFile(filePath, outDir)) {
        fixedCount++;
      }
    }
  }
  
  return fixedCount;
}

const outDir = path.join(__dirname, '..', 'out');

if (fs.existsSync(outDir)) {
  console.log('🔧 Fixing paths in static export for direct file opening...');
  const fixedCount = fixPathsInDirectory(outDir, outDir);
  console.log(`✅ Fixed paths in ${fixedCount} HTML file(s)!`);
  
  // Verify no absolute paths remain
  console.log('🔍 Verifying all paths are fixed...');
  let remainingAbsolutePaths = 0;
  function checkForAbsolutePaths(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory() && file !== '_next' && file !== 'node_modules') {
        checkForAbsolutePaths(filePath);
      } else if (file.endsWith('.html')) {
        const content = fs.readFileSync(filePath, 'utf8');
        // Check for common absolute path patterns
        const absolutePathPatterns = [
          /href="\/[^h]/g,
          /src="\/[^h]/g,
          /="\/_next\//g,
          /"\/logo\./g,
          /"\/favicon\./g,
          /"\/partners\//g,
          /"\/payments\//g
        ];
        for (const pattern of absolutePathPatterns) {
          const matches = content.match(pattern);
          if (matches && matches.length > 0) {
            remainingAbsolutePaths += matches.length;
            if (remainingAbsolutePaths <= 5) {
              console.warn(`⚠️  Found absolute path in ${path.relative(outDir, filePath)}`);
            }
          }
        }
      }
    }
  }
  checkForAbsolutePaths(outDir);
  
  if (remainingAbsolutePaths === 0) {
    console.log('✅ All paths verified! No absolute paths found.');
  } else {
    console.warn(`⚠️  Found ${remainingAbsolutePaths} potential absolute path(s) that may need fixing.`);
  }
  
  console.log('✅ The website can now be opened directly from index.html');
} else {
  console.error('❌ out directory not found. Please run "npm run build" first.');
  process.exit(1);
}

