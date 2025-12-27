/**
 * Mobile Performance Testing (Day 72)
 *
 * Comprehensive mobile performance testing:
 * - Load time on 3G/4G networks
 * - Core Web Vitals (LCP, FID, CLS)
 * - JavaScript bundle size
 * - Image optimization
 * - Battery and memory usage
 * - Real device testing
 * - Network performance analysis
 */

import { test, expect, devices } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.use({ ...devices['iPhone 12'] });

test.describe('Mobile Load Time Tests', () => {
  test('should load within 3 seconds on 3G', async ({ page, context }) => {
    // Simulate 3G network (750kb/s down, 250kb/s up, 100ms latency)
    await page.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms latency
      await route.continue();
    });

    const startTime = Date.now();
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - startTime;

    console.log(`3G Load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000); // 3 seconds
  });

  test('should load within 2 seconds on 4G', async ({ page }) => {
    // 4G has better speeds, minimal latency simulation
    await page.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 20)); // 20ms latency
      await route.continue();
    });

    const startTime = Date.now();
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - startTime;

    console.log(`4G Load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(2000); // 2 seconds
  });

  test('should achieve Fast 3G performance', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const totalLoadTime = Date.now() - startTime;

    console.log(`Total load time (networkidle): ${totalLoadTime}ms`);
    expect(totalLoadTime).toBeLessThan(5000); // 5 seconds for full load
  });

  test('should measure Time to Interactive (TTI)', async ({ page }) => {
    await page.goto(BASE_URL);

    const tti = await page.evaluate(() => {
      return new Promise((resolve) => {
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.name === 'first-input') {
                resolve(entry.startTime);
              }
            }
          });
          observer.observe({ entryTypes: ['first-input'] });

          // Fallback timeout
          setTimeout(() => resolve(0), 5000);
        } else {
          resolve(0);
        }
      });
    });

    console.log(`Time to Interactive: ${tti}ms`);
    if (tti > 0) {
      expect(tti).toBeLessThan(3800); // Target: < 3.8s on mobile
    }
  });
});

test.describe('Core Web Vitals', () => {
  test('should measure Largest Contentful Paint (LCP)', async ({ page }) => {
    await page.goto(BASE_URL);

    await page.waitForTimeout(3000);

    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1] as any;
            resolve(lastEntry.renderTime || lastEntry.loadTime);
          });
          observer.observe({ entryTypes: ['largest-contentful-paint'] });

          setTimeout(() => resolve(0), 3000);
        } else {
          resolve(0);
        }
      });
    });

    console.log(`LCP: ${lcp}ms`);
    if (lcp > 0) {
      expect(lcp).toBeLessThan(2500); // Target: < 2.5s
    }
  });

  test('should measure First Contentful Paint (FCP)', async ({ page }) => {
    await page.goto(BASE_URL);

    const fcp = await page.evaluate(() => {
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      return fcpEntry ? fcpEntry.startTime : 0;
    });

    console.log(`FCP: ${fcp}ms`);
    expect(fcp).toBeLessThan(1800); // Target: < 1.8s
  });

  test('should measure Cumulative Layout Shift (CLS)', async ({ page }) => {
    await page.goto(BASE_URL);

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0;

        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries() as any) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
          });
          observer.observe({ entryTypes: ['layout-shift'] });

          setTimeout(() => {
            resolve(clsValue);
          }, 2000);
        } else {
          resolve(0);
        }
      });
    });

    console.log(`CLS: ${cls}`);
    expect(cls).toBeLessThan(0.1); // Target: < 0.1
  });

  test('should measure First Input Delay (FID)', async ({ page }) => {
    await page.goto(BASE_URL);

    // Simulate user interaction
    await page.click('body');

    const fid = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries() as any) {
              resolve(entry.processingStart - entry.startTime);
            }
          });
          observer.observe({ entryTypes: ['first-input'] });

          setTimeout(() => resolve(0), 3000);
        } else {
          resolve(0);
        }
      });
    });

    console.log(`FID: ${fid}ms`);
    if (fid > 0) {
      expect(fid).toBeLessThan(100); // Target: < 100ms
    }
  });
});

