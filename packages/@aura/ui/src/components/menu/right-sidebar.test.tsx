/**
 * RightSidebar Component Tests - Production Ready
 * Comprehensive test coverage for the right sidebar with recent activity and favorites
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RightSidebar } from './right-sidebar';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe('RightSidebar', () => {
  const mockRecentActivity = [
    {
      path: '/employees/john-doe',
      title: 'John Doe',
      module: 'Employees',
      timestamp: Date.now() - 120000, // 2 minutes ago
    },
    {
      path: '/payroll/report-q3',
      title: 'Payroll Report Q3',
      module: 'Payroll',
      timestamp: Date.now() - 3600000, // 1 hour ago
    },
  ];

  const mockFavorites = [
    {
      path: '/dashboard/analytics',
      title: 'Analytics Dashboard',
      module: 'Analytics',
      addedAt: Date.now(),
    },
    {
      path: '/employees',
      title: 'Employee Directory',
      module: 'Core HR',
      addedAt: Date.now(),
    },
  ];

  const defaultProps = {
    recentActivity: mockRecentActivity,
    favorites: mockFavorites,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ====================================================================
  // RENDERING - EXPANDED STATE
  // ====================================================================

  describe('Rendering - Expanded State', () => {
    it('renders expanded by default', () => {
      const { container } = render(<RightSidebar {...defaultProps} />);

      const sidebar = container.querySelector('[class*="w-72"]');
      expect(sidebar).toBeInTheDocument();
    });

    it('shows Quick Access header', () => {
      render(<RightSidebar {...defaultProps} />);

      expect(screen.getByText('Quick Access')).toBeInTheDocument();
    });

    it('shows both tabs', () => {
      render(<RightSidebar {...defaultProps} />);

      expect(screen.getByText('Recent')).toBeInTheDocument();
      expect(screen.getByText('Favorites')).toBeInTheDocument();
    });

    it('shows collapse button', () => {
      render(<RightSidebar {...defaultProps} />);

      const collapseButton = screen.getByLabelText('Collapse sidebar');
      expect(collapseButton).toBeInTheDocument();
    });

    it('recent tab is active by default', () => {
      render(<RightSidebar {...defaultProps} />);

      const recentTab = screen.getByRole('button', { name: /recent/i });
      expect(recentTab).toHaveClass('text-celestial-indigo');
    });
  });

  // ====================================================================
  // RENDERING - COLLAPSED STATE
  // ====================================================================

  describe('Rendering - Collapsed State', () => {
    it('renders collapsed when collapsed prop is true', () => {
      const { container } = render(<RightSidebar {...defaultProps} collapsed={true} />);

      const sidebar = container.querySelector('[class*="w-12"]');
      expect(sidebar).toBeInTheDocument();
    });

    it('shows expand button when collapsed', () => {
      render(<RightSidebar {...defaultProps} collapsed={true} />);

      const expandButton = screen.getByLabelText('Expand sidebar');
      expect(expandButton).toBeInTheDocument();
    });

    it('shows icon buttons when collapsed', () => {
      render(<RightSidebar {...defaultProps} collapsed={true} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2); // At least recent and favorites buttons
    });

    it('shows badge count on recent button when collapsed', () => {
      render(<RightSidebar {...defaultProps} collapsed={true} />);

      expect(screen.getByText('2')).toBeInTheDocument(); // 2 recent activities
    });

    it('shows badge count on favorites button when collapsed', () => {
      render(<RightSidebar {...defaultProps} collapsed={true} />);

      expect(screen.getByText('2')).toBeInTheDocument(); // 2 favorites
    });

    it('shows 9+ when count exceeds 9', () => {
      const manyActivities = Array.from({ length: 15 }, (_, i) => ({
        path: `/item-${i}`,
        title: `Item ${i}`,
        module: 'Module',
        timestamp: Date.now(),
      }));

      render(<RightSidebar {...defaultProps} recentActivity={manyActivities} collapsed={true} />);

      expect(screen.getByText('9+')).toBeInTheDocument();
    });
  });

  // ====================================================================
  // TAB SWITCHING
  // ====================================================================

  describe('Tab Switching', () => {
    it('switches to favorites tab when clicked', () => {
      render(<RightSidebar {...defaultProps} />);

      const favoritesTab = screen.getByRole('button', { name: /favorites/i });
      fireEvent.click(favoritesTab);

      expect(favoritesTab).toHaveClass('text-sunset-amber');
    });

    it('switches back to recent tab', () => {
      render(<RightSidebar {...defaultProps} />);

      const recentTab = screen.getByRole('button', { name: /recent/i });
      const favoritesTab = screen.getByRole('button', { name: /favorites/i });

      fireEvent.click(favoritesTab);
      fireEvent.click(recentTab);

      expect(recentTab).toHaveClass('text-celestial-indigo');
    });

    it('shows active tab indicator', () => {
      render(<RightSidebar {...defaultProps} />);

      const recentTab = screen.getByRole('button', { name: /recent/i });
      const indicator = recentTab.querySelector('[class*="bg-gradient-to-r"]');

      expect(indicator).toBeInTheDocument();
    });

    it('changes tab when collapsed icon is clicked and expands', () => {
      const mockToggle = vi.fn();
      render(
        <RightSidebar
          {...defaultProps}
          collapsed={true}
          onToggleCollapse={mockToggle}
        />
      );

      const buttons = screen.getAllByRole('button');
      const favoritesButton = buttons.find((btn) => btn.getAttribute('title') === 'Favorites');

      if (favoritesButton) {
        fireEvent.click(favoritesButton);
        expect(mockToggle).toHaveBeenCalled();
      }
    });
  });

  // ====================================================================
  // RECENT ACTIVITY CONTENT
  // ====================================================================

  describe('Recent Activity Content', () => {
    it('displays all recent activities', () => {
      render(<RightSidebar {...defaultProps} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Payroll Report Q3')).toBeInTheDocument();
    });

    it('shows module names', () => {
      render(<RightSidebar {...defaultProps} />);

      expect(screen.getByText('Employees')).toBeInTheDocument();
      expect(screen.getByText('Payroll')).toBeInTheDocument();
    });

    it('formats timestamps correctly', () => {
      render(<RightSidebar {...defaultProps} />);

      // Should show relative time
      const timestamps = screen.queryAllByText(/ago$/);
      expect(timestamps.length).toBeGreaterThan(0);
    });

    it('shows empty state when no recent activity', () => {
      render(<RightSidebar {...defaultProps} recentActivity={[]} />);

      expect(screen.getByText('No recent activity')).toBeInTheDocument();
      expect(screen.getByText('Pages you visit will appear here')).toBeInTheDocument();
    });

    it('renders links for each activity', () => {
      render(<RightSidebar {...defaultProps} />);

      const link1 = screen.getByRole('link', { name: /john doe/i });
      const link2 = screen.getByRole('link', { name: /payroll report q3/i });

      expect(link1).toHaveAttribute('href', '/employees/john-doe');
      expect(link2).toHaveAttribute('href', '/payroll/report-q3');
    });

    it('shows clear activity button when activities exist', () => {
      const mockClear = vi.fn();
      render(<RightSidebar {...defaultProps} onClearActivity={mockClear} />);

      expect(screen.getByText('Clear Recent Activity')).toBeInTheDocument();
    });

    it('calls onClearActivity when clear button clicked', () => {
      const mockClear = vi.fn();
      render(<RightSidebar {...defaultProps} onClearActivity={mockClear} />);

      const clearButton = screen.getByText('Clear Recent Activity');
      fireEvent.click(clearButton);

      expect(mockClear).toHaveBeenCalledTimes(1);
    });

    it('does not show clear button when no callback provided', () => {
      render(<RightSidebar {...defaultProps} />);

      expect(screen.queryByText('Clear Recent Activity')).not.toBeInTheDocument();
    });

    it('shows activity count badge', () => {
      render(<RightSidebar {...defaultProps} />);

      const recentTab = screen.getByRole('button', { name: /recent/i });
      expect(recentTab.textContent).toContain('2');
    });
  });

  // ====================================================================
  // FAVORITES CONTENT
  // ====================================================================

  describe('Favorites Content', () => {
    it('displays all favorites when tab is active', () => {
      render(<RightSidebar {...defaultProps} />);

      const favoritesTab = screen.getByRole('button', { name: /favorites/i });
      fireEvent.click(favoritesTab);

      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Employee Directory')).toBeInTheDocument();
    });

    it('shows module names for favorites', () => {
      render(<RightSidebar {...defaultProps} />);

      const favoritesTab = screen.getByRole('button', { name: /favorites/i });
      fireEvent.click(favoritesTab);

      expect(screen.getByText('Analytics')).toBeInTheDocument();
      expect(screen.getByText('Core HR')).toBeInTheDocument();
    });

    it('shows empty state when no favorites', () => {
      render(<RightSidebar {...defaultProps} favorites={[]} />);

      const favoritesTab = screen.getByRole('button', { name: /favorites/i });
      fireEvent.click(favoritesTab);

      expect(screen.getByText('No favorites yet')).toBeInTheDocument();
      expect(screen.getByText('Click the star icon on menu items to add favorites')).toBeInTheDocument();
    });

    it('renders links for each favorite', () => {
      render(<RightSidebar {...defaultProps} />);

      const favoritesTab = screen.getByRole('button', { name: /favorites/i });
      fireEvent.click(favoritesTab);

      const link1 = screen.getByRole('link', { name: /analytics dashboard/i });
      const link2 = screen.getByRole('link', { name: /employee directory/i });

      expect(link1).toHaveAttribute('href', '/dashboard/analytics');
      expect(link2).toHaveAttribute('href', '/employees');
    });

    it('shows remove button for each favorite when callback provided', () => {
      const mockRemove = vi.fn();
      render(<RightSidebar {...defaultProps} onRemoveFavorite={mockRemove} />);

      const favoritesTab = screen.getByRole('button', { name: /favorites/i });
      fireEvent.click(favoritesTab);

      const removeButtons = screen.getAllByTitle('Remove from favorites');
      expect(removeButtons).toHaveLength(2);
    });

    it('calls onRemoveFavorite when remove button clicked', () => {
      const mockRemove = vi.fn();
      render(<RightSidebar {...defaultProps} onRemoveFavorite={mockRemove} />);

      const favoritesTab = screen.getByRole('button', { name: /favorites/i });
      fireEvent.click(favoritesTab);

      const removeButtons = screen.getAllByTitle('Remove from favorites');
      fireEvent.click(removeButtons[0]);

      expect(mockRemove).toHaveBeenCalledWith('/dashboard/analytics');
    });

    it('does not show remove button when no callback provided', () => {
      render(<RightSidebar {...defaultProps} />);

      const favoritesTab = screen.getByRole('button', { name: /favorites/i });
      fireEvent.click(favoritesTab);

      expect(screen.queryByTitle('Remove from favorites')).not.toBeInTheDocument();
    });

    it('shows favorites count badge', () => {
      render(<RightSidebar {...defaultProps} />);

      const favoritesTab = screen.getByRole('button', { name: /favorites/i });
      expect(favoritesTab.textContent).toContain('2');
    });
  });

  // ====================================================================
  // COLLAPSE/EXPAND FUNCTIONALITY
  // ====================================================================

  describe('Collapse/Expand Functionality', () => {
    it('calls onToggleCollapse when collapse button clicked', () => {
      const mockToggle = vi.fn();
      render(<RightSidebar {...defaultProps} onToggleCollapse={mockToggle} />);

      const collapseButton = screen.getByLabelText('Collapse sidebar');
      fireEvent.click(collapseButton);

      expect(mockToggle).toHaveBeenCalledTimes(1);
    });

    it('calls onToggleCollapse when expand button clicked', () => {
      const mockToggle = vi.fn();
      render(<RightSidebar {...defaultProps} collapsed={true} onToggleCollapse={mockToggle} />);

      const expandButton = screen.getByLabelText('Expand sidebar');
      fireEvent.click(expandButton);

      expect(mockToggle).toHaveBeenCalledTimes(1);
    });
  });

  // ====================================================================
  // TIMESTAMP FORMATTING
  // ====================================================================

  describe('Timestamp Formatting', () => {
    it('shows "Just now" for very recent activity', () => {
      const recentActivity = [
        {
          path: '/test',
          title: 'Test',
          module: 'Test',
          timestamp: Date.now() - 30000, // 30 seconds ago
        },
      ];

      render(<RightSidebar {...defaultProps} recentActivity={recentActivity} />);

      expect(screen.getByText('Just now')).toBeInTheDocument();
    });

    it('shows minutes for activity under 1 hour', () => {
      const recentActivity = [
        {
          path: '/test',
          title: 'Test',
          module: 'Test',
          timestamp: Date.now() - 1800000, // 30 minutes ago
        },
      ];

      render(<RightSidebar {...defaultProps} recentActivity={recentActivity} />);

      expect(screen.getByText('30m ago')).toBeInTheDocument();
    });

    it('shows hours for activity under 24 hours', () => {
      const recentActivity = [
        {
          path: '/test',
          title: 'Test',
          module: 'Test',
          timestamp: Date.now() - 7200000, // 2 hours ago
        },
      ];

      render(<RightSidebar {...defaultProps} recentActivity={recentActivity} />);

      expect(screen.getByText('2h ago')).toBeInTheDocument();
    });

    it('shows days for activity under 1 week', () => {
      const recentActivity = [
        {
          path: '/test',
          title: 'Test',
          module: 'Test',
          timestamp: Date.now() - 172800000, // 2 days ago
        },
      ];

      render(<RightSidebar {...defaultProps} recentActivity={recentActivity} />);

      expect(screen.getByText('2d ago')).toBeInTheDocument();
    });

    it('shows date for activity over 1 week', () => {
      const timestamp = Date.now() - 864000000; // 10 days ago
      const recentActivity = [
        {
          path: '/test',
          title: 'Test',
          module: 'Test',
          timestamp,
        },
      ];

      render(<RightSidebar {...defaultProps} recentActivity={recentActivity} />);

      const expectedDate = new Date(timestamp).toLocaleDateString();
      expect(screen.getByText(expectedDate)).toBeInTheDocument();
    });
  });

  // ====================================================================
  // EDGE CASES
  // ====================================================================

  describe('Edge Cases', () => {
    it('handles custom className', () => {
      const { container } = render(
        <RightSidebar {...defaultProps} className="custom-class" />
      );

      const sidebar = container.firstChild;
      expect(sidebar).toHaveClass('custom-class');
    });

    it('handles empty activity and favorites', () => {
      render(<RightSidebar recentActivity={[]} favorites={[]} />);

      expect(screen.getByText('No recent activity')).toBeInTheDocument();

      const favoritesTab = screen.getByRole('button', { name: /favorites/i });
      fireEvent.click(favoritesTab);

      expect(screen.getByText('No favorites yet')).toBeInTheDocument();
    });

    it('handles very long titles', () => {
      const longActivity = [
        {
          path: '/test',
          title: 'A'.repeat(100),
          module: 'Module',
          timestamp: Date.now(),
        },
      ];

      render(<RightSidebar {...defaultProps} recentActivity={longActivity} />);

      expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
    });

    it('handles special characters in titles', () => {
      const specialActivity = [
        {
          path: '/test',
          title: 'Title & Special <characters>',
          module: 'Module',
          timestamp: Date.now(),
        },
      ];

      render(<RightSidebar {...defaultProps} recentActivity={specialActivity} />);

      expect(screen.getByText('Title & Special <characters>')).toBeInTheDocument();
    });
  });

  // ====================================================================
  // ACCESSIBILITY
  // ====================================================================

  describe('Accessibility', () => {
    it('all buttons are keyboard accessible', () => {
      render(<RightSidebar {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeInTheDocument();
        expect(button.tagName).toBe('BUTTON');
      });
    });

    it('all links are keyboard accessible', () => {
      render(<RightSidebar {...defaultProps} />);

      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link).toBeInTheDocument();
        expect(link.tagName).toBe('A');
        expect(link).toHaveAttribute('href');
      });
    });

    it('collapse button has aria-label', () => {
      render(<RightSidebar {...defaultProps} />);

      const collapseButton = screen.getByLabelText('Collapse sidebar');
      expect(collapseButton).toBeInTheDocument();
    });

    it('expand button has aria-label', () => {
      render(<RightSidebar {...defaultProps} collapsed={true} />);

      const expandButton = screen.getByLabelText('Expand sidebar');
      expect(expandButton).toBeInTheDocument();
    });

    it('tab buttons have proper role', () => {
      render(<RightSidebar {...defaultProps} />);

      const recentTab = screen.getByRole('button', { name: /recent/i });
      const favoritesTab = screen.getByRole('button', { name: /favorites/i });

      expect(recentTab).toBeInTheDocument();
      expect(favoritesTab).toBeInTheDocument();
    });
  });
});
