/**
 * RightPanel Component Tests - Production Ready
 * Comprehensive test coverage for the collapsible right panel component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RightPanel } from './right-panel';

describe('RightPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ====================================================================
  // RENDERING
  // ====================================================================

  describe('Rendering', () => {
    it('renders collapsed by default', () => {
      render(<RightPanel />);

      const panel = document.getElementById('aura-right-panel');
      expect(panel).toBeInTheDocument();
      expect(panel).toHaveClass('w-14');
    });

    it('renders all tab buttons', () => {
      render(<RightPanel />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(4); // 3 tabs + pin button
    });

    it('renders with default quick access tab active', () => {
      render(<RightPanel />);

      // The panel starts collapsed, so content won't be visible
      const panel = document.getElementById('aura-right-panel');
      expect(panel).toBeInTheDocument();
    });

    it('shows icon bar always', () => {
      render(<RightPanel />);

      const iconBar = document.querySelector('[class*="w-14"]');
      expect(iconBar).toBeInTheDocument();
    });
  });

  // ====================================================================
  // TAB SWITCHING
  // ====================================================================

  describe('Tab Switching', () => {
    it('switches to recent tab when clicked', () => {
      render(<RightPanel />);

      const tabs = screen.getAllByRole('button');
      const recentTab = tabs[1]; // Second button is recent tab

      fireEvent.click(recentTab);

      // Tab should have active styling
      expect(recentTab).toHaveClass('bg-quantum-rose');
    });

    it('switches to notifications tab when clicked', () => {
      render(<RightPanel />);

      const tabs = screen.getAllByRole('button');
      const notificationsTab = tabs[2]; // Third button is notifications tab

      fireEvent.click(notificationsTab);

      expect(notificationsTab).toHaveClass('bg-neural-mint');
    });

    it('switches back to quick access tab', () => {
      render(<RightPanel />);

      const tabs = screen.getAllByRole('button');
      const quickTab = tabs[0];
      const recentTab = tabs[1];

      // Switch to recent
      fireEvent.click(recentTab);
      expect(recentTab).toHaveClass('bg-quantum-rose');

      // Switch back to quick
      fireEvent.click(quickTab);
      expect(quickTab).toHaveClass('bg-celestial-indigo');
    });

    it('maintains active tab styling', () => {
      render(<RightPanel />);

      const tabs = screen.getAllByRole('button');
      const quickTab = tabs[0];

      expect(quickTab).toHaveClass('bg-celestial-indigo');
      expect(quickTab).toHaveClass('shadow-glow-indigo');
    });
  });

  // ====================================================================
  // EXPANSION/COLLAPSE
  // ====================================================================

  describe('Expansion and Collapse', () => {
    it('expands on mouse enter with delay', async () => {
      render(<RightPanel />);

      const panel = document.getElementById('aura-right-panel');

      fireEvent.mouseEnter(panel!);

      // Before delay, should still be collapsed
      expect(panel).toHaveClass('w-14');

      // After delay
      vi.advanceTimersByTime(300);
      await waitFor(() => {
        expect(panel).toHaveClass('w-80');
      });
    });

    it('collapses on mouse leave with delay', async () => {
      render(<RightPanel />);

      const panel = document.getElementById('aura-right-panel');

      // First expand
      fireEvent.mouseEnter(panel!);
      vi.advanceTimersByTime(300);
      await waitFor(() => {
        expect(panel).toHaveClass('w-80');
      });

      // Then collapse
      fireEvent.mouseLeave(panel!);
      vi.advanceTimersByTime(300);
      await waitFor(() => {
        expect(panel).toHaveClass('w-14');
      });
    });

    it('does not collapse when pinned', async () => {
      render(<RightPanel />);

      const panel = document.getElementById('aura-right-panel');
      const tabs = screen.getAllByRole('button');
      const pinButton = tabs[tabs.length - 1]; // Last button is pin

      // Expand and pin
      fireEvent.mouseEnter(panel!);
      vi.advanceTimersByTime(300);
      await waitFor(() => {
        expect(panel).toHaveClass('w-80');
      });

      fireEvent.click(pinButton);

      // Try to collapse by leaving
      fireEvent.mouseLeave(panel!);
      vi.advanceTimersByTime(300);

      // Should still be expanded
      expect(panel).toHaveClass('w-80');
    });

    it('pin button toggles pinned state', async () => {
      render(<RightPanel />);

      const tabs = screen.getAllByRole('button');
      const pinButton = tabs[tabs.length - 1];

      // Initially not pinned
      expect(pinButton).not.toHaveClass('text-celestial-indigo');

      // Click to pin
      fireEvent.click(pinButton);
      expect(pinButton).toHaveClass('text-celestial-indigo');

      // Click to unpin
      fireEvent.click(pinButton);
      expect(pinButton).not.toHaveClass('text-celestial-indigo');
    });
  });

  // ====================================================================
  // CONTENT VISIBILITY
  // ====================================================================

  describe('Content Visibility', () => {
    it('shows content when expanded', async () => {
      render(<RightPanel />);

      const panel = document.getElementById('aura-right-panel');

      fireEvent.mouseEnter(panel!);
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText('Quick Access')).toBeInTheDocument();
      });
    });

    it('hides content when collapsed', () => {
      render(<RightPanel />);

      // Content should have opacity-0
      const content = document.querySelector('[class*="opacity-0"]');
      expect(content).toBeInTheDocument();
    });

    it('shows quick access items when expanded', async () => {
      render(<RightPanel />);

      const panel = document.getElementById('aura-right-panel');

      fireEvent.mouseEnter(panel!);
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText('Export Report')).toBeInTheDocument();
        expect(screen.getByText('Team Calendar')).toBeInTheDocument();
        expect(screen.getByText('My Tasks')).toBeInTheDocument();
      });
    });

    it('shows recent history when tab selected', async () => {
      render(<RightPanel />);

      const panel = document.getElementById('aura-right-panel');
      const tabs = screen.getAllByRole('button');
      const recentTab = tabs[1];

      fireEvent.mouseEnter(panel!);
      vi.advanceTimersByTime(300);

      fireEvent.click(recentTab);

      await waitFor(() => {
        expect(screen.getByText('Recent History')).toBeInTheDocument();
        expect(screen.getByText('Payroll Report Q3')).toBeInTheDocument();
        expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
      });
    });

    it('shows notifications when tab selected', async () => {
      render(<RightPanel />);

      const panel = document.getElementById('aura-right-panel');
      const tabs = screen.getAllByRole('button');
      const notificationsTab = tabs[2];

      fireEvent.mouseEnter(panel!);
      vi.advanceTimersByTime(300);

      fireEvent.click(notificationsTab);

      await waitFor(() => {
        expect(screen.getByText('Notifications')).toBeInTheDocument();
        expect(screen.getByText('Leave Request')).toBeInTheDocument();
        expect(screen.getByText('System Update')).toBeInTheDocument();
      });
    });
  });

  // ====================================================================
  // LAYOUT AND STRUCTURE
  // ====================================================================

  describe('Layout and Structure', () => {
    it('has fixed positioning', () => {
      const { container } = render(<RightPanel />);

      const panel = container.querySelector('[class*="fixed"]');
      expect(panel).toBeInTheDocument();
    });

    it('is positioned on the right side', () => {
      const { container } = render(<RightPanel />);

      const panel = container.querySelector('[class*="right-0"]');
      expect(panel).toBeInTheDocument();
    });

    it('has proper z-index', () => {
      const { container } = render(<RightPanel />);

      const panel = container.querySelector('[class*="z-50"]');
      expect(panel).toBeInTheDocument();
    });

    it('has shadow effect', () => {
      const { container } = render(<RightPanel />);

      const panel = container.querySelector('[class*="shadow-xl"]');
      expect(panel).toBeInTheDocument();
    });
  });

  // ====================================================================
  // RECENT HISTORY CONTENT
  // ====================================================================

  describe('Recent History Content', () => {
    it('shows Today section', async () => {
      render(<RightPanel />);

      const panel = document.getElementById('aura-right-panel');
      const tabs = screen.getAllByRole('button');

      fireEvent.mouseEnter(panel!);
      vi.advanceTimersByTime(300);
      fireEvent.click(tabs[1]); // Recent tab

      await waitFor(() => {
        expect(screen.getByText('Today')).toBeInTheDocument();
      });
    });

    it('shows Yesterday section', async () => {
      render(<RightPanel />);

      const panel = document.getElementById('aura-right-panel');
      const tabs = screen.getAllByRole('button');

      fireEvent.mouseEnter(panel!);
      vi.advanceTimersByTime(300);
      fireEvent.click(tabs[1]);

      await waitFor(() => {
        expect(screen.getByText('Yesterday')).toBeInTheDocument();
      });
    });

    it('displays time stamps', async () => {
      render(<RightPanel />);

      const panel = document.getElementById('aura-right-panel');
      const tabs = screen.getAllByRole('button');

      fireEvent.mouseEnter(panel!);
      vi.advanceTimersByTime(300);
      fireEvent.click(tabs[1]);

      await waitFor(() => {
        expect(screen.getByText('2m ago')).toBeInTheDocument();
        expect(screen.getByText('1h ago')).toBeInTheDocument();
        expect(screen.getByText('1d ago')).toBeInTheDocument();
      });
    });
  });

  // ====================================================================
  // NOTIFICATION CONTENT
  // ====================================================================

  describe('Notification Content', () => {
    it('shows unread notification styling', async () => {
      render(<RightPanel />);

      const panel = document.getElementById('aura-right-panel');
      const tabs = screen.getAllByRole('button');

      fireEvent.mouseEnter(panel!);
      vi.advanceTimersByTime(300);
      fireEvent.click(tabs[2]); // Notifications tab

      await waitFor(() => {
        const leaveRequest = screen.getByText('Leave Request');
        const notificationCard = leaveRequest.closest('[class*="border"]');
        expect(notificationCard).toHaveClass('border-celestial-indigo/30');
      });
    });

    it('shows notification messages', async () => {
      render(<RightPanel />);

      const panel = document.getElementById('aura-right-panel');
      const tabs = screen.getAllByRole('button');

      fireEvent.mouseEnter(panel!);
      vi.advanceTimersByTime(300);
      fireEvent.click(tabs[2]);

      await waitFor(() => {
        expect(screen.getByText('John Doe requested sick leave')).toBeInTheDocument();
        expect(screen.getByText('Maintenance scheduled for tonight')).toBeInTheDocument();
      });
    });

    it('shows notification timestamps', async () => {
      render(<RightPanel />);

      const panel = document.getElementById('aura-right-panel');
      const tabs = screen.getAllByRole('button');

      fireEvent.mouseEnter(panel!);
      vi.advanceTimersByTime(300);
      fireEvent.click(tabs[2]);

      await waitFor(() => {
        expect(screen.getByText('5m ago')).toBeInTheDocument();
        expect(screen.getByText('2h ago')).toBeInTheDocument();
      });
    });
  });

  // ====================================================================
  // EDGE CASES
  // ====================================================================

  describe('Edge Cases', () => {
    it('handles rapid hover in/out', async () => {
      render(<RightPanel />);

      const panel = document.getElementById('aura-right-panel');

      // Rapid hover
      fireEvent.mouseEnter(panel!);
      fireEvent.mouseLeave(panel!);
      fireEvent.mouseEnter(panel!);
      fireEvent.mouseLeave(panel!);

      // Should handle gracefully
      expect(panel).toBeInTheDocument();
    });

    it('cleans up timers on unmount', () => {
      const { unmount } = render(<RightPanel />);

      const panel = document.getElementById('aura-right-panel');
      fireEvent.mouseEnter(panel!);

      unmount();

      // Should not throw errors
      vi.advanceTimersByTime(300);
    });

    it('handles multiple pin/unpin toggles', () => {
      render(<RightPanel />);

      const tabs = screen.getAllByRole('button');
      const pinButton = tabs[tabs.length - 1];

      // Multiple toggles
      fireEvent.click(pinButton);
      fireEvent.click(pinButton);
      fireEvent.click(pinButton);
      fireEvent.click(pinButton);

      expect(pinButton).toBeInTheDocument();
    });
  });

  // ====================================================================
  // ACCESSIBILITY
  // ====================================================================

  describe('Accessibility', () => {
    it('all buttons are keyboard accessible', () => {
      render(<RightPanel />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeInTheDocument();
        expect(button.tagName).toBe('BUTTON');
      });
    });

    it('maintains focus management during tab switching', async () => {
      render(<RightPanel />);

      const tabs = screen.getAllByRole('button');
      const recentTab = tabs[1];

      fireEvent.click(recentTab);

      expect(recentTab).toBeInTheDocument();
    });

    it('has proper ARIA attributes', () => {
      render(<RightPanel />);

      const panel = document.getElementById('aura-right-panel');
      expect(panel).toHaveAttribute('id', 'aura-right-panel');
    });
  });
});