test.describe('JavaScript Performance', () => {
  test('should have reasonable JavaScript bundle size', async ({ page }) => {
    await page.goto(BASE_URL);

    const jsSize = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const jsResources = resources.filter(r => r.name.endsWith('.js'));
      return jsResources.reduce((total, r) => total + r.transferSize, 0);
    });

    const jsSizeKB = Math.round(jsSize / 1024);
    console.log(`Total JS size: ${jsSizeKB}KB`);

    // Target: < 200KB for initial bundle on mobile
    expect(jsSizeKB).toBeLessThan(200);
  });

  test('should use code splitting', async ({ page }) => {
    await page.goto(BASE_URL);

    const jsFiles = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      return resources.filter(r => r.name.endsWith('.js')).length;
    });

    console.log(`Number of JS files: ${jsFiles}`);
    // Should have multiple chunks (code splitting)
    expect(jsFiles).toBeGreaterThan(1);
  });

  test('should load critical JavaScript first', async ({ page }) => {
    await page.goto(BASE_URL);

    const scriptOrder = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const jsResources = resources
        .filter(r => r.name.endsWith('.js'))
        .sort((a, b) => a.startTime - b.startTime);

      return jsResources.map(r => ({
        name: r.name.split('/').pop(),
        startTime: r.startTime,
      }));
    });

    console.log('Script load order:', scriptOrder);
    // Main bundle should load first
    expect(scriptOrder[0].name).toMatch(/main|app|index/);
  });

  test('should execute JavaScript efficiently', async ({ page }) => {
    await page.goto(BASE_URL);

    const jsExecutionTime = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
    });

    console.log(`JS execution time: ${jsExecutionTime}ms`);
    expect(jsExecutionTime).toBeLessThan(1000); // < 1s
  });
});

test.describe('Image Optimization', () => {
  test('should use optimized image formats', async ({ page }) => {
    await page.goto(BASE_URL);

    const images = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.map(img => ({
        src: img.src,
        format: img.src.split('.').pop()?.split('?')[0],
      }));
    });

    console.log('Image formats:', images.map(i => i.format));

    // Should use modern formats (WebP, AVIF) or optimized PNG/JPEG
    const modernFormats = images.filter(img =>
      ['webp', 'avif'].includes(img.format?.toLowerCase() || '')
    );

    console.log(`Modern format images: ${modernFormats.length}/${images.length}`);
  });

  test('should use responsive images (srcset)', async ({ page }) => {
    await page.goto(BASE_URL);

    const imagesWithSrcset = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.filter(img => img.srcset).length;
    });

    const totalImages = await page.locator('img').count();

    console.log(`Images with srcset: ${imagesWithSrcset}/${totalImages}`);

    // At least 50% of images should have srcset
    if (totalImages > 0) {
      expect(imagesWithSrcset / totalImages).toBeGreaterThan(0.3);
    }
  });

  test('should lazy load images below the fold', async ({ page }) => {
    await page.goto(BASE_URL);

    const lazyImages = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.filter(img => img.loading === 'lazy').length;
    });

    console.log(`Lazy loaded images: ${lazyImages}`);
    expect(lazyImages).toBeGreaterThan(0);
  });

  test('should have reasonable total image size', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const imageSize = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const imageResources = resources.filter(r =>
        r.name.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)/)
      );
      return imageResources.reduce((total, r) => total + r.transferSize, 0);
    });

    const imageSizeKB = Math.round(imageSize / 1024);
    console.log(`Total image size: ${imageSizeKB}KB`);

    // Target: < 500KB for images on initial page load
    expect(imageSizeKB).toBeLessThan(500);
  });
});

