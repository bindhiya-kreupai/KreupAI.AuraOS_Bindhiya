# Mobile & PWA Testing Suite

Comprehensive mobile responsiveness and Progressive Web App (PWA) testing for AuraOS HCM Platform.

## 📋 Test Coverage

### Day 68: Mobile Responsive Design ✅
**File**: [responsive-design.test.ts](responsive-design.test.ts:1) (80+ tests)

- **Mobile Viewport Tests**: iPhone 12/13/14, Pixel 5, Galaxy S21, iPad Mini/Pro
- **Mobile Navigation**: Hamburger menu, touch interactions, page navigation
- **Touch Interactions**: Touch-friendly button sizes (44x44px), tap events, swipe gestures
- **Mobile Forms**: Form display, keyboard types, virtual keyboard handling, submission
- **Responsive Layout**: Vertical stacking, desktop/mobile element visibility
- **Text Readability**: Font size validation (14px+ minimum), no horizontal scroll
- **Images & Media**: Responsive images (srcset), video embeds, proper sizing
- **Orientation**: Portrait and landscape adaptation
- **Mobile Performance**: 3G load times, smooth scrolling
- **Accessibility**: Zoom support, accessible touch targets
- **Tablet Tests**: iPad layout, split-screen multitasking

### Day 69-70: Mobile E2E Flows ✅
**File**: [mobile-flows.test.ts](mobile-flows.test.ts:1) (60+ tests)

- **Mobile Authentication**: Login, password visibility toggle, error messages
- **Dashboard Navigation**: Mobile-optimized dashboard, menu navigation, notifications
- **Employee Management**: Form filling, validation, native date pickers
- **Leave Application**: Apply for leave, view balance, calendar
- **Attendance Marking**: Clock in/out, GPS location, attendance history
- **Search & Filters**: Employee search, filter panels
- **Notifications**: View notifications, mark as read
- **Profile Management**: View/edit profile, profile picture upload
- **Logout**: Mobile logout flow

### Day 71: PWA Testing ✅
**File**: [pwa.test.ts](pwa.test.ts:1) (50+ tests)

- **Web App Manifest**: Validation, icon sizes, display mode, theme colors
- **Service Worker**: Registration, activation, updates
- **Offline Functionality**: Cache loading, offline indicator, action queuing, sync
- **PWA Installation**: Install prompt, iOS Add to Home Screen
- **Push Notifications**: Permission request, subscription
- **Background Sync**: Sync API support, event registration
- **App Shortcuts**: Manifest shortcuts definition
- **Share Target API**: Web share support
- **Lighthouse PWA Audit**: PWA score > 90, installability checks
- **PWA Best Practices**: HTTPS, viewport, responsiveness, load time
- **Cache Strategies**: Static asset caching, cache-first strategy
- **Update Notifications**: App update notifications

## 📱 Tested Devices

### Smartphones
- **iPhone 12**: 390x844, iOS
- **iPhone 13 Pro**: 390x844, iOS
- **iPhone 14 Pro Max**: 430x932, iOS
- **Google Pixel 5**: 393x851, Android
- **Samsung Galaxy S21**: 360x800, Android

### Tablets
- **iPad Mini**: 768x1024
- **iPad Pro 11**: 834x1194

### Custom Viewports
- **Portrait**: 390x844 (iPhone 12)
- **Landscape**: 844x390 (iPhone 12 rotated)
- **iPad Split-Screen**: 512x1366 (half iPad Pro)

## 🚀 Running Mobile Tests

### Prerequisites

```bash
# Install Playwright and browsers
pnpm install
npx playwright install

# Install mobile device profiles (included with Playwright)
```

### Run All Mobile Tests

```bash
cd apps/web

# Run all mobile tests
pnpm test src/__tests__/mobile/

# Run with specific device
pnpm test src/__tests__/mobile/ --project="Mobile Safari"

# Run with UI mode
npx playwright test src/__tests__/mobile/ --ui
```

### Run Specific Test Suites

```bash
# Responsive design tests
npx playwright test src/__tests__/mobile/responsive-design.test.ts

# Mobile E2E flows
npx playwright test src/__tests__/mobile/mobile-flows.test.ts

# PWA tests
npx playwright test src/__tests__/mobile/pwa.test.ts

# Run specific device
npx playwright test src/__tests__/mobile/ --project="iPhone 12"
```

### Run with Different Configurations

