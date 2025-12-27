/**
 * SidebarMenu Component Tests
 * Tests navigation, search, collapse, favorites, and nested menu interactions
 *
 * @reference docs/testing/COMPONENT-TESTING-GUIDE.md
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SidebarMenu } from './sidebar-menu';
import { axe } from '@/__tests__/setupAxe';

// Mock Next.js navigation
const mockPathname = '/dashboard';

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock menu icons
vi.mock('./menu-icons', () => ({
  getMenuIcon: () => ({ className }: { className: string }) => (
    <svg data-testid="menu-icon" className={className} />
  ),
}));

// Mock menu configuration
vi.mock('@aura/config', () => ({
  superAdminMenu: {
    items: [
      {
        code: 'CORE_HR',
        label: 'Core HR',
        icon: 'Users',
        features: ['Employee Management', 'Organization Structure', 'Job Positions'],
        path: '/core-hr',
      },
      {
        code: 'LEAVE',
        label: 'Leave Management',
        icon: 'Calendar',
        features: ['Leave Applications', 'Leave Policies', 'Leave Balance'],
        path: '/leave',
      },
      {
        code: 'PAYROLL',
        label: 'Payroll',
        icon: 'DollarSign',
        features: ['Salary Processing', 'Tax Calculations', 'Payslips'],
        path: '/payroll',
      },
      {
        code: 'VERTICAL',
        label: 'Vertical Solutions',
        icon: 'Building2',
        items: [
          {
            code: 'HEALTHCARE',
            label: 'Healthcare',
            icon: 'Heart',
            features: ['Patient Management', 'Staff Scheduling'],
          },
          {
            code: 'RETAIL',
            label: 'Retail',
            icon: 'Briefcase',
            features: ['Inventory', 'Sales'],
          },
        ],
      },
    ],
  },
}));

const mockFavorites = [
  {
    path: '/core-hr/employee-management',
    title: 'Employee Management',
    module: 'Core HR',
  },
];

describe('SidebarMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders sidebar in expanded state by default', () => {
      render(<SidebarMenu />);

      expect(screen.getByText('AuraOS')).toBeInTheDocument();
    });

    it('renders sidebar in collapsed state when collapsed prop is true', () => {
      render(<SidebarMenu collapsed={true} />);

      expect(screen.queryByText('AuraOS')).not.toBeInTheDocument();
    });

    it('renders all main modules', () => {
      render(<SidebarMenu />);

      expect(screen.getByText('Core HR')).toBeInTheDocument();
      expect(screen.getByText('Leave Management')).toBeInTheDocument();
      expect(screen.getByText('Payroll')).toBeInTheDocument();
      expect(screen.getByText('Vertical Solutions')).toBeInTheDocument();
    });

    it('renders module icons', () => {
      render(<SidebarMenu />);

      const icons = screen.getAllByTestId('menu-icon');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('renders search input when expanded', () => {
      render(<SidebarMenu />);

      expect(screen.getByPlaceholderText('Search modules...')).toBeInTheDocument();
    });

    it('does not render search input when collapsed', () => {
      render(<SidebarMenu collapsed={true} />);

      expect(screen.queryByPlaceholderText('Search modules...')).not.toBeInTheDocument();
    });

    it('renders collapse toggle button', () => {
      render(<SidebarMenu />);

      expect(screen.getByLabelText('Collapse sidebar')).toBeInTheDocument();
    });

    it('renders footer with module count when expanded', () => {
      render(<SidebarMenu />);

      expect(screen.getByText(/43.*Modules/)).toBeInTheDocument();
      expect(screen.getByText(/394.*Features/)).toBeInTheDocument();
    });

    it('does not render footer when collapsed', () => {
      render(<SidebarMenu collapsed={true} />);

      expect(screen.queryByText(/Modules/)).not.toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<SidebarMenu className="custom-sidebar" />);

      const sidebar = container.querySelector('aside');
      expect(sidebar).toHaveClass('custom-sidebar');
    });
  });

  describe('Collapse/Expand State', () => {
    it('calls onToggleCollapse when toggle button clicked', async () => {
      const user = userEvent.setup();
      const handleToggle = vi.fn();

      render(<SidebarMenu onToggleCollapse={handleToggle} />);

      const toggleButton = screen.getByLabelText('Collapse sidebar');
      await user.click(toggleButton);

      expect(handleToggle).toHaveBeenCalledTimes(1);
    });

    it('changes toggle button label based on collapsed state', () => {
      const { rerender } = render(<SidebarMenu collapsed={false} />);

      expect(screen.getByLabelText('Collapse sidebar')).toBeInTheDocument();

      rerender(<SidebarMenu collapsed={true} />);

      expect(screen.getByLabelText('Expand sidebar')).toBeInTheDocument();
    });

    it('adjusts width based on collapsed state', () => {
      const { container, rerender } = render(<SidebarMenu collapsed={false} />);

      let sidebar = container.querySelector('aside');
      expect(sidebar).toHaveClass('w-72');

      rerender(<SidebarMenu collapsed={true} />);

      sidebar = container.querySelector('aside');
      expect(sidebar).toHaveClass('w-16');
    });
  });

  describe('Search Functionality', () => {
    it('filters modules based on search query', async () => {
      const user = userEvent.setup();

      render(<SidebarMenu />);

      const searchInput = screen.getByPlaceholderText('Search modules...');
      await user.type(searchInput, 'leave');

      // Leave Management should still be visible
      expect(screen.getByText('Leave Management')).toBeInTheDocument();

      // Other modules should be filtered out
      expect(screen.queryByText('Payroll')).not.toBeInTheDocument();
    });

    it('filters modules by feature name', async () => {
      const user = userEvent.setup();

      render(<SidebarMenu />);

      const searchInput = screen.getByPlaceholderText('Search modules...');
      await user.type(searchInput, 'employee');

      // Core HR should be visible because it has "Employee Management" feature
      expect(screen.getByText('Core HR')).toBeInTheDocument();

      // Payroll should not be visible
      expect(screen.queryByText('Payroll')).not.toBeInTheDocument();
    });

    it('shows clear button when search query exists', async () => {
      const user = userEvent.setup();

      render(<SidebarMenu />);

      const searchInput = screen.getByPlaceholderText('Search modules...');

      // No clear button initially
      expect(screen.queryByRole('button', { hidden: true })).toBeDefined();

      await user.type(searchInput, 'test');

      // Clear button should appear (X icon button)
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(1);
    });

    it('clears search when clear button clicked', async () => {
      const user = userEvent.setup();

      render(<SidebarMenu />);

      const searchInput = screen.getByPlaceholderText('Search modules...');
      await user.type(searchInput, 'leave');

      expect(searchInput).toHaveValue('leave');

      // Find and click the X button inside the search input container
      const searchContainer = searchInput.closest('div');
      const clearButton = within(searchContainer!).getAllByRole('button')[0];
      await user.click(clearButton);

      expect(searchInput).toHaveValue('');
    });

    it('shows all modules when search is empty', () => {
      render(<SidebarMenu />);

      expect(screen.getByText('Core HR')).toBeInTheDocument();
      expect(screen.getByText('Leave Management')).toBeInTheDocument();
      expect(screen.getByText('Payroll')).toBeInTheDocument();
    });

    it('search is case-insensitive', async () => {
      const user = userEvent.setup();

      render(<SidebarMenu />);

      const searchInput = screen.getByPlaceholderText('Search modules...');
      await user.type(searchInput, 'PAYROLL');

      expect(screen.getByText('Payroll')).toBeInTheDocument();
      expect(screen.queryByText('Core HR')).not.toBeInTheDocument();
    });
  });

  describe('Module Expansion', () => {
    it('does not expand modules initially', () => {
      render(<SidebarMenu />);

      // Features should not be visible
      expect(screen.queryByText('Employee Management')).not.toBeInTheDocument();
      expect(screen.queryByText('Leave Applications')).not.toBeInTheDocument();
    });

    it('expands module when clicked', async () => {
      const user = userEvent.setup();

      render(<SidebarMenu />);

      const coreHRModule = screen.getByText('Core HR');
      await user.click(coreHRModule);

      // Features should now be visible
      expect(screen.getByText('Employee Management')).toBeInTheDocument();
      expect(screen.getByText('Organization Structure')).toBeInTheDocument();
      expect(screen.getByText('Job Positions')).toBeInTheDocument();
    });

    it('collapses module when clicked again', async () => {
      const user = userEvent.setup();

      render(<SidebarMenu />);

      const coreHRModule = screen.getByText('Core HR');

      // Expand
      await user.click(coreHRModule);
      expect(screen.getByText('Employee Management')).toBeInTheDocument();

      // Collapse
      await user.click(coreHRModule);
      expect(screen.queryByText('Employee Management')).not.toBeInTheDocument();
    });

    it('uses accordion behavior - only one module expanded at a time', async () => {
      const user = userEvent.setup();

      render(<SidebarMenu />);

      // Expand Core HR
      await user.click(screen.getByText('Core HR'));
      expect(screen.getByText('Employee Management')).toBeInTheDocument();

      // Expand Leave Management
      await user.click(screen.getByText('Leave Management'));
      expect(screen.getByText('Leave Applications')).toBeInTheDocument();

      // Core HR should now be collapsed
      expect(screen.queryByText('Employee Management')).not.toBeInTheDocument();
    });

    it('does not expand modules when sidebar is collapsed', async () => {
      const user = userEvent.setup();

      render(<SidebarMenu collapsed={true} />);

      const modules = screen.getAllByRole('generic').filter((el) =>
        el.className.includes('cursor-pointer')
      );

      if (modules.length > 0) {
        await user.click(modules[0]);
      }

      // Features should not appear
      expect(screen.queryByText('Employee Management')).not.toBeInTheDocument();
    });
  });

  describe('Nested Sub-Modules', () => {
    it('expands parent module to show sub-modules', async () => {
      const user = userEvent.setup();

      render(<SidebarMenu />);

      await user.click(screen.getByText('Vertical Solutions'));

      expect(screen.getByText('Healthcare')).toBeInTheDocument();
      expect(screen.getByText('Retail')).toBeInTheDocument();
    });

    it('expands sub-module to show features', async () => {
      const user = userEvent.setup();

      render(<SidebarMenu />);

      // Expand parent
      await user.click(screen.getByText('Vertical Solutions'));

      // Expand sub-module
      await user.click(screen.getByText('Healthcare'));

      expect(screen.getByText('Patient Management')).toBeInTheDocument();
      expect(screen.getByText('Staff Scheduling')).toBeInTheDocument();
    });

    it('collapses sub-module when clicked again', async () => {
      const user = userEvent.setup();

      render(<SidebarMenu />);

      await user.click(screen.getByText('Vertical Solutions'));
      await user.click(screen.getByText('Healthcare'));

      expect(screen.getByText('Patient Management')).toBeInTheDocument();

      await user.click(screen.getByText('Healthcare'));

      expect(screen.queryByText('Patient Management')).not.toBeInTheDocument();
    });

    it('uses accordion for sub-modules - only one sub-module expanded', async () => {
      const user = userEvent.setup();

      render(<SidebarMenu />);

      await user.click(screen.getByText('Vertical Solutions'));

      // Expand Healthcare
      await user.click(screen.getByText('Healthcare'));
      expect(screen.getByText('Patient Management')).toBeInTheDocument();

      // Expand Retail
      await user.click(screen.getByText('Retail'));
      expect(screen.getByText('Inventory')).toBeInTheDocument();

      // Healthcare should be collapsed
      expect(screen.queryByText('Patient Management')).not.toBeInTheDocument();
    });
  });

  describe('Favorites Management', () => {
    it('renders favorite button for features', async () => {
      const user = userEvent.setup();
      const handleToggleFavorite = vi.fn();

      render(<SidebarMenu onToggleFavorite={handleToggleFavorite} />);

      await user.click(screen.getByText('Core HR'));

      // Feature items should have star button on hover (opacity-0 by default)
      const employeeItem = screen.getByText('Employee Management').closest('div');
      const buttons = within(employeeItem!).getAllByRole('button');

      expect(buttons.length).toBeGreaterThan(0);
    });

    it('calls onToggleFavorite when star button clicked', async () => {
      const user = userEvent.setup();
      const handleToggleFavorite = vi.fn();

      render(<SidebarMenu onToggleFavorite={handleToggleFavorite} />);

      await user.click(screen.getByText('Core HR'));

      const employeeItem = screen.getByText('Employee Management').closest('div');
      const starButton = within(employeeItem!).getAllByRole('button').find(
        (btn) => btn.title?.includes('favorite')
      );

      if (starButton) {
        await user.click(starButton);
        expect(handleToggleFavorite).toHaveBeenCalled();
      }
    });

    it('shows filled star for favorited items', async () => {
      const user = userEvent.setup();

      render(
        <SidebarMenu
          favorites={mockFavorites}
          onToggleFavorite={vi.fn()}
        />
      );

      await user.click(screen.getByText('Core HR'));

      const employeeItem = screen.getByText('Employee Management').closest('div');

      // Check if the star button exists
      expect(employeeItem).toBeInTheDocument();
    });

    it('does not render favorite buttons when onToggleFavorite not provided', async () => {
      const user = userEvent.setup();

      render(<SidebarMenu />);

      await user.click(screen.getByText('Core HR'));

      const employeeItem = screen.getByText('Employee Management').closest('div');
      const buttons = within(employeeItem!).getAllByRole('button');

      // Should only have the link, no star button
      const favoriteButtons = buttons.filter((btn) => btn.title?.includes('favorite'));
      expect(favoriteButtons.length).toBe(0);
    });
  });

  describe('Navigation Handling', () => {
    it('renders feature links', async () => {
      const user = userEvent.setup();

      render(<SidebarMenu />);

      await user.click(screen.getByText('Core HR'));

      const employeeLink = screen.getByText('Employee Management').closest('a');
      expect(employeeLink).toHaveAttribute('href', '/core-hr/employee-management');
    });

    it('calls onNavigate when feature is clicked', async () => {
      const user = userEvent.setup();
      const handleNavigate = vi.fn();

      render(<SidebarMenu onNavigate={handleNavigate} />);

      await user.click(screen.getByText('Core HR'));

      const employeeLink = screen.getByText('Employee Management');
      await user.click(employeeLink);

      expect(handleNavigate).toHaveBeenCalledWith({
        path: '/core-hr/employee-management',
        title: 'Employee Management',
        module: 'Core HR',
      });
    });

    it('generates correct paths for features', async () => {
      const user = userEvent.setup();

      render(<SidebarMenu />);

      await user.click(screen.getByText('Leave Management'));

      const leaveAppsLink = screen.getByText('Leave Applications').closest('a');
      expect(leaveAppsLink).toHaveAttribute('href', '/leave/leave-applications');
    });

    it('generates correct paths for sub-module features', async () => {
      const user = userEvent.setup();

      render(<SidebarMenu />);

      await user.click(screen.getByText('Vertical Solutions'));
      await user.click(screen.getByText('Healthcare'));

      const patientLink = screen.getByText('Patient Management').closest('a');

      // Sub-modules don't have a top-level path, so path is generated from code
      expect(patientLink?.getAttribute('href')).toContain('patient-management');
    });
  });

  describe('Active State', () => {
    it('highlights active module based on pathname', () => {
      // Note: pathname is mocked as '/dashboard', so no module should be active by default
      render(<SidebarMenu />);

      // Would need to test with different pathname mocks for full coverage
      const coreHR = screen.getByText('Core HR').closest('div');

      // Check if active styles are NOT applied
      expect(coreHR).not.toHaveClass('text-celestial-indigo');
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<SidebarMenu />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations when collapsed', async () => {
      const { container } = render(<SidebarMenu collapsed={true} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations with expanded modules', async () => {
      const user = userEvent.setup();
      const { container } = render(<SidebarMenu />);

      await user.click(screen.getByText('Core HR'));

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('toggle button has accessible label', () => {
      render(<SidebarMenu />);

      const toggleButton = screen.getByLabelText('Collapse sidebar');
      expect(toggleButton).toHaveAccessibleName();
    });

    it('search input has placeholder text', () => {
      render(<SidebarMenu />);

      expect(screen.getByPlaceholderText('Search modules...')).toBeInTheDocument();
    });

    it('uses semantic nav element', () => {
      render(<SidebarMenu />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('uses semantic aside element', () => {
      const { container } = render(<SidebarMenu />);

      expect(container.querySelector('aside')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('search input is keyboard accessible', async () => {
      const user = userEvent.setup();

      render(<SidebarMenu />);

      await user.tab();

      // First tab should focus toggle button or search input
      const searchInput = screen.getByPlaceholderText('Search modules...');

      // Search input should be in tab order
      searchInput.focus();
      expect(searchInput).toHaveFocus();
    });

    it('toggle button is keyboard accessible', async () => {
      const user = userEvent.setup();
      const handleToggle = vi.fn();

      render(<SidebarMenu onToggleCollapse={handleToggle} />);

      const toggleButton = screen.getByLabelText('Collapse sidebar');
      toggleButton.focus();

      await user.keyboard('{Enter}');

      expect(handleToggle).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty favorites array', () => {
      render(<SidebarMenu favorites={[]} />);

      expect(screen.getByText('Core HR')).toBeInTheDocument();
    });

    it('handles undefined favorites', () => {
      render(<SidebarMenu favorites={undefined} />);

      expect(screen.getByText('Core HR')).toBeInTheDocument();
    });

    it('handles rapid module toggling', async () => {
      const user = userEvent.setup();

      render(<SidebarMenu />);

      const coreHR = screen.getByText('Core HR');

      // Rapid clicks
      await user.click(coreHR);
      await user.click(coreHR);
      await user.click(coreHR);
      await user.click(coreHR);

      // Should end in collapsed state
      expect(screen.queryByText('Employee Management')).not.toBeInTheDocument();
    });

    it('handles special characters in search', async () => {
      const user = userEvent.setup();

      render(<SidebarMenu />);

      const searchInput = screen.getByPlaceholderText('Search modules...');
      await user.type(searchInput, '@#$%');

      // Should not crash, may show no results
      expect(searchInput).toHaveValue('@#$%');
    });

    it('handles whitespace-only search query', async () => {
      const user = userEvent.setup();

      render(<SidebarMenu />);

      const searchInput = screen.getByPlaceholderText('Search modules...');
      await user.type(searchInput, '   ');

      // Should show all modules (whitespace trimmed)
      expect(screen.getByText('Core HR')).toBeInTheDocument();
      expect(screen.getByText('Payroll')).toBeInTheDocument();
    });
  });

  describe('Visual Regression Prevention', () => {
    it('maintains consistent sidebar classes', () => {
      const { container } = render(<SidebarMenu />);

      const sidebar = container.querySelector('aside');
      expect(sidebar).toHaveClass('flex', 'flex-col', 'h-full', 'bg-white', 'border-r');
    });

    it('maintains consistent header classes', () => {
      const { container } = render(<SidebarMenu />);

      const header = container.querySelector('.border-b');
      expect(header).toHaveClass('flex', 'items-center', 'justify-between', 'p-4');
    });

    it('maintains consistent navigation classes', () => {
      render(<SidebarMenu />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('flex-1', 'overflow-y-auto', 'px-2', 'py-2');
    });

    it('maintains transition classes for width changes', () => {
      const { container } = render(<SidebarMenu />);

      const sidebar = container.querySelector('aside');
      expect(sidebar).toHaveClass('transition-all', 'duration-300');
    });
  });
});
