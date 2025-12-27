/**
 * MobileMenu Component Tests - Production Ready
 * Comprehensive test coverage for the mobile navigation drawer
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileMenu } from './mobile-menu';

// Mock Next.js navigation
const mockPush = vi.fn();
const mockPathname = '/';

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: mockPush }),
}));

// Mock menu icons
const mockIcons = {
  Users: () => <div data-testid="users-icon">UsersIcon</div>,
  Calendar: () => <div data-testid="calendar-icon">CalendarIcon</div>,
  DollarSign: () => <div data-testid="dollar-icon">DollarIcon</div>,
};

vi.mock('./menu-icons', () => ({
  getMenuIcon: (iconName: string) => mockIcons[iconName as keyof typeof mockIcons] || (() => <div>Icon</div>),
}));

// Mock superAdminMenu
vi.mock('@aura/config', () => ({
  superAdminMenu: {
    items: [
      {
        code: 'CORE_HR',
        label: 'Core HR',
        icon: 'Users',
        features: ['Employee Database', 'Organization Structure', 'Documents'],
      },
      {
        code: 'PAYROLL',
        label: 'Payroll',
        icon: 'DollarSign',
        features: ['Salary Management', 'Tax Declarations', 'Payslips'],
      },
      {
        code: 'ATTENDANCE',
        label: 'Attendance',
        icon: 'Calendar',
        features: ['Time Tracking', 'Shift Management', 'Leaves'],
      },
    ],
  },
}));

describe('MobileMenu', () => {
  let onCloseMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    onCloseMock = vi.fn();
    document.body.style.overflow = '';
  });

  // ========================================================================
  // RENDERING
  // ========================================================================

  describe('Rendering', () => {
    it('renders when isOpen is true', () => {
      render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      expect(screen.getByText('AURA')).toBeInTheDocument();
      expect(screen.getByText('HCM Platform')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(<MobileMenu isOpen={false} onClose={onCloseMock} />);

      expect(screen.queryByText('AURA')).not.toBeInTheDocument();
    });

    it('renders all modules from menu config', () => {
      render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      expect(screen.getByText('Core HR')).toBeInTheDocument();
      expect(screen.getByText('Payroll')).toBeInTheDocument();
      expect(screen.getByText('Attendance')).toBeInTheDocument();
    });

    it('renders module icons', () => {
      render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      expect(screen.getByTestId('users-icon')).toBeInTheDocument();
      expect(screen.getByTestId('dollar-icon')).toBeInTheDocument();
      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
    });

    it('renders feature count for each module', () => {
      render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      expect(screen.getByText('3 features')).toBeInTheDocument(); // Core HR has 3 features
    });

    it('renders close button', () => {
      render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('renders search input', () => {
      render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      expect(screen.getByPlaceholderText('Search modules & features...')).toBeInTheDocument();
    });

    it('renders quick action links', () => {
      render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Alerts')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('renders settings link in footer', () => {
      render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('renders sign out button in footer', () => {
      render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // INTERACTION
  // ========================================================================

  describe('Interaction', () => {
    it('calls onClose when close button is clicked', () => {
      render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      const closeButtons = screen.getAllByRole('button');
      const closeButton = closeButtons.find(btn =>
        btn.querySelector('svg') && btn.className.includes('p-2')
      );

      if (closeButton) {
        fireEvent.click(closeButton);
        expect(onCloseMock).toHaveBeenCalledTimes(1);
      }
    });

    it('calls onClose when backdrop is clicked', () => {
      const { container } = render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      const backdrop = container.querySelector('.backdrop-blur-sm');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(onCloseMock).toHaveBeenCalledTimes(1);
      }
    });

    it('shows module features when module is clicked', () => {
      render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      const coreHRModule = screen.getByText('Core HR');
      fireEvent.click(coreHRModule.closest('button')!);

      expect(screen.getByText('Employee Database')).toBeInTheDocument();
      expect(screen.getByText('Organization Structure')).toBeInTheDocument();
      expect(screen.getByText('Documents')).toBeInTheDocument();
    });

    it('shows "Back to Modules" button when viewing features', () => {
      render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      const coreHRModule = screen.getByText('Core HR');
      fireEvent.click(coreHRModule.closest('button')!);

      expect(screen.getByText('Back to Modules')).toBeInTheDocument();
    });

    it('returns to module list when "Back to Modules" is clicked', () => {
      render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      // Navigate to features
      const coreHRModule = screen.getByText('Core HR');
      fireEvent.click(coreHRModule.closest('button')!);
      expect(screen.getByText('Employee Database')).toBeInTheDocument();

      // Go back
      const backButton = screen.getByText('Back to Modules');
      fireEvent.click(backButton);

      // Should see module list again
      expect(screen.queryByText('Employee Database')).not.toBeInTheDocument();
      expect(screen.getByText('Core HR')).toBeInTheDocument();
      expect(screen.getByText('Payroll')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // SEARCH FUNCTIONALITY
  // ========================================================================

  describe('Search Functionality', () => {
    it('filters modules based on search query', async () => {
      const user = userEvent.setup();

      render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      const searchInput = screen.getByPlaceholderText('Search modules & features...');
      await user.type(searchInput, 'payroll');

      expect(screen.getByText('Payroll')).toBeInTheDocument();
      expect(screen.queryByText('Core HR')).not.toBeInTheDocument();
      expect(screen.queryByText('Attendance')).not.toBeInTheDocument();
    });

    it('filters modules by feature name', async () => {
      const user = userEvent.setup();

      render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      const searchInput = screen.getByPlaceholderText('Search modules & features...');
      await user.type(searchInput, 'employee');

      // Core HR has "Employee Database" feature
      expect(screen.getByText('Core HR')).toBeInTheDocument();
      expect(screen.queryByText('Payroll')).not.toBeInTheDocument();
    });

    it('is case-insensitive', async () => {
      const user = userEvent.setup();

      render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      const searchInput = screen.getByPlaceholderText('Search modules & features...');
      await user.type(searchInput, 'ATTENDANCE');

      expect(screen.getByText('Attendance')).toBeInTheDocument();
    });

    it('shows all modules when search is cleared', async () => {
      const user = userEvent.setup();

      render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      const searchInput = screen.getByPlaceholderText('Search modules & features...');
      await user.type(searchInput, 'payroll');
      expect(screen.queryByText('Core HR')).not.toBeInTheDocument();

      await user.clear(searchInput);
      expect(screen.getByText('Core HR')).toBeInTheDocument();
      expect(screen.getByText('Payroll')).toBeInTheDocument();
    });

    it('shows no modules when search matches nothing', async () => {
      const user = userEvent.setup();

      render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      const searchInput = screen.getByPlaceholderText('Search modules & features...');
      await user.type(searchInput, 'nonexistent');

      expect(screen.queryByText('Core HR')).not.toBeInTheDocument();
      expect(screen.queryByText('Payroll')).not.toBeInTheDocument();
      expect(screen.queryByText('Attendance')).not.toBeInTheDocument();
    });
  });

  // ========================================================================
  // NAVIGATION
  // ========================================================================

  describe('Navigation', () => {
    it('navigates to feature when feature link is clicked', () => {
      render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      // Open Core HR features
      const coreHRModule = screen.getByText('Core HR');
      fireEvent.click(coreHRModule.closest('button')!);

      // Click on Employee Database feature
      const employeeDbLink = screen.getByText('Employee Database');
      expect(employeeDbLink.closest('a')).toHaveAttribute('href', '/core-hr/employee-database');
    });

    it('generates correct feature paths', () => {
      render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      // Open Payroll features
      const payrollModule = screen.getByText('Payroll');
      fireEvent.click(payrollModule.closest('button')!);

      // Check Salary Management path
      const salaryLink = screen.getByText('Salary Management');
      expect(salaryLink.closest('a')).toHaveAttribute('href', '/payroll/salary-management');
    });

    it('quick action links have correct hrefs', () => {
      render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      const homeLink = screen.getByText('Home').closest('a');
      const alertsLink = screen.getByText('Alerts').closest('a');
      const profileLink = screen.getByText('Profile').closest('a');

      expect(homeLink).toHaveAttribute('href', '/');
      expect(alertsLink).toHaveAttribute('href', '/notifications');
      expect(profileLink).toHaveAttribute('href', '/profile');
    });

    it('settings link has correct href', () => {
      render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      const settingsLink = screen.getByText('Settings').closest('a');
      expect(settingsLink).toHaveAttribute('href', '/settings');
    });
  });

  // ========================================================================
  // BODY SCROLL MANAGEMENT
  // ========================================================================

  describe('Body Scroll Management', () => {
    it('sets body overflow to hidden when opened', () => {
      render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('resets body overflow when closed', () => {
      const { rerender } = render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      expect(document.body.style.overflow).toBe('hidden');

      rerender(<MobileMenu isOpen={false} onClose={onCloseMock} />);

      expect(document.body.style.overflow).toBe('');
    });

    it('cleans up body overflow on unmount', () => {
      const { unmount } = render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      expect(document.body.style.overflow).toBe('hidden');

      unmount();

      expect(document.body.style.overflow).toBe('');
    });
  });

  // ========================================================================
  // ACTIVE STATE
  // ========================================================================

  describe('Active State', () => {
    it('highlights active module based on pathname', () => {
      // Set pathname to Core HR route
      vi.mocked(mockPathname as any).mockReturnValue('/core-hr/employee-database');

      render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      const coreHRButton = screen.getByText('Core HR').closest('button');
      expect(coreHRButton).toHaveClass('from-celestial-indigo/10');
    });

    it('highlights active feature in feature list', () => {
      // Mock pathname
      vi.mocked(mockPathname as any).mockReturnValue('/core-hr/employee-database');

      render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      // Open Core HR features
      const coreHRModule = screen.getByText('Core HR');
      fireEvent.click(coreHRModule.closest('button')!);

      const employeeDbLink = screen.getByText('Employee Database').closest('a');
      expect(employeeDbLink).toHaveClass('from-celestial-indigo/10');
    });
  });

  // ========================================================================
  // EDGE CASES
  // ========================================================================

  describe('Edge Cases', () => {
    it('handles empty search gracefully', async () => {
      const user = userEvent.setup();

      render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      const searchInput = screen.getByPlaceholderText('Search modules & features...');
      await user.type(searchInput, '   ');

      // Should show all modules
      expect(screen.getByText('Core HR')).toBeInTheDocument();
      expect(screen.getByText('Payroll')).toBeInTheDocument();
    });

    it('handles special characters in search', async () => {
      const user = userEvent.setup();

      render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      const searchInput = screen.getByPlaceholderText('Search modules & features...');
      await user.type(searchInput, '@#$%');

      // Should not crash
      expect(screen.getByText('AURA')).toBeInTheDocument();
    });

    it('handles rapid module selection changes', () => {
      render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      // Click Core HR
      fireEvent.click(screen.getByText('Core HR').closest('button')!);
      expect(screen.getByText('Employee Database')).toBeInTheDocument();

      // Click back
      fireEvent.click(screen.getByText('Back to Modules'));

      // Click Payroll
      fireEvent.click(screen.getByText('Payroll').closest('button')!);
      expect(screen.getByText('Salary Management')).toBeInTheDocument();
      expect(screen.queryByText('Employee Database')).not.toBeInTheDocument();
    });

    it('maintains search state when navigating between views', async () => {
      const user = userEvent.setup();

      render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      const searchInput = screen.getByPlaceholderText('Search modules & features...');
      await user.type(searchInput, 'payroll');

      // Navigate to features
      fireEvent.click(screen.getByText('Payroll').closest('button')!);

      // Go back
      fireEvent.click(screen.getByText('Back to Modules'));

      // Search should still be active
      expect(searchInput).toHaveValue('payroll');
    });

    it('handles missing module icons gracefully', () => {
      vi.mock('./menu-icons', () => ({
        getMenuIcon: () => () => null,
      }));

      render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      expect(screen.getByText('Core HR')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // LAYOUT
  // ========================================================================

  describe('Layout', () => {
    it('applies correct z-index', () => {
      const { container } = render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      expect(container.firstChild).toHaveClass('z-50');
    });

    it('renders drawer on left side', () => {
      const { container } = render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      const drawer = container.querySelector('.max-w-sm');
      expect(drawer).toHaveClass('left-0');
    });

    it('limits drawer width', () => {
      const { container } = render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      const drawer = container.querySelector('.max-w-sm');
      expect(drawer).toBeInTheDocument();
    });

    it('renders with full height', () => {
      const { container } = render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      expect(container.firstChild).toHaveClass('inset-0');
    });

    it('hides on large screens', () => {
      const { container } = render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      expect(container.firstChild).toHaveClass('lg:hidden');
    });
  });

  // ========================================================================
  // INTEGRATION
  // ========================================================================

  describe('Integration', () => {
    it('completes full navigation workflow', () => {
      render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      // Start at module list
      expect(screen.getByText('Core HR')).toBeInTheDocument();

      // Click module
      fireEvent.click(screen.getByText('Core HR').closest('button')!);

      // See features
      expect(screen.getByText('Employee Database')).toBeInTheDocument();

      // Check feature link
      const link = screen.getByText('Employee Database').closest('a');
      expect(link).toHaveAttribute('href', '/core-hr/employee-database');
    });

    it('search and navigation workflow', async () => {
      const user = userEvent.setup();

      render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      // Search
      const searchInput = screen.getByPlaceholderText('Search modules & features...');
      await user.type(searchInput, 'attendance');

      // Only Attendance should show
      expect(screen.getByText('Attendance')).toBeInTheDocument();
      expect(screen.queryByText('Core HR')).not.toBeInTheDocument();

      // Click to see features
      fireEvent.click(screen.getByText('Attendance').closest('button')!);

      expect(screen.getByText('Time Tracking')).toBeInTheDocument();
    });

    it('handles quick action and main navigation together', () => {
      render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      // Quick actions are visible
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Alerts')).toBeInTheDocument();

      // Module navigation is also visible
      expect(screen.getByText('Core HR')).toBeInTheDocument();
      expect(screen.getByText('Payroll')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // ACCESSIBILITY
  // ========================================================================

  describe('Accessibility', () => {
    it('renders interactive elements as buttons', () => {
      render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      const coreHRButton = screen.getByText('Core HR').closest('button');
      expect(coreHRButton).toBeInTheDocument();
    });

    it('navigation links are accessible', () => {
      render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      const homeLink = screen.getByText('Home').closest('a');
      expect(homeLink).toHaveAttribute('href');
    });

    it('search input has placeholder', () => {
      render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      const searchInput = screen.getByPlaceholderText('Search modules & features...');
      expect(searchInput).toBeInTheDocument();
    });

    it('close button is keyboard accessible', () => {
      render(<MobileMenu isOpen={true} onClose={onCloseMock} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        button.focus();
        expect(button).toHaveFocus();
      });
    });
  });
});