```bash
# Run on specific device
npx playwright test --project="iPhone 13 Pro"

# Run with headed browser (see mobile viewport)
npx playwright test src/__tests__/mobile/ --headed

# Run with slow motion (easier to debug)
npx playwright test src/__tests__/mobile/ --headed --slow-mo=500

# Run and generate report
npx playwright test src/__tests__/mobile/ --reporter=html
```

## ⚙️ Playwright Configuration

Add mobile projects to `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    // Mobile browsers
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'iPad',
      use: { ...devices['iPad Pro 11'] },
    },

    // Custom mobile viewport
    {
      name: 'Custom Mobile',
      use: {
        viewport: { width: 375, height: 667 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)...',
      },
    },
  ],
});
```

## 📊 Test Metrics

### Mobile Test Coverage

| Category | Test File | Tests | Status |
|----------|-----------|-------|--------|
| **Responsive Design** | responsive-design.test.ts | 80+ | ✅ |
| **Mobile E2E Flows** | mobile-flows.test.ts | 60+ | ✅ |
| **PWA Functionality** | pwa.test.ts | 50+ | ✅ |
| **TOTAL** | 3 files | **190+ tests** | ✅ |

### Device Coverage
- ✅ 5 smartphone models (iOS + Android)
- ✅ 2 tablet sizes (iPad Mini + Pro)
- ✅ Portrait and landscape orientations
- ✅ Split-screen modes

### PWA Compliance
- ✅ Web App Manifest validation
- ✅ Service Worker implementation
- ✅ Offline functionality
- ✅ Installability criteria
- ✅ Target: Lighthouse PWA score > 90

## 🧪 Testing Best Practices

### Mobile-Specific Considerations

1. **Touch Targets**: Minimum 44x44px (Apple) or 48x48px (Android)
2. **Font Sizes**: Minimum 14px for body text on mobile
3. **Viewport**: No horizontal scrolling, responsive to viewport changes
4. **Performance**: < 3s load time on 3G, smooth 60fps scrolling
5. **Forms**: Appropriate `input type` for mobile keyboards
6. **Navigation**: Touch-friendly menu, easy thumb reach

### PWA Requirements

1. **HTTPS**: Required for service workers (or localhost for dev)
2. **Manifest**: Valid `manifest.json` with required fields
3. **Service Worker**: Registered and active
4. **Icons**: 192x192 and 512x512 PNG icons
5. **Offline**: Basic offline functionality
6. **Installation**: Meets installability criteria

### Accessibility on Mobile

1. **Zoom**: Allow user scaling (no `user-scalable=no`)
2. **Touch Targets**: Sufficient size and spacing
3. **Contrast**: WCAG AA compliance (4.5:1 for text)
4. **Labels**: Accessible names for all interactive elements
5. **Focus**: Visible focus indicators for keyboard navigation

## 🔧 Common Mobile Testing Scenarios

### Testing Responsive Breakpoints

```typescript
test('should adapt to different breakpoints', async ({ browser }) => {
  const breakpoints = [
    { width: 320, name: 'Small Phone' },
    { width: 375, name: 'iPhone SE' },
    { width: 390, name: 'iPhone 12' },
    { width: 768, name: 'Tablet' },
    { width: 1024, name: 'iPad Pro' },
  ];

  for (const bp of breakpoints) {
    const context = await browser.newContext({
      viewport: { width: bp.width, height: 800 },
    });
    const page = await context.newPage();

    await page.goto(BASE_URL);

    // Test layout at this breakpoint
    // ...

    await context.close();
  }
});
```

### Testing Orientation Changes

```typescript
test('should handle orientation change', async ({ browser }) => {
  const context = await browser.newContext({
    ...devices['iPhone 12'],
  });
  const page = await context.newPage();

  await page.goto(BASE_URL);

  // Portrait
  await page.setViewportSize({ width: 390, height: 844 });
  // Test portrait layout

  // Landscape
  await page.setViewportSize({ width: 844, height: 390 });
  // Test landscape layout

  await context.close();
});
```

### Testing Touch Gestures

```typescript
test('should handle swipe gesture', async ({ page }) => {
  await page.goto(BASE_URL);

  const carousel = await page.locator('.carousel').boundingBox();

  // Swipe left
  await page.mouse.move(carousel.x + carousel.width - 10, carousel.y + carousel.height / 2);
  await page.mouse.down();
  await page.mouse.move(carousel.x + 10, carousel.y + carousel.height / 2);
  await page.mouse.up();

  // Verify carousel moved
});
```

### Testing Offline Mode

```typescript
test('should work offline', async ({ page, context }) => {
  // First visit to cache
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Go offline
  await context.setOffline(true);

  // Reload
  await page.reload();

  // Should load from cache
  await expect(page.locator('h1')).toBeVisible();

  await context.setOffline(false);
});
```

