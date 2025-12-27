/**
 * ModulePage Component Tests - Production Ready
 * Comprehensive test coverage for the generic module page wrapper
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ModulePage } from './module-page';
import type { MenuIconName } from '@aura/types';

// Mock the EmptyPage component
vi.mock('./empty-page', () => ({
  EmptyPage: ({ variant, title, description, showBackButton, showHomeButton, children }: any) => (
    <div data-testid="empty-page">
      <div data-testid="empty-variant">{variant}</div>
      <h2 data-testid="empty-title">{title}</h2>
      <p data-testid="empty-description">{description}</p>
      <div data-testid="empty-back-button">{showBackButton ? 'true' : 'false'}</div>
      <div data-testid="empty-home-button">{showHomeButton ? 'true' : 'false'}</div>
      <div data-testid="empty-children">{children}</div>
    </div>
  ),
}));

// Mock the getMenuIcon function
const mockIcons = {
  Users: ({ className }: { className?: string }) => (
    <div data-testid="users-icon" className={className}>UsersIcon</div>
  ),
  Calendar: ({ className }: { className?: string }) => (
    <div data-testid="calendar-icon" className={className}>CalendarIcon</div>
  ),
  DollarSign: ({ className }: { className?: string }) => (
    <div data-testid="dollar-icon" className={className}>DollarIcon</div>
  ),
};

vi.mock('@aura/ui/components/menu', () => ({
  getMenuIcon: (iconName: MenuIconName) => mockIcons[iconName as keyof typeof mockIcons] || (() => null),
}));

describe('ModulePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ========================================================================
  // RENDERING
  // ========================================================================

  describe('Rendering', () => {
    it('renders with minimum required props', () => {
      render(
        <ModulePage
          moduleCode="CORE_HR"
          moduleName="Core HR"
        />
      );

      expect(screen.getByText('Core HR')).toBeInTheDocument();
      expect(screen.getByTestId('empty-page')).toBeInTheDocument();
    });

    it('renders with all props provided', () => {
      render(
        <ModulePage
          moduleCode="CORE_HR"
          moduleName="Core HR"
          moduleIcon="Users"
          featureName="Employee Database"
          featureCount={12}
          isImplemented={false}
          className="custom-class"
        />
      );

      expect(screen.getByText('Employee Database')).toBeInTheDocument();
      expect(screen.getByText('Core HR')).toBeInTheDocument();
      expect(screen.getByText('12 features in this module')).toBeInTheDocument();
    });

    it('renders icon when moduleIcon is provided', () => {
      render(
        <ModulePage
          moduleCode="CORE_HR"
          moduleName="Core HR"
          moduleIcon="Users"
        />
      );

      expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    });

    it('does not render icon when moduleIcon is not provided', () => {
      render(
        <ModulePage
          moduleCode="CORE_HR"
          moduleName="Core HR"
        />
      );

      expect(screen.queryByTestId('users-icon')).not.toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <ModulePage
          moduleCode="CORE_HR"
          moduleName="Core HR"
          className="my-custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('my-custom-class');
    });
  });

  // ========================================================================
  // NOT IMPLEMENTED STATE
  // ========================================================================

  describe('Not Implemented State (isImplemented=false)', () => {
    it('renders EmptyPage component when not implemented', () => {
      render(
        <ModulePage
          moduleCode="CORE_HR"
          moduleName="Core HR"
          isImplemented={false}
        />
      );

      expect(screen.getByTestId('empty-page')).toBeInTheDocument();
    });

    it('passes correct variant to EmptyPage', () => {
      render(
        <ModulePage
          moduleCode="CORE_HR"
          moduleName="Core HR"
          isImplemented={false}
        />
      );

      expect(screen.getByTestId('empty-variant')).toHaveTextContent('coming-soon');
    });

    it('passes correct title to EmptyPage with module name', () => {
      render(
        <ModulePage
          moduleCode="CORE_HR"
          moduleName="Core HR"
          isImplemented={false}
        />
      );

      expect(screen.getByTestId('empty-title')).toHaveTextContent('Core HR Coming Soon');
    });

    it('passes correct title to EmptyPage with feature name', () => {
      render(
        <ModulePage
          moduleCode="CORE_HR"
          moduleName="Core HR"
          featureName="Employee Database"
          isImplemented={false}
        />
      );

      expect(screen.getByTestId('empty-title')).toHaveTextContent('Employee Database Coming Soon');
    });

    it('passes correct description to EmptyPage', () => {
      render(
        <ModulePage
          moduleCode="CORE_HR"
          moduleName="Core HR"
          featureName="Employee Database"
          isImplemented={false}
        />
      );

      expect(screen.getByTestId('empty-description')).toHaveTextContent(
        'The Employee Database feature is currently under development'
      );
    });

    it('enables back button in EmptyPage', () => {
      render(
        <ModulePage
          moduleCode="CORE_HR"
          moduleName="Core HR"
          isImplemented={false}
        />
      );

      expect(screen.getByTestId('empty-back-button')).toHaveTextContent('true');
    });

    it('enables home button in EmptyPage', () => {
      render(
        <ModulePage
          moduleCode="CORE_HR"
          moduleName="Core HR"
          isImplemented={false}
        />
      );

      expect(screen.getByTestId('empty-home-button')).toHaveTextContent('true');
    });

    it('renders progress indicator when not implemented', () => {
      render(
        <ModulePage
          moduleCode="CORE_HR"
          moduleName="Core HR"
          isImplemented={false}
        />
      );

      expect(screen.getByText('Development Progress')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('displays header with icon in not implemented state', () => {
      render(
        <ModulePage
          moduleCode="PAYROLL"
          moduleName="Payroll Management"
          moduleIcon="DollarSign"
          isImplemented={false}
        />
      );

      expect(screen.getByTestId('dollar-icon')).toBeInTheDocument();
      expect(screen.getByText('Payroll Management')).toBeInTheDocument();
    });

    it('shows feature count when provided in not implemented state', () => {
      render(
        <ModulePage
          moduleCode="CORE_HR"
          moduleName="Core HR"
          featureCount={25}
          isImplemented={false}
        />
      );

      expect(screen.getByText('25 features in this module')).toBeInTheDocument();
    });

    it('does not show feature count when not provided', () => {
      render(
        <ModulePage
          moduleCode="CORE_HR"
          moduleName="Core HR"
          isImplemented={false}
        />
      );

      expect(screen.queryByText(/features in this module/)).not.toBeInTheDocument();
    });
  });

  // ========================================================================
  // IMPLEMENTED STATE
  // ========================================================================

  describe('Implemented State (isImplemented=true)', () => {
    it('renders children when implemented', () => {
      render(
        <ModulePage
          moduleCode="CORE_HR"
          moduleName="Core HR"
          isImplemented={true}
        >
          <div data-testid="custom-content">Custom Module Content</div>
        </ModulePage>
      );

      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
      expect(screen.getByText('Custom Module Content')).toBeInTheDocument();
    });

    it('does not render EmptyPage when implemented', () => {
      render(
        <ModulePage
          moduleCode="CORE_HR"
          moduleName="Core HR"
          isImplemented={true}
        >
          <div>Content</div>
        </ModulePage>
      );

      expect(screen.queryByTestId('empty-page')).not.toBeInTheDocument();
    });

    it('renders header with module name when implemented', () => {
      render(
        <ModulePage
          moduleCode="CORE_HR"
          moduleName="Core HR"
          isImplemented={true}
        >
          <div>Content</div>
        </ModulePage>
      );

      expect(screen.getByText('Core HR')).toBeInTheDocument();
    });

    it('renders header with feature name when provided', () => {
      render(
        <ModulePage
          moduleCode="CORE_HR"
          moduleName="Core HR"
          featureName="Employee Database"
          isImplemented={true}
        >
          <div>Content</div>
        </ModulePage>
      );

      expect(screen.getByText('Employee Database')).toBeInTheDocument();
      expect(screen.getByText('Core HR')).toBeInTheDocument();
    });

    it('renders icon when implemented', () => {
      render(
        <ModulePage
          moduleCode="ATTENDANCE"
          moduleName="Attendance"
          moduleIcon="Calendar"
          isImplemented={true}
        >
          <div>Content</div>
        </ModulePage>
      );

      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
    });

    it('does not render feature count when implemented', () => {
      render(
        <ModulePage
          moduleCode="CORE_HR"
          moduleName="Core HR"
          featureCount={25}
          isImplemented={true}
        >
          <div>Content</div>
        </ModulePage>
      );

      expect(screen.queryByText('25 features in this module')).not.toBeInTheDocument();
    });

    it('renders complex children structure', () => {
      render(
        <ModulePage
          moduleCode="CORE_HR"
          moduleName="Core HR"
          isImplemented={true}
        >
          <div>
            <h2>Section Title</h2>
            <p>Paragraph content</p>
            <button>Action Button</button>
          </div>
        </ModulePage>
      );

      expect(screen.getByText('Section Title')).toBeInTheDocument();
      expect(screen.getByText('Paragraph content')).toBeInTheDocument();
      expect(screen.getByText('Action Button')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // HEADER RENDERING
  // ========================================================================

  describe('Header Rendering', () => {
    it('renders module name as main title when no feature name', () => {
      render(
        <ModulePage
          moduleCode="CORE_HR"
          moduleName="Core HR"
        />
      );

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Core HR');
    });

    it('renders feature name as main title when provided', () => {
      render(
        <ModulePage
          moduleCode="CORE_HR"
          moduleName="Core HR"
          featureName="Employee Database"
        />
      );

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Employee Database');
    });

    it('renders module name as subtitle when feature name is provided', () => {
      render(
        <ModulePage
          moduleCode="CORE_HR"
          moduleName="Core HR"
          featureName="Employee Database"
        />
      );

      // Module name should appear as subtitle (not in h1)
      const allCoreHR = screen.getAllByText('Core HR');
      const subtitle = allCoreHR.find(el => el.tagName !== 'H1');
      expect(subtitle).toBeInTheDocument();
      expect(subtitle).toHaveClass('text-sm');
    });

    it('applies correct styling to header elements', () => {
      const { container } = render(
        <ModulePage
          moduleCode="CORE_HR"
          moduleName="Core HR"
          moduleIcon="Users"
        />
      );

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('text-2xl', 'font-display', 'font-bold');
    });
  });

  // ========================================================================
  // EDGE CASES
  // ========================================================================

  describe('Edge Cases', () => {
    it('handles empty string for module name', () => {
      render(
        <ModulePage
          moduleCode="CORE_HR"
          moduleName=""
        />
      );

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('');
    });

    it('handles special characters in module name', () => {
      render(
        <ModulePage
          moduleCode="CORE_HR"
          moduleName="Core HR & Employee Management"
        />
      );

      expect(screen.getByText('Core HR & Employee Management')).toBeInTheDocument();
    });

    it('handles very long module names', () => {
      const longName = 'A'.repeat(100);
      render(
        <ModulePage
          moduleCode="CORE_HR"
          moduleName={longName}
        />
      );

      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it('handles zero feature count', () => {
      render(
        <ModulePage
          moduleCode="CORE_HR"
          moduleName="Core HR"
          featureCount={0}
        />
      );

      expect(screen.getByText('0 features in this module')).toBeInTheDocument();
    });

    it('handles large feature count', () => {
      render(
        <ModulePage
          moduleCode="CORE_HR"
          moduleName="Core HR"
          featureCount={999}
        />
      );

      expect(screen.getByText('999 features in this module')).toBeInTheDocument();
    });

    it('handles undefined children gracefully', () => {
      render(
        <ModulePage
          moduleCode="CORE_HR"
          moduleName="Core HR"
          isImplemented={true}
        />
      );

      expect(screen.getByText('Core HR')).toBeInTheDocument();
    });

    it('renders null children without errors', () => {
      render(
        <ModulePage
          moduleCode="CORE_HR"
          moduleName="Core HR"
          isImplemented={true}
        >
          {null}
        </ModulePage>
      );

      expect(screen.getByText('Core HR')).toBeInTheDocument();
    });

    it('handles invalid icon name gracefully', () => {
      render(
        <ModulePage
          moduleCode="CORE_HR"
          moduleName="Core HR"
          moduleIcon={'InvalidIcon' as MenuIconName}
        />
      );

      expect(screen.getByText('Core HR')).toBeInTheDocument();
    });
  });

  // ========================================================================
  // INTEGRATION
  // ========================================================================

  describe('Integration', () => {
    it('works correctly with all props in not implemented state', () => {
      render(
        <ModulePage
          moduleCode="CORE_HR"
          moduleName="Core HR"
          moduleIcon="Users"
          featureName="Employee Database"
          featureCount={12}
          isImplemented={false}
          className="test-class"
        />
      );

      expect(screen.getByTestId('users-icon')).toBeInTheDocument();
      expect(screen.getByText('Employee Database')).toBeInTheDocument();
      expect(screen.getByText('Core HR')).toBeInTheDocument();
      expect(screen.getByText('12 features in this module')).toBeInTheDocument();
      expect(screen.getByTestId('empty-page')).toBeInTheDocument();
    });

    it('works correctly with all props in implemented state', () => {
      render(
        <ModulePage
          moduleCode="CORE_HR"
          moduleName="Core HR"
          moduleIcon="Users"
          featureName="Employee Database"
          featureCount={12}
          isImplemented={true}
          className="test-class"
        >
          <div data-testid="content">Test Content</div>
        </ModulePage>
      );

      expect(screen.getByTestId('users-icon')).toBeInTheDocument();
      expect(screen.getByText('Employee Database')).toBeInTheDocument();
      expect(screen.getByText('Core HR')).toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();
      expect(screen.queryByTestId('empty-page')).not.toBeInTheDocument();
    });

    it('switches between implemented and not implemented states', () => {
      const { rerender } = render(
        <ModulePage
          moduleCode="CORE_HR"
          moduleName="Core HR"
          isImplemented={false}
        />
      );

      expect(screen.getByTestId('empty-page')).toBeInTheDocument();

      rerender(
        <ModulePage
          moduleCode="CORE_HR"
          moduleName="Core HR"
          isImplemented={true}
        >
          <div data-testid="content">Content</div>
        </ModulePage>
      );

      expect(screen.queryByTestId('empty-page')).not.toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });
});
