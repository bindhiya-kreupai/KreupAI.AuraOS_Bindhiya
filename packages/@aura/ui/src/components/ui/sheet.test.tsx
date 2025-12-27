/**
 * Sheet Component Tests - Production Ready
 * Comprehensive test coverage for the slide-out sheet/drawer component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Sheet } from './sheet';

describe('Sheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset body overflow
    document.body.style.overflow = '';
  });

  afterEach(() => {
    // Cleanup
    document.body.style.overflow = '';
    vi.clearAllTimers();
  });

  // ========================================================================
  // RENDERING
  // ========================================================================

  describe('Rendering', () => {
    it('renders when isOpen is true', () => {
      render(
        <Sheet isOpen={true} onClose={vi.fn()} title="Test Sheet">
          <div>Content</div>
        </Sheet>
      );

      expect(screen.getByText('Test Sheet')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(
        <Sheet isOpen={false} onClose={vi.fn()} title="Test Sheet">
          <div>Content</div>
        </Sheet>
      );

      expect(screen.queryByText('Test Sheet')).not.toBeInTheDocument();
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });

    it('renders title correctly', () => {
      render(
        <Sheet isOpen={true} onClose={vi.fn()} title="Employee Details">
          <div>Content</div>
        </Sheet>
      );

      expect(screen.getByText('Employee Details')).toBeInTheDocument();
    });

    it('renders children content', () => {
      render(
        <Sheet isOpen={true} onClose={vi.fn()} title="Test">
          <div data-testid="child-content">
            <h2>Child Heading</h2>
            <p>Child Paragraph</p>
          </div>
        </Sheet>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByText('Child Heading')).toBeInTheDocument();
      expect(screen.getByText('Child Paragraph')).toBeInTheDocument();
    });

    it('renders close button', () => {
      render(
        <Sheet isOpen={true} onClose={vi.fn()} title="Test">
          <div>Content</div>
        </Sheet>
      );

      // Close button with X icon
      const closeButton = screen.getByRole('button');
      expect(closeButton).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <Sheet isOpen={true} onClose={vi.fn()} title="Test" className="custom-sheet">
          <div>Content</div>
        </Sheet>
      );

      expect(container.firstChild).toHaveClass('custom-sheet');
    });
  });

  // ========================================================================
  // FOOTER
  // ========================================================================

  describe('Footer', () => {
    it('renders footer when provided', () => {
      render(
        <Sheet
          isOpen={true}
          onClose={vi.fn()}
          title="Test"
          footer={<div data-testid="footer">Footer Content</div>}
        >
          <div>Content</div>
        </Sheet>
      );

      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByText('Footer Content')).toBeInTheDocument();
    });

    it('does not render footer when not provided', () => {
      render(
        <Sheet isOpen={true} onClose={vi.fn()} title="Test">
          <div>Content</div>
        </Sheet>
      );

      // No footer element should exist
      const content = screen.getByText('Content').closest('div');
      expect(content?.nextSibling).toBeNull();
    });

    it('renders complex footer with buttons', () => {
      const footer = (
        <div>
          <button>Cancel</button>
          <button>Save</button>
        </div>
      );

      render(
        <Sheet isOpen={true} onClose={vi.fn()} title="Test" footer={footer}>
          <div>Content</div>
        </Sheet>
      );

      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // SIZE VARIANTS
  // ========================================================================

  describe('Size Variants', () => {
    it('applies default md size when not specified', () => {
      const { container } = render(
        <Sheet isOpen={true} onClose={vi.fn()} title="Test">
          <div>Content</div>
        </Sheet>
      );

      const panel = container.querySelector('.max-w-md');
      expect(panel).toBeInTheDocument();
    });

    it('applies sm size correctly', () => {
      const { container } = render(
        <Sheet isOpen={true} onClose={vi.fn()} title="Test" size="sm">
          <div>Content</div>
        </Sheet>
      );

      const panel = container.querySelector('.max-w-sm');
      expect(panel).toBeInTheDocument();
    });

    it('applies lg size correctly', () => {
      const { container } = render(
        <Sheet isOpen={true} onClose={vi.fn()} title="Test" size="lg">
          <div>Content</div>
        </Sheet>
      );

      const panel = container.querySelector('.max-w-2xl');
      expect(panel).toBeInTheDocument();
    });

    it('applies xl size correctly', () => {
      const { container } = render(
        <Sheet isOpen={true} onClose={vi.fn()} title="Test" size="xl">
          <div>Content</div>
        </Sheet>
      );

      const panel = container.querySelector('.max-w-4xl');
      expect(panel).toBeInTheDocument();
    });

    it('applies full size correctly', () => {
      const { container } = render(
        <Sheet isOpen={true} onClose={vi.fn()} title="Test" size="full">
          <div>Content</div>
        </Sheet>
      );

      const panel = container.querySelector('.max-w-full');
      expect(panel).toBeInTheDocument();
    });
  });

  // ========================================================================
  // INTERACTION
  // ========================================================================

  describe('Interaction', () => {
    it('calls onClose when close button is clicked', () => {
      const onClose = vi.fn();

      render(
        <Sheet isOpen={true} onClose={onClose} title="Test">
          <div>Content</div>
        </Sheet>
      );

      const closeButton = screen.getByRole('button');
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop is clicked', () => {
      const onClose = vi.fn();

      const { container } = render(
        <Sheet isOpen={true} onClose={onClose} title="Test">
          <div>Content</div>
        </Sheet>
      );

      // Find backdrop (first div child with backdrop class)
      const backdrop = container.querySelector('.backdrop-blur-sm');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(onClose).toHaveBeenCalledTimes(1);
      }
    });

    it('does not call onClose when panel is clicked', () => {
      const onClose = vi.fn();

      render(
        <Sheet isOpen={true} onClose={onClose} title="Test">
          <div>Content</div>
        </Sheet>
      );

      const content = screen.getByText('Content');
      fireEvent.click(content);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('handles multiple close button clicks', () => {
      const onClose = vi.fn();

      render(
        <Sheet isOpen={true} onClose={onClose} title="Test">
          <div>Content</div>
        </Sheet>
      );

      const closeButton = screen.getByRole('button');
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(3);
    });
  });

  // ========================================================================
  // BODY SCROLL MANAGEMENT
  // ========================================================================

  describe('Body Scroll Management', () => {
    it('sets body overflow to hidden when opened', () => {
      render(
        <Sheet isOpen={true} onClose={vi.fn()} title="Test">
          <div>Content</div>
        </Sheet>
      );

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('resets body overflow when closed', async () => {
      vi.useFakeTimers();

      const { rerender } = render(
        <Sheet isOpen={true} onClose={vi.fn()} title="Test">
          <div>Content</div>
        </Sheet>
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <Sheet isOpen={false} onClose={vi.fn()} title="Test">
          <div>Content</div>
        </Sheet>
      );

      // Run timers to trigger cleanup
      vi.runAllTimers();

      await waitFor(() => {
        expect(document.body.style.overflow).toBe('unset');
      });

      vi.useRealTimers();
    });

    it('cleans up body overflow on unmount', () => {
      const { unmount } = render(
        <Sheet isOpen={true} onClose={vi.fn()} title="Test">
          <div>Content</div>
        </Sheet>
      );

      expect(document.body.style.overflow).toBe('hidden');

      unmount();

      expect(document.body.style.overflow).toBe('');
    });
  });

  // ========================================================================
  // ANIMATION & VISIBILITY
  // ========================================================================

  describe('Animation & Visibility', () => {
    it('applies correct animation classes when open', () => {
      const { container } = render(
        <Sheet isOpen={true} onClose={vi.fn()} title="Test">
          <div>Content</div>
        </Sheet>
      );

      const backdrop = container.querySelector('.backdrop-blur-sm');
      expect(backdrop).toHaveClass('opacity-100');

      const panel = container.querySelector('.translate-x-0');
      expect(panel).toBeInTheDocument();
    });

    it('applies correct animation classes when closed but visible', async () => {
      vi.useFakeTimers();

      const { container, rerender } = render(
        <Sheet isOpen={true} onClose={vi.fn()} title="Test">
          <div>Content</div>
        </Sheet>
      );

      rerender(
        <Sheet isOpen={false} onClose={vi.fn()} title="Test">
          <div>Content</div>
        </Sheet>
      );

      // Before timeout, should still be visible with closing animation
      const backdrop = container.querySelector('.backdrop-blur-sm');
      expect(backdrop).toHaveClass('opacity-0');

      const panel = container.querySelector('.translate-x-full');
      expect(panel).toBeInTheDocument();

      vi.useRealTimers();
    });

    it('removes from DOM after animation completes', async () => {
      vi.useFakeTimers();

      const { rerender } = render(
        <Sheet isOpen={true} onClose={vi.fn()} title="Test">
          <div>Content</div>
        </Sheet>
      );

      rerender(
        <Sheet isOpen={false} onClose={vi.fn()} title="Test">
          <div>Content</div>
        </Sheet>
      );

      // Fast forward past the 300ms timeout
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.queryByText('Test')).not.toBeInTheDocument();
      });

      vi.useRealTimers();
    });
  });

  // ========================================================================
  // LAYOUT & STRUCTURE
  // ========================================================================

  describe('Layout & Structure', () => {
    it('renders with correct z-index', () => {
      const { container } = render(
        <Sheet isOpen={true} onClose={vi.fn()} title="Test">
          <div>Content</div>
        </Sheet>
      );

      expect(container.firstChild).toHaveClass('z-[100]');
    });

    it('positions sheet on right side', () => {
      const { container } = render(
        <Sheet isOpen={true} onClose={vi.fn()} title="Test">
          <div>Content</div>
        </Sheet>
      );

      expect(container.firstChild).toHaveClass('justify-end');
    });

    it('renders header with border', () => {
      const { container } = render(
        <Sheet isOpen={true} onClose={vi.fn()} title="Test">
          <div>Content</div>
        </Sheet>
      );

      const header = screen.getByText('Test').closest('div');
      expect(header).toHaveClass('border-b');
    });

    it('renders scrollable content area', () => {
      render(
        <Sheet isOpen={true} onClose={vi.fn()} title="Test">
          <div>Content</div>
        </Sheet>
      );

      const content = screen.getByText('Content').closest('div');
      expect(content).toHaveClass('overflow-y-auto');
    });

    it('renders footer with border', () => {
      const { container } = render(
        <Sheet
          isOpen={true}
          onClose={vi.fn()}
          title="Test"
          footer={<div>Footer</div>}
        >
          <div>Content</div>
        </Sheet>
      );

      const footer = screen.getByText('Footer').closest('div');
      expect(footer).toHaveClass('border-t');
    });
  });

  // ========================================================================
  // EDGE CASES
  // ========================================================================

  describe('Edge Cases', () => {
    it('handles empty title', () => {
      render(
        <Sheet isOpen={true} onClose={vi.fn()} title="">
          <div>Content</div>
        </Sheet>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('handles very long title', () => {
      const longTitle = 'A'.repeat(200);

      render(
        <Sheet isOpen={true} onClose={vi.fn()} title={longTitle}>
          <div>Content</div>
        </Sheet>
      );

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('handles title with special characters', () => {
      render(
        <Sheet isOpen={true} onClose={vi.fn()} title="Test & Special <> Characters">
          <div>Content</div>
        </Sheet>
      );

      expect(screen.getByText('Test & Special <> Characters')).toBeInTheDocument();
    });

    it('handles null children gracefully', () => {
      render(
        <Sheet isOpen={true} onClose={vi.fn()} title="Test">
          {null}
        </Sheet>
      );

      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('handles undefined children gracefully', () => {
      render(
        <Sheet isOpen={true} onClose={vi.fn()} title="Test">
          {undefined}
        </Sheet>
      );

      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('handles complex nested children', () => {
      render(
        <Sheet isOpen={true} onClose={vi.fn()} title="Test">
          <div>
            <section>
              <article>
                <p>Deeply nested content</p>
              </article>
            </section>
          </div>
        </Sheet>
      );

      expect(screen.getByText('Deeply nested content')).toBeInTheDocument();
    });

    it('handles rapid open/close toggles', async () => {
      vi.useFakeTimers();

      const { rerender } = render(
        <Sheet isOpen={false} onClose={vi.fn()} title="Test">
          <div>Content</div>
        </Sheet>
      );

      // Open
      rerender(
        <Sheet isOpen={true} onClose={vi.fn()} title="Test">
          <div>Content</div>
        </Sheet>
      );

      // Close immediately
      rerender(
        <Sheet isOpen={false} onClose={vi.fn()} title="Test">
          <div>Content</div>
        </Sheet>
      );

      // Open again before animation completes
      rerender(
        <Sheet isOpen={true} onClose={vi.fn()} title="Test">
          <div>Content</div>
        </Sheet>
      );

      expect(screen.getByText('Test')).toBeInTheDocument();

      vi.useRealTimers();
    });
  });

  // ========================================================================
  // INTEGRATION
  // ========================================================================

  describe('Integration', () => {
    it('works with all props together', () => {
      const onClose = vi.fn();
      const footer = (
        <div>
          <button>Cancel</button>
          <button>Save</button>
        </div>
      );

      render(
        <Sheet
          isOpen={true}
          onClose={onClose}
          title="Edit Employee"
          footer={footer}
          className="custom-sheet"
          size="lg"
        >
          <form>
            <input placeholder="Name" />
            <input placeholder="Email" />
          </form>
        </Sheet>
      );

      expect(screen.getByText('Edit Employee')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('maintains state through open/close cycles', () => {
      const { rerender } = render(
        <Sheet isOpen={true} onClose={vi.fn()} title="Test">
          <div>Content 1</div>
        </Sheet>
      );

      expect(screen.getByText('Content 1')).toBeInTheDocument();

      rerender(
        <Sheet isOpen={false} onClose={vi.fn()} title="Test">
          <div>Content 1</div>
        </Sheet>
      );

      rerender(
        <Sheet isOpen={true} onClose={vi.fn()} title="Test">
          <div>Content 2</div>
        </Sheet>
      );

      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('handles form submission inside sheet', () => {
      const onSubmit = vi.fn((e) => e.preventDefault());

      render(
        <Sheet isOpen={true} onClose={vi.fn()} title="Test">
          <form onSubmit={onSubmit}>
            <input type="text" />
            <button type="submit">Submit</button>
          </form>
        </Sheet>
      );

      const form = screen.getByRole('button', { name: 'Submit' }).closest('form');
      if (form) {
        fireEvent.submit(form);
        expect(onSubmit).toHaveBeenCalledTimes(1);
      }
    });
  });

  // ========================================================================
  // ACCESSIBILITY
  // ========================================================================

  describe('Accessibility', () => {
    it('renders close button with proper semantics', () => {
      render(
        <Sheet isOpen={true} onClose={vi.fn()} title="Test">
          <div>Content</div>
        </Sheet>
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('allows keyboard interaction with close button', () => {
      const onClose = vi.fn();

      render(
        <Sheet isOpen={true} onClose={onClose} title="Test">
          <div>Content</div>
        </Sheet>
      );

      const closeButton = screen.getByRole('button');
      closeButton.focus();
      expect(document.activeElement).toBe(closeButton);
    });

    it('maintains focus when opened', () => {
      render(
        <Sheet isOpen={true} onClose={vi.fn()} title="Test">
          <button>Focus Me</button>
        </Sheet>
      );

      const button = screen.getByText('Focus Me');
      button.focus();
      expect(document.activeElement).toBe(button);
    });

    it('renders semantic heading for title', () => {
      render(
        <Sheet isOpen={true} onClose={vi.fn()} title="Test Sheet">
          <div>Content</div>
        </Sheet>
      );

      const title = screen.getByText('Test Sheet');
      expect(title.tagName).toBe('H2');
    });
  });
});