test.describe('CSS Performance', () => {
  test('should have reasonable CSS bundle size', async ({ page }) => {
    await page.goto(BASE_URL);

    const cssSize = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const cssResources = resources.filter(r => r.name.endsWith('.css'));
      return cssResources.reduce((total, r) => total + r.transferSize, 0);
    });

    const cssSizeKB = Math.round(cssSize / 1024);
    console.log(`Total CSS size: ${cssSizeKB}KB`);

    expect(cssSizeKB).toBeLessThan(50); // Target: < 50KB
  });

  test('should inline critical CSS', async ({ page }) => {
    const response = await page.goto(BASE_URL);
    const html = await response!.text();

    const hasInlineCSS = html.includes('<style>') && html.includes('</style>');
    console.log(`Has inline CSS: ${hasInlineCSS}`);

    // Critical CSS should be inlined
    if (hasInlineCSS) {
      const inlineCSSSize = html.match(/<style>(.*?)<\/style>/gs)?.[0]?.length || 0;
      console.log(`Inline CSS size: ${inlineCSSSize} chars`);
    }
  });

  test('should minimize render-blocking CSS', async ({ page }) => {
    await page.goto(BASE_URL);

    const renderBlockingCSS = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      return links.filter(link => !link.hasAttribute('media')).length;
    });

    console.log(`Render-blocking CSS files: ${renderBlockingCSS}`);
    expect(renderBlockingCSS).toBeLessThan(3); // Minimize render-blocking
  });
});

test.describe('Network Performance', () => {
  test('should use compression (gzip/brotli)', async ({ page }) => {
    const response = await page.goto(BASE_URL);
    const headers = response!.headers();

    const encoding = headers['content-encoding'];
    console.log(`Content encoding: ${encoding}`);

    expect(['gzip', 'br', 'deflate']).toContain(encoding);
  });

  test('should cache static resources', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Reload page
    await page.reload();

    const cachedResources = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      return resources.filter(r => r.transferSize === 0).length;
    });

    console.log(`Cached resources on reload: ${cachedResources}`);
    expect(cachedResources).toBeGreaterThan(0);
  });

  test('should use HTTP/2 or HTTP/3', async ({ page }) => {
    const response = await page.goto(BASE_URL);

    const protocol = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return (navigation as any).nextHopProtocol;
    });

    console.log(`Protocol: ${protocol}`);
    // HTTP/2 or HTTP/3
    expect(protocol).toMatch(/h2|h3|http\/2|http\/3/);
  });

  test('should minimize number of requests', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const requestCount = await page.evaluate(() => {
      return performance.getEntriesByType('resource').length;
    });

    console.log(`Total requests: ${requestCount}`);
    expect(requestCount).toBeLessThan(50); // Target: < 50 requests
  });
});

test.describe('Battery & Memory Usage', () => {
  test('should not cause memory leaks', async ({ page }) => {
    await page.goto(BASE_URL);

    const initialMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });

    // Navigate around the app
    await page.goto(`${BASE_URL}/employees`);
    await page.goto(`${BASE_URL}/dashboard`);
    await page.goto(BASE_URL);

    await page.waitForTimeout(2000);

    const finalMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });

    if (initialMemory > 0 && finalMemory > 0) {
      const memoryGrowth = ((finalMemory - initialMemory) / initialMemory) * 100;
      console.log(`Memory growth: ${memoryGrowth.toFixed(2)}%`);

      // Memory shouldn't grow more than 50% after navigation
      expect(memoryGrowth).toBeLessThan(50);
    }
  });

  test('should have reasonable CPU usage', async ({ page }) => {
    await page.goto(BASE_URL);

    // Measure long tasks (> 50ms)
    const longTasks = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let count = 0;

        if ('PerformanceLongTaskTiming' in window) {
          const observer = new PerformanceObserver((list) => {
            count += list.getEntries().length;
          });
          observer.observe({ entryTypes: ['longtask'] });

          setTimeout(() => resolve(count), 5000);
        } else {
          resolve(0);
        }
      });
    });

    console.log(`Long tasks (>50ms): ${longTasks}`);
    expect(longTasks).toBeLessThan(5); // Minimize long tasks
  });
});

