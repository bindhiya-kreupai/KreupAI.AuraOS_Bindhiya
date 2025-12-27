/**
 * PageHeader Component Tests - Production Ready
 * Comprehensive test coverage for the page header component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PageHeader } from './page-header';
import { Plus, Download } from 'lucide-react';

describe('PageHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ========================================================================
  // RENDERING
  // ========================================================================

  describe('Rendering', () => {
    it('renders with minimum required props', () => {
      render(<PageHeader title="Test Page" />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Page');
    });

    it('renders title correctly', () => {
      render(<PageHeader title="Employee Management" />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Employee Management');
    });

    it('applies correct styling to title', () => {
      render(<PageHeader title="Test Page" />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('text-2xl', 'font-bold');
    });

    it('renders without breadcrumbs when not provided', () => {
      render(<PageHeader title="Test Page" />);

      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });

    it('renders without action button when not provided', () => {
      render(<PageHeader title="Test Page" />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <PageHeader title="Test Page" className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  // ========================================================================
  // BREADCRUMBS
  // ========================================================================

  describe('Breadcrumbs', () => {
    it('renders breadcrumbs when provided', () => {
      const breadcrumbs = [
        { label: 'Home', href: '/' },
        { label: 'HR', href: '/hr' },
        { label: 'Employees' },
      ];

      render(<PageHeader title="Test Page" breadcrumbs={breadcrumbs} />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('HR')).toBeInTheDocument();
      expect(screen.getByText('Employees')).toBeInTheDocument();
    });

    it('renders single breadcrumb', () => {
      const breadcrumbs = [{ label: 'Home' }];

      render(<PageHeader title="Test Page" breadcrumbs={breadcrumbs} />);

      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('renders separators between breadcrumbs', () => {
      const breadcrumbs = [
        { label: 'Home' },
        { label: 'HR' },
        { label: 'Employees' },
      ];

      const { container } = render(
        <PageHeader title="Test Page" breadcrumbs={breadcrumbs} />
      );

      // ChevronRight icons are used as separators
      const svgs = container.querySelectorAll('svg');
      // Should have 2 separators for 3 breadcrumbs
      expect(svgs.length).toBeGreaterThanOrEqual(2);
    });

    it('applies different styling to last breadcrumb', () => {
      const breadcrumbs = [
        { label: 'Home', href: '/' },
        { label: 'Employees' },
      ];

      render(<PageHeader title="Test Page" breadcrumbs={breadcrumbs} />);

      const home = screen.getByText('Home');
      const employees = screen.getByText('Employees');

      // Last item should have different classes
      expect(employees.className).toContain('font-medium');
    });

    it('renders with empty breadcrumbs array', () => {
      render(<PageHeader title="Test Page" breadcrumbs={[]} />);

      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });

    it('handles breadcrumbs with special characters', () => {
      const breadcrumbs = [
        { label: 'Home & Dashboard' },
        { label: 'HR > People' },
      ];

      render(<PageHeader title="Test Page" breadcrumbs={breadcrumbs} />);

      expect(screen.getByText('Home & Dashboard')).toBeInTheDocument();
      expect(screen.getByText('HR > People')).toBeInTheDocument();
    });

    it('handles very long breadcrumb labels', () => {
      const longLabel = 'A'.repeat(100);
      const breadcrumbs = [{ label: longLabel }];

      render(<PageHeader title="Test Page" breadcrumbs={breadcrumbs} />);

      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });
  });

  // ========================================================================
  // ACTION BUTTON
  // ========================================================================

  describe('Action Button', () => {
    it('renders action button when provided', () => {
      const action = {
        label: 'Add Employee',
        onClick: vi.fn(),
      };

      render(<PageHeader title="Test Page" action={action} />);

      expect(screen.getByRole('button')).toHaveTextContent('Add Employee');
    });

    it('calls onClick when action button is clicked', () => {
      const onClick = vi.fn();
      const action = {
        label: 'Add Employee',
        onClick,
      };

      render(<PageHeader title="Test Page" action={action} />);

      fireEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('renders default Plus icon when no custom icon provided', () => {
      const action = {
        label: 'Add Employee',
        onClick: vi.fn(),
      };

      const { container } = render(<PageHeader title="Test Page" action={action} />);

      // Plus icon should be rendered
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders custom icon when provided', () => {
      const action = {
        label: 'Download',
        onClick: vi.fn(),
        icon: Download,
      };

      render(<PageHeader title="Test Page" action={action} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('applies correct styling to action button', () => {
      const action = {
        label: 'Add Employee',
        onClick: vi.fn(),
      };

      render(<PageHeader title="Test Page" action={action} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-celestial-indigo');
      expect(button).toHaveClass('text-white');
      expect(button).toHaveClass('rounded-lg');
    });

    it('handles multiple rapid clicks', () => {
      const onClick = vi.fn();
      const action = {
        label: 'Add Employee',
        onClick,
      };

      render(<PageHeader title="Test Page" action={action} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(onClick).toHaveBeenCalledTimes(3);
    });

    it('renders button with very long label', () => {
      const longLabel = 'A'.repeat(100);
      const action = {
        label: longLabel,
        onClick: vi.fn(),
      };

      render(<PageHeader title="Test Page" action={action} />);

      expect(screen.getByRole('button')).toHaveTextContent(longLabel);
    });
  });

  // ========================================================================
  // LAYOUT
  // ========================================================================

  describe('Layout', () => {
    it('renders title and action in same row', () => {
      const action = {
        label: 'Add',
        onClick: vi.fn(),
      };

      const { container } = render(
        <PageHeader title="Test Page" action={action} />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex', 'items-center', 'justify-between');
    });

    it('positions breadcrumbs above title', () => {
      const breadcrumbs = [{ label: 'Home' }, { label: 'Page' }];

      render(<PageHeader title="Test Page" breadcrumbs={breadcrumbs} />);

      const nav = screen.getByRole('navigation');
      const heading = screen.getByRole('heading');

      // Navigation should come before heading in DOM
      expect(nav.compareDocumentPosition(heading)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      );
    });

    it('applies margin bottom to wrapper', () => {
      const { container } = render(<PageHeader title="Test Page" />);

      expect(container.firstChild).toHaveClass('mb-6');
    });
  });

  // ========================================================================
  // INTEGRATION
  // ========================================================================

  describe('Integration', () => {
    it('renders with all props provided', () => {
      const breadcrumbs = [
        { label: 'Home', href: '/' },
        { label: 'HR', href: '/hr' },
        { label: 'Employees' },
      ];

      const action = {
        label: 'Add Employee',
        onClick: vi.fn(),
        icon: Plus,
      };

      render(
        <PageHeader
          title="Employee Management"
          breadcrumbs={breadcrumbs}
          action={action}
          className="custom-wrapper"
        />
      );

      expect(screen.getByRole('heading')).toHaveTextContent('Employee Management');
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('HR')).toBeInTheDocument();
      expect(screen.getByText('Employees')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveTextContent('Add Employee');
    });

    it('works with complex breadcrumb structure', () => {
      const breadcrumbs = [
        { label: 'Dashboard', href: '/' },
        { label: 'Human Resources', href: '/hr' },
        { label: 'Core HR', href: '/hr/core' },
        { label: 'Employee Database', href: '/hr/core/employees' },
        { label: 'Profile View' },
      ];

      render(<PageHeader title="John Doe" breadcrumbs={breadcrumbs} />);

      breadcrumbs.forEach((bc) => {
        expect(screen.getByText(bc.label)).toBeInTheDocument();
      });
    });

    it('handles action click with breadcrumbs present', () => {
      const onClick = vi.fn();
      const breadcrumbs = [{ label: 'Home' }, { label: 'Page' }];
      const action = { label: 'Add', onClick };

      render(
        <PageHeader title="Test Page" breadcrumbs={breadcrumbs} action={action} />
      );

      fireEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  // ========================================================================
  // EDGE CASES
  // ========================================================================

  describe('Edge Cases', () => {
    it('handles empty string title', () => {
      render(<PageHeader title="" />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('');
    });

    it('handles title with special characters', () => {
      render(<PageHeader title="Employee & Contractor Management <Test>" />);

      expect(screen.getByRole('heading')).toHaveTextContent(
        'Employee & Contractor Management <Test>'
      );
    });

    it('handles very long title', () => {
      const longTitle = 'A'.repeat(200);
      render(<PageHeader title={longTitle} />);

      expect(screen.getByRole('heading')).toHaveTextContent(longTitle);
    });

    it('handles breadcrumb without href', () => {
      const breadcrumbs = [{ label: 'Home' }];

      render(<PageHeader title="Test Page" breadcrumbs={breadcrumbs} />);

      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('handles action with empty label', () => {
      const action = { label: '', onClick: vi.fn() };

      render(<PageHeader title="Test Page" action={action} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('handles null className', () => {
      render(<PageHeader title="Test Page" className={undefined} />);

      expect(screen.getByRole('heading')).toBeInTheDocument();
    });

    it('renders correctly with only breadcrumbs', () => {
      const breadcrumbs = [{ label: 'Home' }, { label: 'Page' }];

      render(<PageHeader title="Test" breadcrumbs={breadcrumbs} />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('heading')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('renders correctly with only action', () => {
      const action = { label: 'Add', onClick: vi.fn() };

      render(<PageHeader title="Test" action={action} />);

      expect(screen.getByRole('heading')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });
  });

  // ========================================================================
  // ACCESSIBILITY
  // ========================================================================

  describe('Accessibility', () => {
    it('uses semantic heading element', () => {
      render(<PageHeader title="Test Page" />);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('uses semantic nav element for breadcrumbs', () => {
      const breadcrumbs = [{ label: 'Home' }, { label: 'Page' }];

      render(<PageHeader title="Test Page" breadcrumbs={breadcrumbs} />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('button is keyboard accessible', () => {
      const onClick = vi.fn();
      const action = { label: 'Add', onClick };

      render(<PageHeader title="Test Page" action={action} />);

      const button = screen.getByRole('button');
      button.focus();
      expect(document.activeElement).toBe(button);
    });

    it('maintains proper heading hierarchy', () => {
      const breadcrumbs = [{ label: 'Home' }];

      render(<PageHeader title="Main Page" breadcrumbs={breadcrumbs} />);

      const headings = screen.getAllByRole('heading');
      expect(headings).toHaveLength(1);
      expect(headings[0].tagName).toBe('H1');
    });
  });
});
