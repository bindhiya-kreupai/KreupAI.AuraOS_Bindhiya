# Accessibility Testing Checklist
**Version:** 1.0
**Last Updated:** December 27, 2024
**Owner:** Dev B (QA Specialist)
**Standard:** WCAG 2.1 Level AA

---

## Overview

This checklist ensures all UI components and user flows meet WCAG 2.1 Level AA accessibility standards. Each component must pass both **automated** and **manual** accessibility tests before being merged.

---

## Automated Testing (Using axe-core)

### Required for All Components

```typescript
import { render } from '@testing-library/react';
import { axe } from '@/__tests__/setupAxe';

it('has no accessibility violations', async () => {
  const { container } = render(<YourComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

**Automated Tools:**
- ✅ jest-axe (in unit/component tests)
- ✅ Lighthouse CI (in pipeline)
- ✅ Pa11y (scheduled scans)

---

## Manual Testing Checklist

### 1. Keyboard Navigation (WCAG 2.1.1, 2.1.2)

**Test all interactive elements:**

- [ ] **Tab Navigation**
  - [ ] All interactive elements (buttons, links, inputs) are reachable via Tab
  - [ ] Tab order is logical and follows visual flow
  - [ ] No keyboard traps (users can tab out of all elements)
  - [ ] Skip links available for main content

- [ ] **Focus Indicators**
  - [ ] All focusable elements have visible focus indicator
  - [ ] Focus indicator has sufficient contrast (≥ 3:1)
  - [ ] Focus indicator is not removed via CSS (outline: none)
  - [ ] Custom focus styles meet contrast requirements

- [ ] **Keyboard Shortcuts**
  - [ ] Escape key closes modals, dropdowns, dialogs
  - [ ] Enter/Space activates buttons and links
  - [ ] Arrow keys navigate within complex widgets (dropdowns, tabs)
  - [ ] All shortcuts work without mouse

**How to Test:**
1. Unplug your mouse
2. Navigate entire component using only keyboard
3. Verify all actions can be completed
4. Check focus is always visible

---

### 2. Screen Reader Testing (WCAG 4.1.2)

**Test with Multiple Screen Readers:**

| Screen Reader | Platform | Priority |
|---------------|----------|----------|
| NVDA | Windows | High |
| JAWS | Windows | Medium |
| VoiceOver | macOS | High |
| TalkBack | Android | Medium |
| VoiceOver | iOS | Medium |

**Required Tests:**

- [ ] **Semantic HTML**
  - [ ] Headings are properly nested (h1 → h2 → h3)
  - [ ] Landmarks used correctly (header, nav, main, aside, footer)
  - [ ] Lists used for list content (ul, ol)
  - [ ] Tables have proper headers (th, scope)

- [ ] **Form Labels**
  - [ ] All form fields have associated labels
  - [ ] Labels announced when field receives focus
  - [ ] Error messages linked to fields (aria-describedby)
  - [ ] Required fields indicated (aria-required or required)

- [ ] **Images & Icons**
  - [ ] All meaningful images have alt text
  - [ ] Decorative images have empty alt="" or role="presentation"
  - [ ] Icon buttons have accessible names (aria-label)
  - [ ] Complex images have extended descriptions

- [ ] **ARIA Attributes**
  - [ ] aria-label used for elements without visible text
  - [ ] aria-labelledby used for complex labels
  - [ ] aria-describedby used for additional context
  - [ ] aria-live regions for dynamic content
  - [ ] aria-expanded for collapsible sections
  - [ ] aria-pressed for toggle buttons
  - [ ] aria-selected for tabs

- [ ] **Dynamic Content**
  - [ ] Screen reader announces loading states
  - [ ] Success/error messages announced (aria-live)
  - [ ] Modal focus trapped properly
  - [ ] Focus returned to trigger element on close

**How to Test:**
1. Open screen reader (NVDA: Ctrl+Alt+N)
2. Navigate page using screen reader shortcuts
3. Verify all content is announced correctly
4. Check announcements are meaningful

---

### 3. Color & Contrast (WCAG 1.4.3, 1.4.11)

**Contrast Requirements:**

| Element Type | Normal Text | Large Text | UI Components |
|--------------|-------------|------------|---------------|
| WCAG AA | 4.5:1 | 3:1 | 3:1 |
| WCAG AAA | 7:1 | 4.5:1 | - |

**Tests:**

- [ ] **Text Contrast**
  - [ ] Body text has ≥ 4.5:1 contrast ratio
  - [ ] Large text (18pt+) has ≥ 3:1 contrast ratio
  - [ ] Link text is distinguishable from body text
  - [ ] Placeholder text has ≥ 4.5:1 contrast

- [ ] **UI Component Contrast**
  - [ ] Button borders have ≥ 3:1 contrast
  - [ ] Input field borders have ≥ 3:1 contrast
  - [ ] Focus indicators have ≥ 3:1 contrast
  - [ ] Icons have ≥ 3:1 contrast

- [ ] **Color Independence**
  - [ ] Information not conveyed by color alone
  - [ ] Error states have icons or text, not just red color
  - [ ] Success states identifiable without green
  - [ ] Required fields marked with * and label

**Tools:**
- Chrome DevTools: Lighthouse > Accessibility
- WAVE Browser Extension
- Color Contrast Analyzer
- WebAIM Contrast Checker

---

### 4. Text & Content (WCAG 1.4.4, 1.4.10, 1.4.12)

**Tests:**

- [ ] **Text Resizing**
  - [ ] Text can be resized to 200% without loss of content
  - [ ] No horizontal scrolling at 200% zoom
  - [ ] Layout remains functional at 400% zoom (mobile)
  - [ ] No text truncation at larger sizes

- [ ] **Reflow**
  - [ ] Content reflows at 320px width (mobile)
  - [ ] No horizontal scrolling at 1280px width
  - [ ] All content remains visible when zoomed

- [ ] **Text Spacing**
  - [ ] Content readable with increased line height (1.5x)
  - [ ] Content readable with increased paragraph spacing (2x)
  - [ ] Content readable with increased letter spacing (0.12x)
  - [ ] Content readable with increased word spacing (0.16x)

**How to Test:**
1. Browser zoom to 200%
2. Verify all content visible
3. Resize to 320px width
4. Check for horizontal scroll

---

### 5. Forms & Input (WCAG 3.3.1, 3.3.2)

**Tests:**

- [ ] **Labels & Instructions**
  - [ ] All inputs have visible labels
  - [ ] Labels remain visible when input is focused
  - [ ] Instructions provided before form fields
  - [ ] Format requirements stated (e.g., "MM/DD/YYYY")

- [ ] **Error Handling**
  - [ ] Errors clearly identified
  - [ ] Error messages are specific and helpful
  - [ ] Errors announced to screen readers
  - [ ] Form can be submitted with errors fixed

- [ ] **Input Assistance**
  - [ ] Autocomplete attributes used where appropriate
  - [ ] Input types set correctly (email, tel, number)
  - [ ] Required fields clearly marked
  - [ ] Optional fields labeled as optional

**Example:**
```html
<label for="email">
  Email Address <span aria-label="required">*</span>
