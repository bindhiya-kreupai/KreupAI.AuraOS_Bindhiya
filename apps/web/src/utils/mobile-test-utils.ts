// @ts-nocheck — Has TS errors against current Prisma/schema shapes or service contracts. Tracked under #29 for proper fix.
/**
 * @module mobile-test-utils
 * @description Mobile testing utilities — swipe/pinch simulation, network condition testing,
 *              render performance measurement, accessibility auditing, screenshot generation,
 *              viewport presets (Sec 15.5)
 * @project AURA HCM Platform
 */

// ============================================================================
// TYPES
// ============================================================================

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';
export type NetworkCondition = 'online' | '4g' | '3g' | '2g' | 'slow_2g' | 'offline';
export type ViewportPreset =
  | 'iphone_se'
  | 'iphone_14'
  | 'ipad'
  | 'android_phone'
  | 'android_tablet'
  | 'desktop';

export interface SwipeResult {
  direction: SwipeDirection;
  distance: number;
  duration: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  velocity: number; // px/ms
}

export interface PinchResult {
  scale: number;
  centerX: number;
  centerY: number;
  distance: number;
  type: 'zoom_in' | 'zoom_out';
}

export interface NetworkConditionConfig {
  condition: NetworkCondition;
  downloadKbps: number;
  uploadKbps: number;
  latencyMs: number;
  packetLoss: number; // 0–1
}

export interface RenderPerformanceResult {
  componentName: string;
  renderTimeMs: number;
  reRenderCount: number;
  domNodeCount: number;
  memoryUsageMb: number | null;
  framesPerSecond: number;
  isPerformant: boolean; // renderTimeMs < 16ms (60fps threshold)
  warnings: string[];
}

export interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  rule: string;
  description: string;
  element?: string;
  fix: string;
}

export interface AccessibilityResult {
  score: number; // 0–100
  issues: AccessibilityIssue[];
  passedChecks: string[];
  hasAriaLabels: boolean;
  hasContrastIssues: boolean;
  hasKeyboardNav: boolean;
  hasFocusIndicators: boolean;
}

export interface ScreenshotResult {
  componentName: string;
  viewport: ViewportPreset;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  dataUrl: string; // base64 placeholder
  timestamp: string;
}

export interface ViewportDimensions {
  width: number;
  height: number;
  devicePixelRatio: number;
  userAgent: string;
  label: string;
}

// ============================================================================
// VIEWPORT PRESETS
// ============================================================================

export const VIEWPORT_PRESETS: Record<ViewportPreset, ViewportDimensions> = {
  iphone_se: {
    width: 375,
    height: 667,
    devicePixelRatio: 2,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
    label: 'iPhone SE',
  },
  iphone_14: {
    width: 390,
    height: 844,
    devicePixelRatio: 3,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
    label: 'iPhone 14',
  },
  ipad: {
    width: 820,
    height: 1180,
    devicePixelRatio: 2,
    userAgent:
      'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
    label: 'iPad (10th gen)',
  },
  android_phone: {
    width: 412,
    height: 915,
    devicePixelRatio: 2.625,
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
    label: 'Android Phone',
  },
  android_tablet: {
    width: 800,
    height: 1280,
    devicePixelRatio: 2,
    userAgent:
      'Mozilla/5.0 (Linux; Android 13; Samsung Galaxy Tab S8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    label: 'Android Tablet',
  },
  desktop: {
    width: 1440,
    height: 900,
    devicePixelRatio: 1,
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    label: 'Desktop (1440px)',
  },
};

// ============================================================================
// NETWORK CONDITIONS
// ============================================================================

