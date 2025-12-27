/**
 * AppLayout Component Tests
 * Tests layout structure, sidebar toggles, navigation tracking, and responsive behavior
 *
 * @reference docs/testing/COMPONENT-TESTING-GUIDE.md
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppLayout } from './app-layout';
import { axe } from '@/__tests__/setupAxe';

// Mock Next.js navigation
const mockPush = vi.fn();
const mockPathname = '/dashboard';

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock child components to avoid complex dependencies
vi.mock('@aura/ui/components/menu', () => ({
  TopNav: ({ onMenuClick }: { onMenuClick: () => void }) => (
    <div data-testid="top-nav">
      <button onClick={onMenuClick} aria-label="Open mobile menu">
        Menu
      </button>
    </div>
  ),
  SidebarMenu: ({
    collapsed,
    onToggleCollapse,
    favorites,
    onToggleFavorite,
    onNavigate,
  }: any) => (
    <div data-testid="sidebar-menu" data-collapsed={collapsed}>
      <button onClick={onToggleCollapse} aria-label="Toggle sidebar">
        Toggle
      </button>
      <div data-testid="favorites-count">{favorites?.length || 0}</div>
      {onToggleFavorite && (
        <button
          onClick={() =>
            onToggleFavorite({ path: '/test', title: 'Test', module: 'Test' })
          }
          aria-label="Toggle favorite"
        >
          Favorite
        </button>
      )}
      {onNavigate && (
        <button
          onClick={() => onNavigate({ path: '/test', title: 'Test', module: 'Test' })}
          aria-label="Navigate"
        >
          Navigate
        </button>
      )}
    </div>
  ),
  MobileMenu: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="mobile-menu">
        <button onClick={onClose} aria-label="Close mobile menu">
          Close
        </button>
      </div>
    ) : null,
  RightSidebar: ({
    recentActivity,
    favorites,
    onClearActivity,
    onRemoveFavorite,
    collapsed,
    onToggleCollapse,
  }: any) => (
    <div data-testid="right-sidebar" data-collapsed={collapsed}>
      <button onClick={onToggleCollapse} aria-label="Toggle right sidebar">
        Toggle
      </button>
      <div data-testid="recent-activity-count">{recentActivity?.length || 0}</div>
      <div data-testid="favorites-count">{favorites?.length || 0}</div>
      {onClearActivity && (
        <button onClick={onClearActivity} aria-label="Clear activity">
          Clear
        </button>
      )}
      {onRemoveFavorite && (
        <button
          onClick={() => onRemoveFavorite('/test')}
          aria-label="Remove favorite"
        >
          Remove
        </button>
      )}
    </div>
  ),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AppLayout', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with children content', () => {
      render(
        <AppLayout>
          <div>Test Content</div>
        </AppLayout>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders TopNav component', () => {
      render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      expect(screen.getByTestId('top-nav')).toBeInTheDocument();
    });

    it('renders SidebarMenu component', () => {
      render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      expect(screen.getByTestId('sidebar-menu')).toBeInTheDocument();
    });

    it('renders RightSidebar component', () => {
      render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      expect(screen.getByTestId('right-sidebar')).toBeInTheDocument();
    });

    it('renders main content area', () => {
      render(
        <AppLayout>
          <div>Main Content</div>
        </AppLayout>
      );

      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      expect(within(main).getByText('Main Content')).toBeInTheDocument();
    });

    it('does not render mobile menu by default', () => {
      render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();
    });

    it('applies correct layout structure classes', () => {
      const { container } = render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      const layoutRoot = container.querySelector('.min-h-screen');
      expect(layoutRoot).toHaveClass('bg-white-glow', 'dark:bg-deep-cosmos');
    });

    it('wraps content in max-width container', () => {
      render(
        <AppLayout>
          <div data-testid="inner-content">Content</div>
        </AppLayout>
      );

      const content = screen.getByTestId('inner-content');
      const container = content.closest('.max-w-7xl');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('mx-auto');
    });
  });

  describe('Sidebar Collapse State', () => {
    it('renders sidebar in expanded state by default', () => {
      render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      const sidebar = screen.getByTestId('sidebar-menu');
      expect(sidebar).toHaveAttribute('data-collapsed', 'false');
    });

    it('toggles sidebar collapse state when toggle button clicked', async () => {
      const user = userEvent.setup();

      render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      const sidebar = screen.getByTestId('sidebar-menu');
      const toggleButton = screen.getByLabelText('Toggle sidebar');

      expect(sidebar).toHaveAttribute('data-collapsed', 'false');

      await user.click(toggleButton);

      expect(sidebar).toHaveAttribute('data-collapsed', 'true');

      await user.click(toggleButton);

      expect(sidebar).toHaveAttribute('data-collapsed', 'false');
    });

    it('maintains sidebar state across multiple toggles', async () => {
      const user = userEvent.setup();

      render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      const toggleButton = screen.getByLabelText('Toggle sidebar');
      const sidebar = screen.getByTestId('sidebar-menu');

      await user.click(toggleButton);
      expect(sidebar).toHaveAttribute('data-collapsed', 'true');

      await user.click(toggleButton);
      expect(sidebar).toHaveAttribute('data-collapsed', 'false');

      await user.click(toggleButton);
      expect(sidebar).toHaveAttribute('data-collapsed', 'true');
    });
  });

  describe('Right Sidebar State', () => {
    it('renders right sidebar in collapsed state by default', () => {
      render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      const rightSidebar = screen.getByTestId('right-sidebar');
      expect(rightSidebar).toHaveAttribute('data-collapsed', 'true');
    });

    it('toggles right sidebar collapse state', async () => {
      const user = userEvent.setup();

      render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      const rightSidebar = screen.getByTestId('right-sidebar');
      const toggleButton = screen.getByLabelText('Toggle right sidebar');

      expect(rightSidebar).toHaveAttribute('data-collapsed', 'true');

      await user.click(toggleButton);

      expect(rightSidebar).toHaveAttribute('data-collapsed', 'false');
    });

    it('maintains independent state from left sidebar', async () => {
      const user = userEvent.setup();

      render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      const leftToggle = screen.getByLabelText('Toggle sidebar');
      const rightToggle = screen.getByLabelText('Toggle right sidebar');

      const leftSidebar = screen.getByTestId('sidebar-menu');
      const rightSidebar = screen.getByTestId('right-sidebar');

      // Toggle left sidebar
      await user.click(leftToggle);
      expect(leftSidebar).toHaveAttribute('data-collapsed', 'true');
      expect(rightSidebar).toHaveAttribute('data-collapsed', 'true');

      // Toggle right sidebar
      await user.click(rightToggle);
      expect(leftSidebar).toHaveAttribute('data-collapsed', 'true');
      expect(rightSidebar).toHaveAttribute('data-collapsed', 'false');
    });
  });

  describe('Mobile Menu State', () => {
    it('opens mobile menu when TopNav menu button clicked', async () => {
      const user = userEvent.setup();

      render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();

      const menuButton = screen.getByLabelText('Open mobile menu');
      await user.click(menuButton);

      expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
    });

    it('closes mobile menu when close button clicked', async () => {
      const user = userEvent.setup();

      render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      // Open menu
      const openButton = screen.getByLabelText('Open mobile menu');
      await user.click(openButton);

      expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();

      // Close menu
      const closeButton = screen.getByLabelText('Close mobile menu');
      await user.click(closeButton);

      expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();
    });

    it('handles multiple open/close cycles', async () => {
      const user = userEvent.setup();

      render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      const openButton = screen.getByLabelText('Open mobile menu');

      // Cycle 1
      await user.click(openButton);
      expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();

      await user.click(screen.getByLabelText('Close mobile menu'));
      expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();

      // Cycle 2
      await user.click(openButton);
      expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();

      await user.click(screen.getByLabelText('Close mobile menu'));
      expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();
    });
  });

  describe('Activity Tracking', () => {
    it('initializes with empty recent activity', () => {
      render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      const activityCount = screen.getByTestId('recent-activity-count');
      expect(activityCount).toHaveTextContent('0');
    });

    it('clears activity when clear button clicked', async () => {
      const user = userEvent.setup();

      // Pre-populate localStorage
      localStorageMock.setItem(
        'aura_recent_activity',
        JSON.stringify([
          { path: '/test', title: 'Test', module: 'Test', timestamp: Date.now() },
        ])
      );

      render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      await waitFor(() => {
        const activityCount = screen.getByTestId('recent-activity-count');
        expect(activityCount).toHaveTextContent('1');
      });

      const clearButton = screen.getByLabelText('Clear activity');
      await user.click(clearButton);

      await waitFor(() => {
        const activityCount = screen.getByTestId('recent-activity-count');
        expect(activityCount).toHaveTextContent('0');
      });
    });

    it('loads recent activity from localStorage on mount', async () => {
      const activity = [
        { path: '/dashboard', title: 'Dashboard', module: 'Home', timestamp: Date.now() },
        { path: '/employees', title: 'Employees', module: 'Core HR', timestamp: Date.now() },
      ];

      localStorageMock.setItem('aura_recent_activity', JSON.stringify(activity));

      render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      await waitFor(() => {
        const activityCount = screen.getByTestId('recent-activity-count');
        expect(activityCount).toHaveTextContent('2');
      });
    });
  });

  describe('Favorites Management', () => {
    it('initializes with empty favorites', () => {
      render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      const favoritesCount = screen.getAllByTestId('favorites-count');
      favoritesCount.forEach((count) => {
        expect(count).toHaveTextContent('0');
      });
    });

    it('toggles favorite when favorite button clicked', async () => {
      const user = userEvent.setup();

      render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      const favoriteButton = screen.getByLabelText('Toggle favorite');
      const favoritesCount = screen.getAllByTestId('favorites-count');

      await user.click(favoriteButton);

      await waitFor(() => {
        favoritesCount.forEach((count) => {
          expect(count).toHaveTextContent('1');
        });
      });

      // Toggle again to remove
      await user.click(favoriteButton);

      await waitFor(() => {
        favoritesCount.forEach((count) => {
          expect(count).toHaveTextContent('0');
        });
      });
    });

    it('removes favorite when remove button clicked', async () => {
      const user = userEvent.setup();

      // Pre-populate favorites
      localStorageMock.setItem(
        'aura_favorites',
        JSON.stringify([
          { path: '/test', title: 'Test', module: 'Test', addedAt: Date.now() },
        ])
      );

      render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      await waitFor(() => {
        const favoritesCount = screen.getAllByTestId('favorites-count');
        favoritesCount.forEach((count) => {
          expect(count).toHaveTextContent('1');
        });
      });

      const removeButton = screen.getByLabelText('Remove favorite');
      await user.click(removeButton);

      await waitFor(() => {
        const favoritesCount = screen.getAllByTestId('favorites-count');
        favoritesCount.forEach((count) => {
          expect(count).toHaveTextContent('0');
        });
      });
    });

    it('loads favorites from localStorage on mount', async () => {
      const favorites = [
        { path: '/dashboard', title: 'Dashboard', module: 'Home', addedAt: Date.now() },
        { path: '/employees', title: 'Employees', module: 'Core HR', addedAt: Date.now() },
      ];

      localStorageMock.setItem('aura_favorites', JSON.stringify(favorites));

      render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      await waitFor(() => {
        const favoritesCount = screen.getAllByTestId('favorites-count');
        favoritesCount.forEach((count) => {
          expect(count).toHaveTextContent('2');
        });
      });
    });
  });

  describe('Navigation Handling', () => {
    it('passes navigation handler to sidebar', async () => {
      const user = userEvent.setup();

      render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      const navigateButton = screen.getByLabelText('Navigate');

      // Should not throw error
      await user.click(navigateButton);

      // Activity should be added
      await waitFor(() => {
        const activityCount = screen.getByTestId('recent-activity-count');
        expect(activityCount).toHaveTextContent('1');
      });
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations with mobile menu open', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      const menuButton = screen.getByLabelText('Open mobile menu');
      await user.click(menuButton);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('main content has proper landmark role', () => {
      render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('sidebar toggle buttons have accessible labels', () => {
      render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      expect(screen.getByLabelText('Toggle sidebar')).toHaveAccessibleName();
      expect(screen.getByLabelText('Toggle right sidebar')).toHaveAccessibleName();
    });

    it('mobile menu buttons have accessible labels', async () => {
      const user = userEvent.setup();

      render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      expect(screen.getByLabelText('Open mobile menu')).toHaveAccessibleName();

      await user.click(screen.getByLabelText('Open mobile menu'));

      expect(screen.getByLabelText('Close mobile menu')).toHaveAccessibleName();
    });
  });

  describe('Responsive Behavior', () => {
    it('applies responsive classes to main content', () => {
      render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      const main = screen.getByRole('main');
      expect(main).toHaveClass('flex-1', 'overflow-y-auto', 'p-6');
    });

    it('hides desktop sidebar on mobile (with lg: breakpoint)', () => {
      const { container } = render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      const sidebarWrapper = screen.getByTestId('sidebar-menu').parentElement;
      expect(sidebarWrapper).toHaveClass('hidden', 'lg:block');
    });

    it('hides right sidebar on mobile (with lg: breakpoint)', () => {
      const { container } = render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      const rightSidebarWrapper = screen.getByTestId('right-sidebar').parentElement;
      expect(rightSidebarWrapper).toHaveClass('hidden', 'lg:block');
    });
  });

  describe('Edge Cases', () => {
    it('handles malformed localStorage data gracefully', () => {
      localStorageMock.setItem('aura_recent_activity', 'invalid json');
      localStorageMock.setItem('aura_favorites', 'invalid json');

      // Should not throw error
      render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      const activityCount = screen.getByTestId('recent-activity-count');
      expect(activityCount).toHaveTextContent('0');
    });

    it('handles multiple rapid sidebar toggles', async () => {
      const user = userEvent.setup();

      render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      const toggleButton = screen.getByLabelText('Toggle sidebar');

      // Rapid toggles
      await user.click(toggleButton);
      await user.click(toggleButton);
      await user.click(toggleButton);
      await user.click(toggleButton);

      // Should end in collapsed state after 4 clicks
      const sidebar = screen.getByTestId('sidebar-menu');
      expect(sidebar).toHaveAttribute('data-collapsed', 'false');
    });

    it('handles rapid mobile menu open/close', async () => {
      const user = userEvent.setup();

      render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      const openButton = screen.getByLabelText('Open mobile menu');

      // Open
      await user.click(openButton);
      expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();

      // Close
      await user.click(screen.getByLabelText('Close mobile menu'));
      expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();

      // Open again
      await user.click(openButton);
      expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
    });

    it('renders with complex nested children', () => {
      render(
        <AppLayout>
          <div>
            <header>Header</header>
            <section>
              <article>Article</article>
            </section>
            <footer>Footer</footer>
          </div>
        </AppLayout>
      );

      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Article')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });
  });

  describe('Provider Integration', () => {
    it('wraps content with ActivityProvider', () => {
      render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      // If provider is working, we should be able to access activity state
      const activityCount = screen.getByTestId('recent-activity-count');
      expect(activityCount).toBeInTheDocument();
    });

    it('provides activity context to all child components', async () => {
      const user = userEvent.setup();

      render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      // Add favorite through sidebar
      const favoriteButton = screen.getByLabelText('Toggle favorite');
      await user.click(favoriteButton);

      // Should be reflected in right sidebar
      await waitFor(() => {
        const favoritesCount = screen.getAllByTestId('favorites-count');
        favoritesCount.forEach((count) => {
          expect(count).toHaveTextContent('1');
        });
      });
    });
  });

  describe('Visual Regression Prevention', () => {
    it('maintains consistent layout structure classes', () => {
      const { container } = render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      const root = container.querySelector('.min-h-screen');
      expect(root).toHaveClass('bg-white-glow', 'dark:bg-deep-cosmos');

      const flexContainer = container.querySelector('.flex.h-\\[calc\\(100vh-4rem\\)\\]');
      expect(flexContainer).toBeInTheDocument();
    });

    it('maintains consistent main content classes', () => {
      render(
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      );

      const main = screen.getByRole('main');
      expect(main).toHaveClass('flex-1', 'overflow-y-auto', 'p-6', 'transition-all');
    });

    it('maintains consistent max-width wrapper', () => {
      render(
        <AppLayout>
          <div data-testid="content">Content</div>
        </AppLayout>
      );

      const content = screen.getByTestId('content');
      const wrapper = content.closest('.max-w-7xl');
      expect(wrapper).toHaveClass('mx-auto');
    });
  });
});