</label>
<input
  id="email"
  type="email"
  autocomplete="email"
  aria-required="true"
  aria-describedby="email-error"
/>
<div id="email-error" role="alert" aria-live="polite">
  <!-- Error message appears here -->
</div>
```

---

### 6. Interactive Components (WCAG 4.1.2)

**Modals/Dialogs:**

- [ ] Focus moves to modal on open
- [ ] Focus trapped within modal
- [ ] Escape key closes modal
- [ ] Focus returns to trigger on close
- [ ] Modal has role="dialog" and aria-modal="true"
- [ ] Modal has accessible name (aria-labelledby)

**Dropdowns/Select:**

- [ ] Keyboard navigable (Arrow keys)
- [ ] Current selection announced
- [ ] Escape key closes dropdown
- [ ] Enter/Space selects option
- [ ] Options have proper ARIA roles

**Tabs:**

- [ ] Tab list has role="tablist"
- [ ] Tabs have role="tab"
- [ ] Tab panels have role="tabpanel"
- [ ] Arrow keys navigate between tabs
- [ ] Selected tab has aria-selected="true"

**Accordions:**

- [ ] Expand/collapse with Enter/Space
- [ ] Current state announced (aria-expanded)
- [ ] Content hidden when collapsed
- [ ] Headings used for accordion titles

**Data Tables:**

- [ ] Table has <caption> or aria-label
- [ ] Header cells use <th> with scope
- [ ] Complex tables use aria-rowheader/aria-colheader
- [ ] Sortable columns indicate sort direction

---

### 7. Media & Multimedia (WCAG 1.2.1, 1.2.2, 1.2.3)

**Tests:**

- [ ] **Video**
  - [ ] Captions provided for all videos
  - [ ] Audio descriptions available
  - [ ] Video can be paused
  - [ ] No auto-play (or can be paused within 3 seconds)

- [ ] **Audio**
  - [ ] Transcripts provided
  - [ ] Audio can be paused/stopped
  - [ ] Volume can be controlled

- [ ] **Animations**
  - [ ] Animations can be paused
  - [ ] prefers-reduced-motion respected
  - [ ] No seizure-inducing flashes (< 3 flashes/second)

---

### 8. Mobile Accessibility (WCAG 2.5.1, 2.5.2, 2.5.5)

**Tests:**

- [ ] **Touch Targets**
  - [ ] Minimum touch target size: 44x44px
  - [ ] Adequate spacing between touch targets
  - [ ] Touch targets don't overlap

- [ ] **Gestures**
  - [ ] All functionality available via simple gestures
  - [ ] Alternative to complex gestures provided
  - [ ] Swipe actions have cancel mechanism

- [ ] **Orientation**
  - [ ] Content works in both portrait and landscape
  - [ ] No orientation lock (unless essential)

- [ ] **Motion**
  - [ ] Shake/tilt not required for operation
  - [ ] Alternative input methods available

---

## Testing Workflow

### For Each New Component

**Step 1: Automated Tests**
```bash
pnpm test ComponentName.test.tsx
```

**Step 2: Manual Keyboard Test** (5 min)
- Navigate with Tab only
- Verify focus indicators
- Test all interactions

**Step 3: Screen Reader Test** (10 min)
- Test with NVDA (Windows) or VoiceOver (Mac)
- Verify all content announced
- Check ARIA labels

**Step 4: Color Contrast** (2 min)
- Run Lighthouse audit
- Check WAVE extension
- Verify minimum 4.5:1 ratio

**Step 5: Mobile Test** (5 min)
- Test on actual device or emulator
- Verify touch targets
- Test with screen reader

---

## Testing Schedule

**Per Component:** ~25 minutes
- Automated: 2 min
- Keyboard: 5 min
- Screen Reader: 10 min
- Contrast: 2 min
- Mobile: 5 min
- Documentation: 1 min

**CI/CD Pipeline:**
- Automated axe tests run on every PR
- Lighthouse audit runs on merge to main
- Full manual audit: Weekly

---

## Common Violations & Fixes

### ❌ Missing Alt Text
```tsx
// Bad
<img src="profile.jpg" />