export const NETWORK_CONFIGS: Record<NetworkCondition, NetworkConditionConfig> = {
  online: {
    condition: 'online',
    downloadKbps: 100_000,
    uploadKbps: 50_000,
    latencyMs: 5,
    packetLoss: 0,
  },
  '4g': {
    condition: '4g',
    downloadKbps: 20_000,
    uploadKbps: 10_000,
    latencyMs: 50,
    packetLoss: 0.01,
  },
  '3g': { condition: '3g', downloadKbps: 1_500, uploadKbps: 750, latencyMs: 200, packetLoss: 0.03 },
  '2g': { condition: '2g', downloadKbps: 250, uploadKbps: 50, latencyMs: 500, packetLoss: 0.05 },
  slow_2g: {
    condition: 'slow_2g',
    downloadKbps: 50,
    uploadKbps: 20,
    latencyMs: 2_000,
    packetLoss: 0.1,
  },
  offline: {
    condition: 'offline',
    downloadKbps: 0,
    uploadKbps: 0,
    latencyMs: Infinity,
    packetLoss: 1,
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Simulate a swipe gesture in a given direction over a specified distance.
 * Returns a SwipeResult describing the synthetic pointer events dispatched.
 */
export function simulateSwipe(
  target: HTMLElement | null,
  direction: SwipeDirection,
  distance: number = 100,
  duration: number = 300
): SwipeResult {
  const rect = target?.getBoundingClientRect() ?? { left: 0, top: 0, width: 200, height: 200 };
  const startX = rect.left + rect.width / 2;
  const startY = rect.top + rect.height / 2;

  let endX = startX;
  let endY = startY;
  switch (direction) {
    case 'left':
      endX = startX - distance;
      break;
    case 'right':
      endX = startX + distance;
      break;
    case 'up':
      endY = startY - distance;
      break;
    case 'down':
      endY = startY + distance;
      break;
  }

  if (target && typeof window !== 'undefined') {
    const touchStart = new TouchEvent('touchstart', {
      bubbles: true,
      touches: [new Touch({ identifier: 1, target, clientX: startX, clientY: startY })],
    });
    const touchEnd = new TouchEvent('touchend', {
      bubbles: true,
      changedTouches: [new Touch({ identifier: 1, target, clientX: endX, clientY: endY })],
    });
    target.dispatchEvent(touchStart);
    setTimeout(() => target.dispatchEvent(touchEnd), duration);
  }

  return {
    direction,
    distance,
    duration,
    startX,
    startY,
    endX,
    endY,
    velocity: distance / duration,
  };
}

/**
 * Simulate a pinch gesture (zoom in/out) at the center of the target element.
 */
export function simulatePinch(target: HTMLElement | null, scale: number = 1.5): PinchResult {
  const rect = target?.getBoundingClientRect() ?? { left: 0, top: 0, width: 200, height: 200 };
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const initialDistance = 50;
  const finalDistance = initialDistance * scale;

  if (target && typeof window !== 'undefined') {
    // Dispatch pointer events simulating two-finger pinch
    const pointerDown1 = new PointerEvent('pointerdown', {
      pointerId: 1,
      clientX: centerX - initialDistance / 2,
      clientY: centerY,
      bubbles: true,
    });
    const pointerDown2 = new PointerEvent('pointerdown', {
      pointerId: 2,
      clientX: centerX + initialDistance / 2,
      clientY: centerY,
      bubbles: true,
    });
    const pointerMove1 = new PointerEvent('pointermove', {
      pointerId: 1,
      clientX: centerX - finalDistance / 2,
      clientY: centerY,
      bubbles: true,
    });
    const pointerMove2 = new PointerEvent('pointermove', {
      pointerId: 2,
      clientX: centerX + finalDistance / 2,
      clientY: centerY,
      bubbles: true,
    });
    target.dispatchEvent(pointerDown1);
    target.dispatchEvent(pointerDown2);
    setTimeout(() => {
      target.dispatchEvent(pointerMove1);
      target.dispatchEvent(pointerMove2);
    }, 50);
  }

  return {
    scale,
    centerX,
    centerY,
    distance: finalDistance,
    type: scale > 1 ? 'zoom_in' : 'zoom_out',
  };
}

/**
 * Simulate network conditions by throttling fetch requests via a patched global fetch.
 * Returns a cleanup function to restore the original fetch.
 */
export function simulateNetworkCondition(condition: NetworkCondition): {
  config: NetworkConditionConfig;
  restore: () => void;
} {
  const config = NETWORK_CONFIGS[condition];
  const originalFetch = globalThis.fetch;

  if (condition === 'offline') {
    globalThis.fetch = () => Promise.reject(new Error('Network request failed: offline'));
  } else {
    globalThis.fetch = async (...args) => {
      await new Promise((r) => setTimeout(r, config.latencyMs));
      if (Math.random() < config.packetLoss) {
        throw new Error(`Network request failed: packet loss (${condition})`);
      }
      return originalFetch(...args);
    };
  }

  return {
    config,
    restore: () => {
      globalThis.fetch = originalFetch;
    },
  };
}

/**
 * Measure the render performance of a component render function.
 * Uses performance.now() for timing and document.querySelectorAll for DOM node count.
 */
export function measureRenderPerformance(
  componentName: string,
  renderFn: () => void,
  iterations: number = 10
): RenderPerformanceResult {
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
    renderFn();
    const end = typeof performance !== 'undefined' ? performance.now() : Date.now();
    times.push(end - start);
  }

  const avgRenderTime = times.reduce((s, t) => s + t, 0) / times.length;
  const domNodeCount = typeof document !== 'undefined' ? document.querySelectorAll('*').length : 0;
  const memoryUsageMb =
    typeof performance !== 'undefined' && 'memory' in performance
      ? (performance as unknown as { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize /
        (1024 * 1024)
      : null;

  const warnings: string[] = [];
  if (avgRenderTime > 16)
    warnings.push(`Render time ${avgRenderTime.toFixed(1)}ms exceeds 16ms (60fps) threshold`);
  if (domNodeCount > 1500)
    warnings.push(`High DOM node count: ${domNodeCount} (recommended < 1500)`);
  if (memoryUsageMb && memoryUsageMb > 50)
    warnings.push(`High memory usage: ${memoryUsageMb.toFixed(1)}MB`);

  return {
    componentName,
    renderTimeMs: parseFloat(avgRenderTime.toFixed(2)),
    reRenderCount: iterations,
    domNodeCount,
    memoryUsageMb: memoryUsageMb ? parseFloat(memoryUsageMb.toFixed(2)) : null,
    framesPerSecond: Math.min(60, Math.round(1000 / Math.max(avgRenderTime, 1))),
    isPerformant: avgRenderTime < 16,
    warnings,
  };
}

/**
 * Perform an accessibility audit on an HTML element.
 * Checks for ARIA labels, color contrast, keyboard navigation, and focus indicators.
 */
export function checkAccessibility(element: HTMLElement | null): AccessibilityResult {
  if (!element) {
    return {
      score: 0,
      issues: [
        {
          type: 'error',
          rule: 'element-exists',
          description: 'Element is null',
          fix: 'Ensure element is mounted in the DOM',
        },
      ],
      passedChecks: [],
      hasAriaLabels: false,
      hasContrastIssues: false,
      hasKeyboardNav: false,
      hasFocusIndicators: false,
    };
  }

  const issues: AccessibilityIssue[] = [];
  const passedChecks: string[] = [];

  // Check ARIA labels on interactive elements
  const interactiveElements = element.querySelectorAll(
    'button, a, input, select, textarea, [role="button"], [role="link"]'
  );
  let ariaLabelCount = 0;
  interactiveElements.forEach((el) => {
    const hasLabel =
      el.getAttribute('aria-label') ||
      el.getAttribute('aria-labelledby') ||
      (el as HTMLInputElement).labels?.length > 0 ||
      el.textContent?.trim();
    if (hasLabel) {
      ariaLabelCount++;
    } else {
      issues.push({
        type: 'error',
        rule: 'aria-label-missing',
        description: `Interactive element missing accessible label: <${el.tagName.toLowerCase()}>`,
        element: el.outerHTML.slice(0, 100),
        fix: 'Add aria-label, aria-labelledby, or visible text content',
      });
    }
  });
  const hasAriaLabels =
    interactiveElements.length === 0 || ariaLabelCount === interactiveElements.length;
  if (hasAriaLabels) passedChecks.push('All interactive elements have accessible labels');

  // Check images for alt text
  const images = element.querySelectorAll('img');
  images.forEach((img) => {
    if (!img.getAttribute('alt') && img.getAttribute('role') !== 'presentation') {
      issues.push({
        type: 'error',
        rule: 'image-alt-missing',
        description: `Image missing alt text: ${img.src?.slice(-40) ?? 'unknown'}`,
        fix: 'Add descriptive alt attribute or role="presentation" for decorative images',
      });
    }
  });
  if (images.length === 0 || !issues.find((i) => i.rule === 'image-alt-missing')) {
    passedChecks.push('All images have alt text');
  }

  // Check for heading hierarchy
  const headings = Array.from(element.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  if (headings.length === 0) {
    issues.push({
      type: 'warning',
      rule: 'heading-missing',
      description: 'No headings found — screen readers rely on headings for navigation',
      fix: 'Add at least one heading element (h1–h6)',
    });
  } else {
    passedChecks.push('Heading structure present');
  }

  // Check for focus indicators (simplified: look for focus-visible or ring classes)
  const hasFocusClasses =
    element.innerHTML.includes('focus:') || element.innerHTML.includes('focus-visible');
  const hasFocusIndicators = hasFocusClasses;
  if (hasFocusIndicators) {
    passedChecks.push('Focus indicators detected');
  } else {
    issues.push({
      type: 'warning',
      rule: 'focus-indicator',
      description: 'Focus indicators may be missing for keyboard users',
      fix: 'Add focus:ring or focus-visible styles to interactive elements',
    });
  }

  // Check for keyboard navigation (tabindex)
  const tabbable = element.querySelectorAll('[tabindex="-1"]');
  const hasKeyboardNav = tabbable.length === 0; // negative tabindex elements are problematic
  if (hasKeyboardNav) {
    passedChecks.push('No keyboard traps detected');
  } else {
    issues.push({
      type: 'warning',
      rule: 'keyboard-trap',
      description: `${tabbable.length} elements with tabindex="-1" may disrupt keyboard navigation`,
      fix: 'Remove unnecessary negative tabindex values',
    });
  }

  // Check color contrast (simplified heuristic: look for low-contrast text classes)
  const lowContrastPatterns = ['text-gray-300', 'text-slate-200', 'text-white/30', 'text-gray-100'];
  const hasContrastIssues = lowContrastPatterns.some((p) => element.innerHTML.includes(p));
  if (hasContrastIssues) {
    issues.push({
      type: 'warning',
      rule: 'color-contrast',
      description: 'Potential low color contrast text detected',
      fix: 'Ensure text meets WCAG AA contrast ratio (4.5:1 for normal text)',
    });
  } else {
    passedChecks.push('No obvious color contrast issues detected');
  }

  // Check for lang attribute on root
  const htmlEl = typeof document !== 'undefined' ? document.documentElement : null;
  if (htmlEl && !htmlEl.getAttribute('lang')) {
    issues.push({
      type: 'warning',
      rule: 'html-lang',
      description: 'HTML element missing lang attribute',
      fix: 'Add lang="en" (or appropriate language) to <html> element',
    });
  } else {
    passedChecks.push('Document language declared');
  }

  // Calculate score
  const errorCount = issues.filter((i) => i.type === 'error').length;
  const warningCount = issues.filter((i) => i.type === 'warning').length;
  const totalChecks = passedChecks.length + errorCount + warningCount;
  const score = totalChecks > 0 ? Math.round((passedChecks.length / totalChecks) * 100) : 100;

  return {
    score,
    issues,
    passedChecks,
    hasAriaLabels,
    hasContrastIssues,
    hasKeyboardNav,
    hasFocusIndicators,
  };
}

/**
 * Generate a responsive screenshot metadata record for a component at a specific viewport.
 * In a real implementation this would use canvas or a headless browser; here it returns
 * a structured result with viewport metadata and a placeholder dataUrl.
 */
export function generateScreenshot(
  componentName: string,
  viewport: ViewportPreset,
  orientation: 'portrait' | 'landscape' = 'portrait'
): ScreenshotResult {
  const dims = VIEWPORT_PRESETS[viewport];
  const width = orientation === 'portrait' ? dims.width : dims.height;
  const height = orientation === 'portrait' ? dims.height : dims.width;

  // Generate a placeholder 1x1 transparent PNG as base64
  const placeholderDataUrl =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  return {
    componentName,
    viewport,
    width,
    height,
    orientation,
    dataUrl: placeholderDataUrl,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate screenshots for all viewport presets for a given component.
 */
export function generateAllViewportScreenshots(
  componentName: string,
  orientation: 'portrait' | 'landscape' = 'portrait'
): ScreenshotResult[] {
  return (Object.keys(VIEWPORT_PRESETS) as ViewportPreset[]).map((vp) =>
    generateScreenshot(componentName, vp, orientation)
  );
}

/**
 * Helper: wait for next animation frame (useful in test utilities to flush DOM updates)
 */
export function waitForFrame(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => resolve());
    } else {
      setTimeout(resolve, 16);
    }
  });
}

/**
 * Helper: simulate tap at coordinates on an element
 */
export function simulateTap(target: HTMLElement, x?: number, y?: number): void {
  const rect = target.getBoundingClientRect();
  const clientX = x ?? rect.left + rect.width / 2;
  const clientY = y ?? rect.top + rect.height / 2;

  target.dispatchEvent(new PointerEvent('pointerdown', { clientX, clientY, bubbles: true }));
  target.dispatchEvent(new PointerEvent('pointerup', { clientX, clientY, bubbles: true }));
  target.dispatchEvent(new MouseEvent('click', { clientX, clientY, bubbles: true }));
}

/**
 * Helper: get all touchable/interactive elements within a container
 */
export function getInteractiveElements(container: HTMLElement): Element[] {
  return Array.from(
    container.querySelectorAll(
      'button, a, input, select, textarea, [role="button"], [role="link"], [role="checkbox"], [role="radio"], [tabindex]'
    )
  );
}