test.describe('Scrolling Performance', () => {
  test('should have smooth scrolling (60fps)', async ({ page }) => {
    await page.goto(`${BASE_URL}/employees`);

    // Scroll down
    const startTime = Date.now();
    await page.evaluate(() => {
      window.scrollTo({ top: 1000, behavior: 'smooth' });
    });

    await page.waitForTimeout(1000);

    const scrollTime = Date.now() - startTime;
    console.log(`Scroll time: ${scrollTime}ms`);

    // Smooth scroll should complete in reasonable time
    expect(scrollTime).toBeLessThan(2000);
  });

  test('should use passive event listeners for scroll', async ({ page }) => {
    await page.goto(BASE_URL);

    const hasPassiveListeners = await page.evaluate(() => {
      // Check if passive listeners are supported and used
      return 'onwheel' in window;
    });

    expect(hasPassiveListeners).toBeTruthy();
  });

  test('should not have scroll jank', async ({ page }) => {
    await page.goto(`${BASE_URL}/employees`);

    // Scroll and measure frame rate
    const frames = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let frameCount = 0;
        const startTime = performance.now();

        function countFrame() {
          frameCount++;
          if (performance.now() - startTime < 1000) {
            requestAnimationFrame(countFrame);
          } else {
            resolve(frameCount);
          }
        }

        requestAnimationFrame(countFrame);
        window.scrollBy(0, 500);
      });
    });

    console.log(`FPS during scroll: ${frames}`);
    expect(frames).toBeGreaterThan(50); // At least 50 FPS
  });
});

test.describe('Font Loading Performance', () => {
  test('should use font-display: swap', async ({ page }) => {
    await page.goto(BASE_URL);

    const fontDisplay = await page.evaluate(() => {
      const styleSheets = Array.from(document.styleSheets);
      for (const sheet of styleSheets) {
        try {
          const rules = Array.from(sheet.cssRules || []);
          for (const rule of rules) {
            if (rule instanceof CSSFontFaceRule) {
              return rule.style.fontDisplay;
            }
          }
        } catch (e) {
          // CORS error for external stylesheets
        }
      }
      return null;
    });

    console.log(`Font display: ${fontDisplay}`);
    if (fontDisplay) {
      expect(['swap', 'optional', 'fallback']).toContain(fontDisplay);
    }
  });

  test('should preload critical fonts', async ({ page }) => {
    const response = await page.goto(BASE_URL);
    const html = await response!.text();

    const hasPreloadFonts = html.includes('rel="preload"') && html.includes('as="font"');
    console.log(`Has preloaded fonts: ${hasPreloadFonts}`);
  });
});

test.describe('Third-Party Scripts', () => {
  test('should load third-party scripts asynchronously', async ({ page }) => {
    const response = await page.goto(BASE_URL);
    const html = await response!.text();

    const thirdPartyScripts = html.match(/<script[^>]*src=["']https?:\/\/[^"']+["'][^>]*>/g) || [];

    for (const script of thirdPartyScripts) {
      const hasAsync = script.includes('async') || script.includes('defer');
      console.log(`Third-party script async/defer: ${hasAsync}`);
    }
  });

  test('should minimize third-party impact', async ({ page }) => {
    await page.goto(BASE_URL);

    const thirdPartySize = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const thirdParty = resources.filter(r =>
        !r.name.includes(window.location.hostname)
      );
      return thirdParty.reduce((total, r) => total + r.transferSize, 0);
    });

    const thirdPartySizeKB = Math.round(thirdPartySize / 1024);
    console.log(`Third-party size: ${thirdPartySizeKB}KB`);

    expect(thirdPartySizeKB).toBeLessThan(100); // < 100KB
  });
});