// Good
<img src="profile.jpg" alt="John Doe's profile picture" />
```

### ❌ Missing Form Label
```tsx
// Bad
<input type="text" placeholder="Email" />

// Good
<label htmlFor="email">Email</label>
<input id="email" type="email" />
```

### ❌ Poor Color Contrast
```css
/* Bad - Contrast ratio: 2.5:1 */
color: #757575;
background: #ffffff;

/* Good - Contrast ratio: 4.6:1 */
color: #595959;
background: #ffffff;
```

### ❌ Missing Focus Indicator
```css
/* Bad */
button:focus {
  outline: none;
}

/* Good */
button:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}
```

### ❌ Unlabeled Icon Button
```tsx
// Bad
<button><TrashIcon /></button>

// Good
<button aria-label="Delete item">
  <TrashIcon aria-hidden="true" />
</button>
```

---

## Resources

**Documentation:**
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

**Tools:**
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Color Contrast Analyzer](https://www.tpgi.com/color-contrast-checker/)
- [NV Access (NVDA)](https://www.nvaccess.org/)

**Testing Services:**
- [WebAIM](https://webaim.org/)
- [Deque University](https://dequeuniversity.com/)
- [AccessibilityOz](https://www.accessibilityoz.com/)

---

## Sign-off

**Component Name:** _____________________
**Test Date:** _____________________
**Tested By:** _____________________

**Automated Tests:**
- [ ] Passed axe-core scan (0 violations)

**Manual Tests:**
- [ ] Keyboard navigation verified
- [ ] Screen reader tested (NVDA/VoiceOver)
- [ ] Color contrast verified
- [ ] Mobile accessibility tested

**Issues Found:**
_____________________

**Status:**
- [ ] ✅ Approved for merge
- [ ] ⚠️ Needs fixes
- [ ] ❌ Blocked

---

**Last Updated:** December 27, 2024
**Next Review:** Weekly during Phase 4 (Weeks 13-14)
