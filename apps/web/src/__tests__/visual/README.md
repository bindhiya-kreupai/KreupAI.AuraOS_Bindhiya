# Visual & Accessibility Testing Suite

Comprehensive visual regression and accessibility testing suite for AuraOS HCM Platform covering WCAG 2.1 Level AA compliance, cross-browser compatibility, and visual regression testing.

## 📋 Table of Contents

- [Overview](#overview)
- [Test Coverage](#test-coverage)
- [Tools Used](#tools-used)
- [Running Tests](#running-tests)
- [Chromatic Visual Regression](#chromatic-visual-regression)
- [Accessibility Testing](#accessibility-testing)
- [Cross-Browser Testing](#cross-browser-testing)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This visual and accessibility testing suite provides automated testing for the AuraOS HCM platform, covering:

- **WCAG 2.1 Level AA** compliance
- **Visual regression** testing with Chromatic
- **Cross-browser** compatibility (Chrome, Firefox, Safari, Edge)
- **Mobile accessibility** (iOS, Android)
- **Keyboard navigation** testing
- **Color contrast** validation
- **Screen reader** compatibility

### Testing Philosophy

1. **Inclusive Design**: Ensure accessibility for all users
2. **Visual Consistency**: Maintain design system integrity
3. **Cross-Platform**: Test across browsers and devices
4. **Automated Testing**: Catch regressions early
5. **WCAG Compliance**: Meet international accessibility standards

## 📊 Test Coverage

### 1. WCAG 2.1 AA Compliance Tests

**File**: [wcag-compliance.test.ts](../accessibility/wcag-compliance.test.ts:1)

Tests compliance with Web Content Accessibility Guidelines 2.1 Level AA:

✅ **Perceivable**
- Text alternatives (alt text for images)
- Adaptable content (proper semantic HTML)
- Distinguishable elements (color contrast 4.5:1)
- Time-based media alternatives

✅ **Operable**
- Keyboard accessible (all functionality via keyboard)
- No keyboard traps
- Sufficient time for interactions
- No seizure-inducing content
- Navigable (skip links, headings, focus order)

✅ **Understandable**
- Readable content (proper lang attributes)
- Predictable behavior (consistent navigation)
- Input assistance (labels, error messages)
- Error prevention

✅ **Robust**
- Compatible with assistive technologies
- Valid ARIA attributes
- Proper semantic HTML

**Pages Tested**:
- Dashboard
- Employee List
- Employee Forms
- Reports
- Navigation

### 2. Keyboard Navigation Tests

**File**: [keyboard-navigation.test.ts](../accessibility/keyboard-navigation.test.ts:1)

Tests keyboard accessibility across the application:

✅ **Tab Navigation**
- All interactive elements accessible via Tab
- Logical tab order
- Visible focus indicators
- Reverse navigation with Shift+Tab

✅ **Keyboard Shortcuts**
- Enter activates buttons and links
- Space activates buttons and toggles checkboxes
- Arrow keys navigate dropdowns and radio groups
- Escape closes modals and dropdowns

✅ **Focus Management**
- No keyboard traps
- Focus visible indicators
- Focus returns to trigger after modal close
- Skip links to main content

✅ **Form Navigation**
- Tab through form fields
- Enter submits forms
- Arrow keys for select/radio
- Space for checkboxes

### 3. Visual Regression Tests

**Tool**: Chromatic with Storybook

Tests visual consistency across:

✅ **Component States**
- Default state
- Hover state
- Focus state
- Active state
- Disabled state
- Error state
- Loading state

✅ **Responsive Design**
- Mobile (375px)
- Tablet (768px)
- Desktop (1280px)
- Large Desktop (1920px)

✅ **Themes**
- Light mode
- Dark mode
- High contrast mode

✅ **Page Variations**
- Empty states
- Loading states
- Error states
- Full data states

### 4. Cross-Browser Tests

**Browsers Tested**:
- ✅ Chrome/Chromium (Desktop + Mobile)
- ✅ Firefox (Desktop)
- ✅ Safari/WebKit (Desktop + Mobile)
- ✅ Microsoft Edge (Desktop)

**Devices Tested**:
- Desktop (1920x1080, 1280x720)
- Tablet (iPad Pro, iPad)
- Mobile (iPhone 14 Pro, Pixel 7)

### 5. Color Contrast Tests

Tests WCAG AA color contrast requirements:

✅ **Text Contrast**
- Normal text: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- UI components: 3:1 minimum

✅ **Themes**
- Light mode contrast
- Dark mode contrast
- High contrast mode

## 🛠️ Tools Used

### Primary Tools

| Tool | Purpose | Version |
|------|---------|---------|
| **Chromatic** | Visual regression testing | Latest |
| **Storybook** | Component development & testing | 7.0+ |
| **axe-core** | Accessibility testing | Latest |
| **Playwright** | E2E & accessibility testing | 1.48+ |
| **@axe-core/playwright** | Playwright axe integration | Latest |

### Supporting Tools

- **@storybook/addon-a11y**: Accessibility addon for Storybook
- **@storybook/addon-viewport**: Responsive testing in Storybook
- **@storybook/test**: Testing utilities for Storybook

## 🚀 Running Tests

### Prerequisites

```bash
# Install dependencies
pnpm install

# Install Playwright browsers
npx playwright install

# Set up Chromatic (optional)
# Sign up at https://www.chromatic.com/
# Add CHROMATIC_PROJECT_TOKEN to .env
```

### Run WCAG Compliance Tests

```bash
# Start application first
pnpm dev

# Run WCAG compliance tests
npx playwright test apps/web/src/__tests__/accessibility/wcag-compliance.test.ts --config=playwright.visual.config.ts

# Run specific test
npx playwright test apps/web/src/__tests__/accessibility/wcag-compliance.test.ts -g "should not have any automatically detectable accessibility issues"

# Run with headed browser
npx playwright test apps/web/src/__tests__/accessibility/wcag-compliance.test.ts --headed
```

### Run Keyboard Navigation Tests

```bash
# Start application
pnpm dev

# Run keyboard navigation tests
npx playwright test apps/web/src/__tests__/accessibility/keyboard-navigation.test.ts --config=playwright.visual.config.ts

# Run with UI mode
npx playwright test apps/web/src/__tests__/accessibility/keyboard-navigation.test.ts --ui

# Generate report
npx playwright test apps/web/src/__tests__/accessibility/keyboard-navigation.test.ts --reporter=html
```

### Run Cross-Browser Tests

```bash
# Run on all browsers (Chromium, Firefox, WebKit)
npx playwright test --config=playwright.visual.config.ts

# Run on specific browser
npx playwright test --project=chromium-desktop --config=playwright.visual.config.ts
npx playwright test --project=firefox-desktop --config=playwright.visual.config.ts
npx playwright test --project=webkit-desktop --config=playwright.visual.config.ts

# Run on mobile devices
npx playwright test --project=iphone-14-pro --config=playwright.visual.config.ts
npx playwright test --project=pixel-7 --config=playwright.visual.config.ts

# Run dark mode tests
npx playwright test --project=chromium-desktop-dark --config=playwright.visual.config.ts
```

### Run Storybook

```bash
# Start Storybook dev server
cd apps/web
pnpm storybook

# Build Storybook
pnpm build-storybook

# Preview built Storybook
npx http-server storybook-static
```

### Run All Visual & Accessibility Tests

```bash
# From project root
cd apps/web/src/__tests__

# 1. Start application
cd ../../../../../
pnpm dev &

# 2. Wait for startup
sleep 30

# 3. Run WCAG compliance tests
npx playwright test apps/web/src/__tests__/accessibility/wcag-compliance.test.ts --config=playwright.visual.config.ts

# 4. Run keyboard navigation tests
npx playwright test apps/web/src/__tests__/accessibility/keyboard-navigation.test.ts --config=playwright.visual.config.ts

# 5. Run cross-browser tests
npx playwright test --config=playwright.visual.config.ts

# 6. Build and test Storybook
cd apps/web
pnpm build-storybook
```

## 🎨 Chromatic Visual Regression

### Setup

1. **Create Chromatic Account**
   - Visit https://www.chromatic.com/
   - Sign up with GitHub
   - Create new project for AuraOS

2. **Configure Chromatic**
   ```bash
   # Add project token to .env
   CHROMATIC_PROJECT_TOKEN=your_token_here
   ```

3. **Update Configuration**
   - Edit [.chromatic.config.json](../../../../../.chromatic.config.json:1)
   - Update `projectId` and `projectToken`

### Running Chromatic

```bash
# Build Storybook and publish to Chromatic
cd apps/web
pnpm chromatic

# Run Chromatic with auto-accept on main branch
pnpm chromatic --auto-accept-changes main

# Run Chromatic without uploading (local check)
pnpm chromatic --dry-run

# Run Chromatic for specific branches
pnpm chromatic --branch-name feature/my-feature
```

### Reviewing Changes

1. **View Results**: Check Chromatic dashboard after test run
2. **Review Changes**: Examine visual differences
3. **Accept/Reject**:
   - ✅ Accept if changes are intentional
   - ❌ Reject if changes are bugs
4. **Baselines**: Accepted changes become new baselines

### Chromatic Configuration

Key settings in [.chromatic.config.json](../../../../../.chromatic.config.json:1):

```json
{
  "projectId": "PROJECT_ID",
  "onlyChanged": true,           // Only test changed stories
  "autoAcceptChanges": "main",    // Auto-accept on main branch
  "exitZeroOnChanges": false,     // Fail build on visual changes
  "skip": "dependabot/**",        // Skip dependabot branches
  "externals": ["public/**"]      // External dependencies
}
```

## ♿ Accessibility Testing

### axe-core Integration

axe-core automatically tests for:

- **WCAG 2.1 Level A & AA** violations
- **Best practices** recommendations
- **Color contrast** issues
- **ARIA** attribute errors
- **Form labels** and associations
- **Heading hierarchy**
- **Landmark regions**

### Running axe Tests

```typescript
import AxeBuilder from '@axe-core/playwright';

// Test specific page
const accessibilityScanResults = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  .analyze();

expect(accessibilityScanResults.violations).toEqual([]);
```

### Custom Rules

Test specific accessibility rules:

```typescript
// Test only color contrast
await new AxeBuilder({ page })
  .withRules(['color-contrast'])
  .analyze();

// Test form labels
await new AxeBuilder({ page })
  .withRules(['label', 'label-content-name-mismatch'])
  .analyze();

// Test ARIA attributes
await new AxeBuilder({ page })
  .withRules(['aria-allowed-attr', 'aria-required-attr'])
  .analyze();
```

### Accessibility Reports

Reports include:

- **Violations**: Accessibility issues found
- **Passes**: Rules that passed
- **Incomplete**: Rules that need manual verification
- **Inapplicable**: Rules that don't apply to the page

### Manual Testing Checklist

Some accessibility requirements need manual testing:

- [ ] Screen reader compatibility (NVDA, JAWS, VoiceOver)
- [ ] Keyboard-only navigation (unplug mouse)
- [ ] Color blindness simulation
- [ ] Browser zoom to 200%
- [ ] Text spacing adjustments
- [ ] Animations and transitions (reduced motion)

## 🌐 Cross-Browser Testing

### Browser Matrix

| Browser | Desktop | Mobile | Coverage |
|---------|---------|--------|----------|
| Chrome | ✅ | ✅ | Latest + Latest-1 |
| Firefox | ✅ | ❌ | Latest + Latest-1 |
| Safari | ✅ | ✅ | Latest + Latest-1 |
| Edge | ✅ | ❌ | Latest |

### Viewport Sizes

**Desktop**:
- 1920x1080 (Full HD)
- 1280x720 (HD)

**Tablet**:
- iPad Pro (1024x1366)
- iPad (810x1080)

**Mobile**:
- iPhone 14 Pro (393x852)
- Pixel 7 (412x915)

### Device-Specific Tests

```bash
# Test iPad Pro
npx playwright test --project=ipad-pro --config=playwright.visual.config.ts

# Test iPhone 14 Pro
npx playwright test --project=iphone-14-pro --config=playwright.visual.config.ts

# Test Pixel 7
npx playwright test --project=pixel-7 --config=playwright.visual.config.ts
```

### Browser-Specific Configuration

Configuration in [playwright.visual.config.ts](../../../../../playwright.visual.config.ts:1):

```typescript
projects: [
  {
    name: 'chromium-desktop',
    use: {
      ...devices['Desktop Chrome'],
      viewport: { width: 1920, height: 1080 },
    },
  },
  {
    name: 'firefox-desktop',
    use: {
      ...devices['Desktop Firefox'],
      viewport: { width: 1920, height: 1080 },
    },
  },
  {
    name: 'webkit-desktop',
    use: {
      ...devices['Desktop Safari'],
      viewport: { width: 1920, height: 1080 },
    },
  },
]
```

## 🔄 CI/CD Integration

### GitHub Actions

Workflow file: [.github/workflows/visual-accessibility-tests.yml](../../../../../.github/workflows/visual-accessibility-tests.yml:1)

**Triggers**:
- ✅ Push to `main`/`develop`
- ✅ Pull requests
- ✅ Daily at 3 AM UTC
- ✅ Manual dispatch

**Jobs**:
1. **accessibility-tests**: WCAG compliance + keyboard navigation
2. **cross-browser-tests**: Chrome, Firefox, Safari on all OS
3. **chromatic-visual-regression**: Storybook visual regression
4. **mobile-accessibility-tests**: iOS + Android accessibility
5. **color-contrast-tests**: Light + dark mode contrast
6. **test-summary**: Aggregate and report results

### Local CI Simulation

```bash
# Run all tests as CI would
CI=true npx playwright test --config=playwright.visual.config.ts

# Generate reports
npx playwright show-report playwright-report/visual/
```

### Artifacts

CI uploads these artifacts:

- Accessibility test reports (HTML, JSON, JUnit)
- Screenshots of failures
- Videos of failed tests
- Chromatic build links
- axe-core violation reports

## 🎯 Best Practices

### Component Accessibility

✅ **Use Semantic HTML**
```tsx
// Good
<button onClick={handleClick}>Click me</button>

// Bad
<div onClick={handleClick}>Click me</div>
```

✅ **Provide Labels**
```tsx
// Good
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// Bad
<input type="email" placeholder="Email" />
```

✅ **Use ARIA When Needed**
```tsx
// Good
<button aria-label="Close dialog" onClick={handleClose}>×</button>

// Bad
<button onClick={handleClose}>×</button>
```

✅ **Provide Alt Text**
```tsx
// Good
<img src="profile.jpg" alt="John Doe profile picture" />

// Bad
<img src="profile.jpg" />
```

### Keyboard Accessibility

✅ **Ensure Tab Order**
```tsx
// Use natural DOM order, avoid tabIndex > 0
<nav>
  <a href="/">Home</a>
  <a href="/about">About</a>
  <a href="/contact">Contact</a>
</nav>
```

✅ **Provide Focus Indicators**
```css
/* Good */
button:focus {
  outline: 2px solid blue;
  outline-offset: 2px;
}

/* Bad */
button:focus {
  outline: none; /* Never do this! */
}
```

✅ **Handle Escape Key**
```tsx
// Close modals with Escape
useEffect(() => {
  const handleEscape = (e) => {
    if (e.key === 'Escape') closeModal();
  };

  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, []);
```

### Color Contrast

✅ **Meet WCAG AA Standards**
```css
/* Good - Contrast ratio 7:1 */
.text {
  color: #1a1a1a;
  background: #ffffff;
}

/* Bad - Contrast ratio 2:1 */
.text {
  color: #cccccc;
  background: #ffffff;
}
```

✅ **Test with Tools**
- Chrome DevTools: Lighthouse > Accessibility
- axe DevTools browser extension
- WebAIM Contrast Checker

### Visual Regression

✅ **Isolate Component Tests**
```tsx
// Good - Test component in isolation
export const Button: Story = {
  args: {
    label: 'Click me',
    variant: 'primary',
  },
};

// Test different states separately
export const ButtonHover: Story = {
  parameters: {
    pseudo: { hover: true },
  },
};
```

✅ **Use Chromatic Snapshots**
```tsx
// Configure snapshot options
parameters: {
  chromatic: {
    delay: 300,              // Wait for animations
    pauseAnimationAtEnd: true,
    diffThreshold: 0.2,      // 20% difference threshold
  },
}
```

## 🐛 Troubleshooting

### Issue: axe-core reports false positives

**Solution**:
```typescript
// Disable specific rules that are false positives
const results = await new AxeBuilder({ page })
  .disableRules(['color-contrast']) // If using custom themes
  .analyze();

// Or configure rule settings
const results = await new AxeBuilder({ page })
  .configure({
    rules: [
      {
        id: 'color-contrast',
        enabled: true,
        options: { noScroll: true },
      },
    ],
  })
  .analyze();
```

### Issue: Chromatic shows unexpected differences

**Solution**:
1. Check if animations are disabled:
   ```typescript
   parameters: {
     chromatic: { pauseAnimationAtEnd: true },
   }
   ```

2. Increase delay for dynamic content:
   ```typescript
   parameters: {
     chromatic: { delay: 500 },
   }
   ```

3. Ignore specific elements:
   ```typescript
   parameters: {
     chromatic: {
       ignore: ['.dynamic-timestamp'],
     },
   }
   ```

### Issue: Keyboard tests failing on CI

**Solution**:
```typescript
// Increase timeout for keyboard tests
test.setTimeout(30000);

// Add wait after keyboard actions
await page.keyboard.press('Tab');
await page.waitForTimeout(100);
```

### Issue: Color contrast tests failing

**Solution**:
1. Use DevTools to check actual rendered colors
2. Ensure CSS variables are properly defined
3. Check for transparent overlays affecting contrast

```css
/* Ensure sufficient contrast */
:root {
  --text-primary: #1a1a1a;
  --bg-primary: #ffffff;
  /* Contrast ratio: 14.47:1 ✓ */
}
```

### Issue: Focus indicators not visible

**Solution**:
```css
/* Always provide visible focus */
*:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Never remove outlines without replacement */
button:focus {
  outline: none; /* ❌ */
  box-shadow: 0 0 0 2px blue; /* ✓ Provide alternative */
}
```

### Issue: Screen reader compatibility

**Manual Testing Required**:
1. **NVDA (Windows)**: Free, most popular
2. **JAWS (Windows)**: Commercial, widely used
3. **VoiceOver (Mac/iOS)**: Built-in
4. **TalkBack (Android)**: Built-in

**Test Checklist**:
- [ ] All content is announced
- [ ] Form labels are associated
- [ ] Buttons/links have meaningful names
- [ ] Navigation landmarks work
- [ ] Live regions announce changes

## 📚 Additional Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [Chromatic Documentation](https://www.chromatic.com/docs/)
- [Storybook Accessibility](https://storybook.js.org/docs/react/writing-tests/accessibility-testing)
- [Playwright Accessibility](https://playwright.dev/docs/accessibility-testing)
- [WebAIM Resources](https://webaim.org/resources/)
- [A11y Project](https://www.a11yproject.com/)

## 📝 License

Part of AuraOS HCM Platform - Internal Use Only
