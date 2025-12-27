/**
 * Axe Accessibility Testing Setup
 * Configures jest-axe for automated accessibility testing
 */

import { configureAxe } from 'jest-axe';

/**
 * Custom axe configuration for AuraOS
 *
 * Configured to test against WCAG 2.1 Level AA standards
 */
export const axe = configureAxe({
  rules: {
    // WCAG 2.1 Level A & AA rules
    'color-contrast': { enabled: true },
    'valid-lang': { enabled: true },
    'html-has-lang': { enabled: true },
    'label': { enabled: true },
    'button-name': { enabled: true },
    'link-name': { enabled: true },
    'image-alt': { enabled: true },
    'document-title': { enabled: true },
    'duplicate-id': { enabled: true },
    'heading-order': { enabled: true },
    'landmark-one-main': { enabled: true },
    'region': { enabled: true },

    // Form accessibility
    'label-title-only': { enabled: true },
    'select-name': { enabled: true },
    'form-field-multiple-labels': { enabled: true },

    // Keyboard navigation
    'focus-order-semantics': { enabled: true },
    'tabindex': { enabled: true },

    // ARIA
    'aria-valid-attr': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    'aria-allowed-attr': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-required-children': { enabled: true },
    'aria-required-parent': { enabled: true },

    // Disable rules that may cause false positives in testing
    'region': { enabled: false } // Often triggers on test components
  }
});

/**
 * Custom axe matcher for Vitest
 * Usage:
 *
 * ```typescript
 * const { container } = render(<Component />);
 * const results = await axe(container);
 * expect(results).toHaveNoViolations();
 * ```
 */
export const toHaveNoViolations = (results: any) => {
  const violations = results.violations;

  if (violations.length === 0) {
    return {
      pass: true,
      message: () => 'No accessibility violations found'
    };
  }

  const violationMessages = violations.map((violation: any) => {
    const nodes = violation.nodes.map((node: any) => {
      return `  - ${node.html}\n    ${node.failureSummary}`;
    }).join('\n');

    return `${violation.help} (${violation.id})\n${nodes}`;
  }).join('\n\n');

  return {
    pass: false,
    message: () => `Expected no accessibility violations but found ${violations.length}:\n\n${violationMessages}`
  };
};

// Extend Vitest matchers
if (typeof expect !== 'undefined') {
  expect.extend({ toHaveNoViolations });
}
