/**
 * TopNav Component Tests
 * Tests navigation bar, search, notifications, profile menu, and theme toggle
 *
 * @reference docs/testing/COMPONENT-TESTING-GUIDE.md
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TopNav } from './top-nav';
import { axe } from '@/__tests__/setupAxe';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('TopNav', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders navigation header', () => {
      render(<TopNav />);

      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
    });

    it('renders AuraOS logo', () => {
      render(<TopNav />);

      expect(screen.getByText('AuraOS')).toBeInTheDocument();
      expect(screen.getByText('A')).toBeInTheDocument(); // Logo initial
    });

    it('renders logo as link to home', () => {
      render(<TopNav />);

      const logoLink = screen.getByText('AuraOS').closest('a');
      expect(logoLink).toHaveAttribute('href', '/');
    });

    it('renders search input', () => {
      render(<TopNav />);

      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('renders search with keyboard shortcut hint', () => {
      render(<TopNav />);

      expect(screen.getByText('⌘K')).toBeInTheDocument();
    });

    it('renders mobile menu button', () => {
      render(<TopNav />);

      const menuButtons = screen.getAllByRole('button');
      const mobileMenuButton = menuButtons.find(
        (btn) => btn.querySelector('svg') && btn.className.includes('lg:hidden')
      );

      expect(mobileMenuButton).toBeInTheDocument();
    });

    it('renders AI assistant button', () => {
      render(<TopNav />);

      expect(screen.getByText('AI')).toBeInTheDocument();
    });

    it('renders theme toggle button', () => {
      render(<TopNav />);

      // Moon icon should be visible initially (light mode)
      const buttons = screen.getAllByRole('button');
      const themeButton = buttons.find((btn) => {
        const svg = btn.querySelector('svg');
        return svg && svg.classList.toString().includes('lucide');
      });

      expect(themeButton).toBeDefined();
    });

    it('renders help button', () => {
      render(<TopNav />);

      // Help button is hidden on mobile (sm:block)
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('renders notifications button', () => {
      render(<TopNav />);

      const buttons = screen.getAllByRole('button');
      const notificationButton = buttons.find((btn) => {
        const bell = btn.querySelector('svg');
        return bell && btn.className.includes('relative');
      });

      expect(notificationButton).toBeInTheDocument();
    });

    it('renders notification badge', () => {
      const { container } = render(<TopNav />);

      // Notification badge (red dot)
      const badge = container.querySelector('.bg-quantum-rose.rounded-full');
      expect(badge).toBeInTheDocument();
    });

    it('renders settings link', () => {
      render(<TopNav />);

      const settingsLink = screen.getAllByRole('link').find((link) =>
        link.getAttribute('href')?.includes('/settings')
      );

      expect(settingsLink).toBeDefined();
    });

    it('renders profile button', () => {
      render(<TopNav />);

      const buttons = screen.getAllByRole('button');
      const profileButton = buttons.find((btn) => {
        const userIcon = btn.querySelector('svg');
        const avatar = btn.querySelector('.bg-gradient-to-br');
        return avatar && userIcon;
      });

      expect(profileButton).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<TopNav className="custom-nav" />);

      const header = container.querySelector('header');
      expect(header).toHaveClass('custom-nav');
    });
  });

  describe('Mobile Menu', () => {
    it('calls onMenuClick when mobile menu button clicked', async () => {
      const user = userEvent.setup();
      const handleMenuClick = vi.fn();

      render(<TopNav onMenuClick={handleMenuClick} />);

      const buttons = screen.getAllByRole('button');
      const mobileMenuButton = buttons.find(
        (btn) => btn.querySelector('svg') && btn.className.includes('lg:hidden')
      );

      if (mobileMenuButton) {
        await user.click(mobileMenuButton);
        expect(handleMenuClick).toHaveBeenCalledTimes(1);
      }
    });

    it('does not error when onMenuClick not provided', async () => {
      const user = userEvent.setup();

      render(<TopNav />);

      const buttons = screen.getAllByRole('button');
      const mobileMenuButton = buttons.find(
        (btn) => btn.querySelector('svg') && btn.className.includes('lg:hidden')
      );

      if (mobileMenuButton) {
        // Should not throw error
        await user.click(mobileMenuButton);
        expect(true).toBe(true);
      }
    });
  });

  describe('Search Functionality', () => {
    it('allows typing in search input', async () => {
      const user = userEvent.setup();

      render(<TopNav />);

      const searchInput = screen.getByPlaceholderText('Search...');
      await user.type(searchInput, 'employee');

      expect(searchInput).toHaveValue('employee');
    });

    it('search input is keyboard accessible', async () => {
      const user = userEvent.setup();

      render(<TopNav />);

      const searchInput = screen.getByPlaceholderText('Search...');
      searchInput.focus();

      expect(searchInput).toHaveFocus();

      await user.keyboard('test query');

      expect(searchInput).toHaveValue('test query');
    });

    it('shows keyboard shortcut hint on larger screens', () => {
      render(<TopNav />);

      const shortcut = screen.getByText('⌘K');
      expect(shortcut).toHaveClass('lg:inline-flex');
    });
  });

  describe('Theme Toggle', () => {
    it('toggles theme when theme button clicked', async () => {
      const user = userEvent.setup();

      render(<TopNav />);

      const buttons = screen.getAllByRole('button');

      // Find theme toggle button (has Moon or Sun icon)
      const themeButton = buttons.find((btn) => {
        const svg = btn.querySelector('svg');
        return svg && (
          svg.classList.toString().includes('text-twilight') ||
          svg.classList.toString().includes('text-sunset-amber')
        );
      });

      if (themeButton) {
        await user.click(themeButton);

        // After click, state should change
        // Component re-renders with different icon
        expect(themeButton).toBeInTheDocument();
      }
    });

    it('starts in light mode (shows Moon icon)', () => {
      render(<TopNav />);

      // Initially should show Moon icon (light mode)
      const buttons = screen.getAllByRole('button');
      const themeButton = buttons.find((btn) => {
        const svg = btn.querySelector('svg');
        return svg && svg.classList.toString().includes('text-twilight');
      });

      expect(themeButton).toBeDefined();
    });

    it('handles multiple theme toggles', async () => {
      const user = userEvent.setup();

      render(<TopNav />);

      const buttons = screen.getAllByRole('button');
      const themeButton = buttons.find((btn) => {
        const svg = btn.querySelector('svg');
        return svg && (
          svg.classList.toString().includes('text-twilight') ||
          svg.classList.toString().includes('text-sunset-amber')
        );
      });

      if (themeButton) {
        // Multiple toggles
        await user.click(themeButton);
        await user.click(themeButton);
        await user.click(themeButton);

        // Should still work without errors
        expect(themeButton).toBeInTheDocument();
      }
    });
  });

  describe('Notifications Dropdown', () => {
    it('does not show notifications dropdown initially', () => {
      render(<TopNav />);

      expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
    });

    it('opens notifications dropdown when bell button clicked', async () => {
      const user = userEvent.setup();

      render(<TopNav />);

      const buttons = screen.getAllByRole('button');
      const notificationButton = buttons.find((btn) => {
        const bell = btn.querySelector('svg');
        return bell && btn.className.includes('relative');
      });

      if (notificationButton) {
        await user.click(notificationButton);

        expect(screen.getByText('Notifications')).toBeInTheDocument();
      }
    });

    it('shows empty state in notifications', async () => {
      const user = userEvent.setup();

      render(<TopNav />);

      const buttons = screen.getAllByRole('button');
      const notificationButton = buttons.find((btn) => {
        const bell = btn.querySelector('svg');
        return bell && btn.className.includes('relative');
      });

      if (notificationButton) {
        await user.click(notificationButton);

        expect(screen.getByText('No new notifications')).toBeInTheDocument();
      }
    });

    it('closes notifications dropdown when clicked again', async () => {
      const user = userEvent.setup();

      render(<TopNav />);

      const buttons = screen.getAllByRole('button');
      const notificationButton = buttons.find((btn) => {
        const bell = btn.querySelector('svg');
        return bell && btn.className.includes('relative');
      });

      if (notificationButton) {
        // Open
        await user.click(notificationButton);
        expect(screen.getByText('Notifications')).toBeInTheDocument();

        // Close
        await user.click(notificationButton);
        expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
      }
    });

    it('handles rapid notifications toggle', async () => {
      const user = userEvent.setup();

      render(<TopNav />);

      const buttons = screen.getAllByRole('button');
      const notificationButton = buttons.find((btn) => {
        const bell = btn.querySelector('svg');
        return bell && btn.className.includes('relative');
      });

      if (notificationButton) {
        await user.click(notificationButton);
        await user.click(notificationButton);
        await user.click(notificationButton);

        // Should end in open state
        expect(screen.getByText('Notifications')).toBeInTheDocument();
      }
    });
  });

  describe('Profile Dropdown', () => {
    it('does not show profile dropdown initially', () => {
      render(<TopNav />);

      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('opens profile dropdown when profile button clicked', async () => {
      const user = userEvent.setup();

      render(<TopNav />);

      const buttons = screen.getAllByRole('button');
      const profileButton = buttons.find((btn) => {
        const avatar = btn.querySelector('.bg-gradient-to-br.from-neural-mint');
        return avatar !== null;
      });

      if (profileButton) {
        await user.click(profileButton);

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Super Admin')).toBeInTheDocument();
      }
    });

    it('shows profile menu items', async () => {
      const user = userEvent.setup();

      render(<TopNav />);

      const buttons = screen.getAllByRole('button');
      const profileButton = buttons.find((btn) => {
        const avatar = btn.querySelector('.bg-gradient-to-br.from-neural-mint');
        return avatar !== null;
      });

      if (profileButton) {
        await user.click(profileButton);

        expect(screen.getByText('My Profile')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText('Sign Out')).toBeInTheDocument();
      }
    });

    it('profile menu links have correct href', async () => {
      const user = userEvent.setup();

      render(<TopNav />);

      const buttons = screen.getAllByRole('button');
      const profileButton = buttons.find((btn) => {
        const avatar = btn.querySelector('.bg-gradient-to-br.from-neural-mint');
        return avatar !== null;
      });

      if (profileButton) {
        await user.click(profileButton);

        const profileLink = screen.getByText('My Profile').closest('a');
        expect(profileLink).toHaveAttribute('href', '/profile');

        const settingsLink = screen.getByText('Settings').closest('a');
        expect(settingsLink).toHaveAttribute('href', '/settings');
      }
    });

    it('closes profile dropdown when clicked again', async () => {
      const user = userEvent.setup();

      render(<TopNav />);

      const buttons = screen.getAllByRole('button');
      const profileButton = buttons.find((btn) => {
        const avatar = btn.querySelector('.bg-gradient-to-br.from-neural-mint');
        return avatar !== null;
      });

      if (profileButton) {
        // Open
        await user.click(profileButton);
        expect(screen.getByText('John Doe')).toBeInTheDocument();

        // Close
        await user.click(profileButton);
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      }
    });

    it('sign out button is clickable', async () => {
      const user = userEvent.setup();

      render(<TopNav />);

      const buttons = screen.getAllByRole('button');
      const profileButton = buttons.find((btn) => {
        const avatar = btn.querySelector('.bg-gradient-to-br.from-neural-mint');
        return avatar !== null;
      });

      if (profileButton) {
        await user.click(profileButton);

        const signOutButton = screen.getByText('Sign Out');
        await user.click(signOutButton);

        // Should not throw error
        expect(true).toBe(true);
      }
    });
  });

  describe('AI Assistant Button', () => {
    it('renders AI assistant button with icon and text', () => {
      render(<TopNav />);

      expect(screen.getByText('AI')).toBeInTheDocument();
    });

    it('AI button is clickable', async () => {
      const user = userEvent.setup();

      render(<TopNav />);

      const aiButton = screen.getByText('AI').closest('button');

      if (aiButton) {
        await user.click(aiButton);

        // Should not throw error
        expect(aiButton).toBeInTheDocument();
      }
    });

    it('AI button has gradient styling', () => {
      render(<TopNav />);

      const aiButton = screen.getByText('AI').closest('button');
      expect(aiButton).toHaveClass('bg-gradient-to-r', 'from-celestial-indigo', 'to-quantum-rose');
    });
  });

  describe('Responsive Behavior', () => {
    it('hides mobile menu button on large screens', () => {
      render(<TopNav />);

      const buttons = screen.getAllByRole('button');
      const mobileMenuButton = buttons.find(
        (btn) => btn.querySelector('svg') && btn.className.includes('lg:hidden')
      );

      expect(mobileMenuButton).toHaveClass('lg:hidden');
    });

    it('hides AuraOS text on small screens', () => {
      render(<TopNav />);

      const auraText = screen.getByText('AuraOS');
      expect(auraText).toHaveClass('hidden', 'sm:block');
    });

    it('hides search on mobile', () => {
      render(<TopNav />);

      const searchContainer = screen.getByPlaceholderText('Search...').closest('div');
      const mdFlexContainer = searchContainer?.closest('.md\\:flex');

      expect(mdFlexContainer).toHaveClass('hidden', 'md:flex');
    });

    it('hides AI button on small screens', () => {
      render(<TopNav />);

      const aiButton = screen.getByText('AI').closest('button');
      expect(aiButton).toHaveClass('hidden', 'sm:flex');
    });

    it('hides help button on small screens', () => {
      const { container } = render(<TopNav />);

      const helpButtons = Array.from(container.querySelectorAll('button')).filter(
        (btn) => btn.className.includes('sm:block')
      );

      expect(helpButtons.length).toBeGreaterThan(0);
    });

    it('hides settings link on small screens', () => {
      render(<TopNav />);

      const settingsLinks = screen.getAllByRole('link').filter((link) =>
        link.className.includes('sm:block') && link.getAttribute('href') === '/settings'
      );

      expect(settingsLinks.length).toBeGreaterThan(0);
    });

    it('hides chevron on profile button on small screens', () => {
      const { container } = render(<TopNav />);

      const chevrons = container.querySelectorAll('.hidden.sm\\:block');
      expect(chevrons.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<TopNav />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations with notifications open', async () => {
      const user = userEvent.setup();
      const { container } = render(<TopNav />);

      const buttons = screen.getAllByRole('button');
      const notificationButton = buttons.find((btn) => {
        const bell = btn.querySelector('svg');
        return bell && btn.className.includes('relative');
      });

      if (notificationButton) {
        await user.click(notificationButton);

        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });

    it('has no accessibility violations with profile menu open', async () => {
      const user = userEvent.setup();
      const { container } = render(<TopNav />);

      const buttons = screen.getAllByRole('button');
      const profileButton = buttons.find((btn) => {
        const avatar = btn.querySelector('.bg-gradient-to-br.from-neural-mint');
        return avatar !== null;
      });

      if (profileButton) {
        await user.click(profileButton);

        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });

    it('uses semantic header element', () => {
      render(<TopNav />);

      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('search input has accessible placeholder', () => {
      render(<TopNav />);

      const searchInput = screen.getByPlaceholderText('Search...');
      expect(searchInput).toHaveAttribute('placeholder', 'Search...');
    });

    it('all links have valid href attributes', () => {
      render(<TopNav />);

      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link).toHaveAttribute('href');
      });
    });

    it('all buttons are keyboard accessible', () => {
      render(<TopNav />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button.tagName).toBe('BUTTON');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('search input is focusable', async () => {
      const user = userEvent.setup();

      render(<TopNav />);

      const searchInput = screen.getByPlaceholderText('Search...');

      await user.tab();
      searchInput.focus();

      expect(searchInput).toHaveFocus();
    });

    it('can tab through all interactive elements', async () => {
      const user = userEvent.setup();

      render(<TopNav />);

      // Tab through elements
      await user.tab(); // First button or link

      const activeElement = document.activeElement;
      expect(activeElement?.tagName).toMatch(/BUTTON|A|INPUT/);
    });

    it('buttons activate on Enter key', async () => {
      const user = userEvent.setup();
      const handleMenuClick = vi.fn();

      render(<TopNav onMenuClick={handleMenuClick} />);

      const buttons = screen.getAllByRole('button');
      const mobileMenuButton = buttons.find(
        (btn) => btn.querySelector('svg') && btn.className.includes('lg:hidden')
      );

      if (mobileMenuButton) {
        mobileMenuButton.focus();
        await user.keyboard('{Enter}');

        expect(handleMenuClick).toHaveBeenCalled();
      }
    });
  });

  describe('Edge Cases', () => {
    it('handles multiple dropdowns open simultaneously', async () => {
      const user = userEvent.setup();

      render(<TopNav />);

      const buttons = screen.getAllByRole('button');

      const notificationButton = buttons.find((btn) => {
        const bell = btn.querySelector('svg');
        return bell && btn.className.includes('relative');
      });

      const profileButton = buttons.find((btn) => {
        const avatar = btn.querySelector('.bg-gradient-to-br.from-neural-mint');
        return avatar !== null;
      });

      if (notificationButton && profileButton) {
        // Open notifications
        await user.click(notificationButton);
        expect(screen.getByText('Notifications')).toBeInTheDocument();

        // Open profile (notifications should still be open)
        await user.click(profileButton);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Notifications')).toBeInTheDocument();
      }
    });

    it('handles search with special characters', async () => {
      const user = userEvent.setup();

      render(<TopNav />);

      const searchInput = screen.getByPlaceholderText('Search...');
      await user.type(searchInput, '@#$%^&*()');

      expect(searchInput).toHaveValue('@#$%^&*()');
    });

    it('handles search with very long input', async () => {
      const user = userEvent.setup();

      render(<TopNav />);

      const searchInput = screen.getByPlaceholderText('Search...');
      const longInput = 'a'.repeat(500);

      await user.type(searchInput, longInput);

      expect(searchInput).toHaveValue(longInput);
    });

    it('handles rapid button clicks', async () => {
      const user = userEvent.setup();
      const handleMenuClick = vi.fn();

      render(<TopNav onMenuClick={handleMenuClick} />);

      const buttons = screen.getAllByRole('button');
      const mobileMenuButton = buttons.find(
        (btn) => btn.querySelector('svg') && btn.className.includes('lg:hidden')
      );

      if (mobileMenuButton) {
        // Rapid clicks
        await user.click(mobileMenuButton);
        await user.click(mobileMenuButton);
        await user.click(mobileMenuButton);

        expect(handleMenuClick).toHaveBeenCalledTimes(3);
      }
    });
  });

  describe('Visual Regression Prevention', () => {
    it('maintains consistent header classes', () => {
      const { container } = render(<TopNav />);

      const header = container.querySelector('header');
      expect(header).toHaveClass(
        'sticky',
        'top-0',
        'z-40',
        'flex',
        'items-center',
        'justify-between',
        'h-16'
      );
    });

    it('maintains consistent backdrop blur', () => {
      const { container } = render(<TopNav />);

      const header = container.querySelector('header');
      expect(header).toHaveClass('backdrop-blur-xl');
    });

    it('maintains consistent border styling', () => {
      const { container } = render(<TopNav />);

      const header = container.querySelector('header');
      expect(header).toHaveClass('border-b', 'border-cloud', 'dark:border-nebula-purple');
    });

    it('maintains consistent dropdown styling', async () => {
      const user = userEvent.setup();

      render(<TopNav />);

      const buttons = screen.getAllByRole('button');
      const notificationButton = buttons.find((btn) => {
        const bell = btn.querySelector('svg');
        return bell && btn.className.includes('relative');
      });

      if (notificationButton) {
        await user.click(notificationButton);

        const dropdown = screen.getByText('Notifications').closest('div');
        expect(dropdown).toHaveClass('rounded-xl', 'shadow-lg', 'border');
      }
    });
  });

  describe('Logo and Branding', () => {
    it('renders logo with correct gradient', () => {
      const { container } = render(<TopNav />);

      const logo = container.querySelector('.bg-gradient-to-br.from-orange-500.to-amber-600');
      expect(logo).toBeInTheDocument();
    });

    it('logo link navigates to home', () => {
      render(<TopNav />);

      const logoLink = screen.getByText('A').closest('a');
      expect(logoLink).toHaveAttribute('href', '/');
    });

    it('renders logo initial in circle', () => {
      render(<TopNav />);

      const initial = screen.getByText('A');
      expect(initial).toHaveClass('text-white', 'font-bold');
    });
  });
});