## 🐛 Troubleshooting

### Issue: Mobile menu not appearing

**Solution**:
```typescript
// Check viewport is actually mobile size
const viewport = page.viewportSize();
expect(viewport.width).toBeLessThan(768);

// Wait for menu to render
await page.waitForTimeout(500);

// Try different selectors
const menu = page.locator(
  '[data-testid="mobile-menu"], .hamburger, button[aria-label*="menu"]'
);
```

### Issue: Touch events not working

**Solution**:
```typescript
// Use tap() instead of click() for mobile
await page.tap('button');

// Or configure touch events
const context = await browser.newContext({
  ...devices['iPhone 12'],
  hasTouch: true,
});
```

### Issue: Service Worker not registering

**Solution**:
```bash
# Ensure you're on HTTPS or localhost
# Check service worker file exists
curl http://localhost:3000/sw.js

# Clear service workers before test
await page.evaluate(() => {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(reg => reg.unregister());
  });
});
```

### Issue: PWA not installable

**Checklist**:
- ✅ Using HTTPS or localhost
- ✅ Valid manifest.json with required fields
- ✅ Service worker registered
- ✅ Service worker has fetch event handler
- ✅ Icons are 192x192 and 512x512
- ✅ start_url is accessible

### Issue: Tests timing out on slow networks

**Solution**:
```typescript
// Increase timeout for mobile tests
test.setTimeout(60000);

// Or in config
export default defineConfig({
  timeout: 60000,
  expect: { timeout: 10000 },
});
```

## 📈 Performance Benchmarks

### Target Metrics
- **First Contentful Paint**: < 1.8s on 3G
- **Largest Contentful Paint**: < 2.5s on 3G
- **Time to Interactive**: < 3.8s on 3G
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### Testing Performance

```bash
# Run Lighthouse mobile audit
npx lighthouse http://localhost:3000 \
  --emulated-form-factor=mobile \
  --throttling.cpuSlowdownMultiplier=4 \
  --output=html \
  --output-path=./lighthouse-mobile-report.html

# PWA-specific audit
npx lighthouse http://localhost:3000 \
  --only-categories=pwa \
  --output=json
```

## 🎯 Mobile Testing Checklist

### Before Release

- [ ] All mobile viewport tests passing
- [ ] Touch interactions work correctly
- [ ] Forms are usable on mobile keyboards
- [ ] No horizontal scrolling on any page
- [ ] Text is readable (minimum 14px)
- [ ] Images are responsive (srcset or CSS)
- [ ] Performance: < 3s load on 3G
- [ ] PWA installable (Lighthouse score > 90)
- [ ] Service worker caching works
- [ ] Offline mode functional
- [ ] Push notifications working
- [ ] Tested on real iOS and Android devices
- [ ] Tablet layouts working (iPad)
- [ ] Orientation changes handled correctly

### Continuous Monitoring

- [ ] Mobile test suite in CI/CD
- [ ] Lighthouse CI integration
- [ ] Real device testing (BrowserStack/Sauce Labs)
- [ ] Crash reporting (Sentry)
- [ ] Performance monitoring (Web Vitals)
- [ ] PWA analytics (installation rate, usage)

## 📚 Resources

### Playwright Mobile Testing
- [Playwright Devices](https://playwright.dev/docs/emulation)
- [Touch Events](https://playwright.dev/docs/input#mouse-click)
- [Network Emulation](https://playwright.dev/docs/network#network-emulation)

### PWA Documentation
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Lighthouse PWA](https://developer.chrome.com/docs/lighthouse/pwa/)

### Mobile Best Practices
- [Mobile UX Guidelines](https://developers.google.com/web/fundamentals/design-and-ux/principles)
- [Touch Target Sizes](https://web.dev/accessible-tap-targets/)
- [Mobile Performance](https://web.dev/fast/)

### Tools
- [Lighthouse](https://github.com/GoogleChrome/lighthouse)
- [Chrome DevTools Mobile Emulation](https://developer.chrome.com/docs/devtools/device-mode/)
- [BrowserStack](https://www.browserstack.com/) - Real device testing
- [Sauce Labs](https://saucelabs.com/) - Real device testing

---

**Created**: December 27, 2024 - Plan D Week 15-16 (Days 68-71)
**Status**: ✅ Complete (190+ mobile and PWA tests)
**Next**: Day 72 - Mobile Performance Testing, Days 73-79 - Chaos Engineering
