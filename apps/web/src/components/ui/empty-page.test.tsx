/**
 * EmptyPage Component Tests
 * Demonstrates comprehensive testing practices including accessibility
 *
 * @reference docs/testing/COMPONENT-TESTING-GUIDE.md
 * @reference docs/testing/ACCESSIBILITY-TEST-CHECKLIST.md
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyPage } from './empty-page';
import { axe } from '@/__tests__/setupAxe';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock window.history.back
const mockHistoryBack = vi.fn();
Object.defineProperty(window, 'history', {
  value: { back: mockHistoryBack },
  writable: true,
});

describe('EmptyPage', () => {
  beforeEach(() => {
    mockHistoryBack.mockClear();
  });

  describe('Rendering', () => {
    it('renders with default coming-soon variant', () => {
      render(<EmptyPage />);

      expect(screen.getByText('Coming Soon')).toBeInTheDocument();
      expect(
        screen.getByText('This feature is currently under development and will be available soon.')
      ).toBeInTheDocument();
    });

    it('renders under-construction variant', () => {
      render(<EmptyPage variant="under-construction" />);

      expect(screen.getByText('Under Construction')).toBeInTheDocument();
      expect(screen.getByText("We're building something amazing here. Check back later!")).toBeInTheDocument();
    });

    it('renders not-found variant', () => {
      render(<EmptyPage variant="not-found" />);

      expect(screen.getByText('Page Not Found')).toBeInTheDocument();
      expect(
        screen.getByText("The page you're looking for doesn't exist or has been moved.")
      ).toBeInTheDocument();
    });

    it('renders no-access variant', () => {
      render(<EmptyPage variant="no-access" />);

      expect(screen.getByText('Access Restricted')).toBeInTheDocument();
      expect(
        screen.getByText("You don't have permission to access this page. Contact your administrator.")
      ).toBeInTheDocument();
    });

    it('renders empty variant', () => {
      render(<EmptyPage variant="empty" />);

      expect(screen.getByText('Nothing Here Yet')).toBeInTheDocument();
      expect(screen.getByText('This section is empty. Start by adding some content.')).toBeInTheDocument();
    });

    it('renders with custom title and description', () => {
      render(
        <EmptyPage
          title="Custom Title"
          description="Custom description text"
        />
      );

      expect(screen.getByText('Custom Title')).toBeInTheDocument();
      expect(screen.getByText('Custom description text')).toBeInTheDocument();
    });

    it('renders with module prop', () => {
      render(<EmptyPage module="Payroll" />);

      expect(screen.getByText('Payroll Coming Soon')).toBeInTheDocument();
      expect(screen.getByText('The Payroll module is currently under development.')).toBeInTheDocument();
    });

    it('renders planned features list when provided', () => {
      const features = ['Feature 1', 'Feature 2', 'Feature 3'];

      render(<EmptyPage features={features} />);

      expect(screen.getByText('Planned Features:')).toBeInTheDocument();
      expect(screen.getByText('Feature 1')).toBeInTheDocument();
      expect(screen.getByText('Feature 2')).toBeInTheDocument();
      expect(screen.getByText('Feature 3')).toBeInTheDocument();
    });

    it('renders custom children', () => {
      render(
        <EmptyPage>
          <div>Custom content here</div>
        </EmptyPage>
      );

      expect(screen.getByText('Custom content here')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<EmptyPage className="custom-class" />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('custom-class');
    });
  });

  describe('Interactions', () => {
    it('calls window.history.back when back button is clicked', async () => {
      const user = userEvent.setup();

      render(<EmptyPage showBackButton={true} />);

      const backButton = screen.getByRole('button', { name: /go back/i });
      await user.click(backButton);

      expect(mockHistoryBack).toHaveBeenCalledTimes(1);
    });

    it('uses custom back button label', async () => {
      render(<EmptyPage backLabel="Return to Previous Page" />);

      expect(screen.getByRole('button', { name: /return to previous page/i })).toBeInTheDocument();
    });

    it('shows home button by default', () => {
      render(<EmptyPage />);

      const homeLink = screen.getByRole('link', { name: /go to dashboard/i });
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('hides back button when showBackButton is false', () => {
      render(<EmptyPage showBackButton={false} />);

      expect(screen.queryByRole('button', { name: /go back/i })).not.toBeInTheDocument();
    });

    it('hides home button when showHomeButton is false', () => {
      render(<EmptyPage showHomeButton={false} />);

      expect(screen.queryByRole('link', { name: /go to dashboard/i })).not.toBeInTheDocument();
    });
  });

  describe('Conditional Rendering', () => {
    it('does not show features list when features array is empty', () => {
      render(<EmptyPage features={[]} />);

      expect(screen.queryByText('Planned Features:')).not.toBeInTheDocument();
    });

    it('does not show features list when features is undefined', () => {
      render(<EmptyPage />);

      expect(screen.queryByText('Planned Features:')).not.toBeInTheDocument();
    });

    it('shows both back and home buttons by default', () => {
      render(<EmptyPage />);

      expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /go to dashboard/i })).toBeInTheDocument();
    });

    it('can show only back button', () => {
      render(<EmptyPage showHomeButton={false} />);

      expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /go to dashboard/i })).not.toBeInTheDocument();
    });

    it('can show only home button', () => {
      render(<EmptyPage showBackButton={false} />);

      expect(screen.queryByRole('button', { name: /go back/i })).not.toBeInTheDocument();
      expect(screen.getByRole('link', { name: /go to dashboard/i })).toBeInTheDocument();
    });

    it('can show neither button', () => {
      render(<EmptyPage showBackButton={false} showHomeButton={false} />);

      expect(screen.queryByRole('button', { name: /go back/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /go to dashboard/i })).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations - coming-soon variant', async () => {
      const { container } = render(<EmptyPage variant="coming-soon" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations - under-construction variant', async () => {
      const { container } = render(<EmptyPage variant="under-construction" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations - not-found variant', async () => {
      const { container } = render(<EmptyPage variant="not-found" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations - with features', async () => {
      const { container } = render(
        <EmptyPage features={['Feature 1', 'Feature 2', 'Feature 3']} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations - with custom content', async () => {
      const { container } = render(
        <EmptyPage>
          <div>
            <h2>Custom Heading</h2>
            <p>Custom paragraph</p>
          </div>
        </EmptyPage>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('uses semantic heading for title (h1)', () => {
      render(<EmptyPage title="Test Title" />);

      const heading = screen.getByRole('heading', { level: 1, name: /test title/i });
      expect(heading).toBeInTheDocument();
    });

    it('uses semantic heading for features section (h3)', () => {
      render(<EmptyPage features={['Feature 1']} />);

      const heading = screen.getByRole('heading', { level: 3, name: /planned features/i });
      expect(heading).toBeInTheDocument();
    });

    it('back button has accessible name', () => {
      render(<EmptyPage />);

      const button = screen.getByRole('button', { name: /go back/i });
      expect(button).toHaveAccessibleName();
    });

    it('home link has accessible name', () => {
      render(<EmptyPage />);

      const link = screen.getByRole('link', { name: /go to dashboard/i });
      expect(link).toHaveAccessibleName();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string title', () => {
      render(<EmptyPage title="" />);

      // Should fall back to variant's default title
      expect(screen.getByText('Coming Soon')).toBeInTheDocument();
    });

    it('handles empty string description', () => {
      render(<EmptyPage description="" />);

      // Should show empty description (no fallback)
      expect(screen.queryByText('This feature is currently under development')).not.toBeInTheDocument();
    });

    it('handles very long feature list', () => {
      const manyFeatures = Array.from({ length: 20 }, (_, i) => `Feature ${i + 1}`);

      render(<EmptyPage features={manyFeatures} />);

      expect(screen.getByText('Feature 1')).toBeInTheDocument();
      expect(screen.getByText('Feature 20')).toBeInTheDocument();
    });

    it('handles special characters in title', () => {
      const specialTitle = 'Title with <special> & "characters"';

      render(<EmptyPage title={specialTitle} />);

      expect(screen.getByText(specialTitle)).toBeInTheDocument();
    });
  });

  describe('Visual Regression Prevention', () => {
    it('maintains consistent structure across variants', () => {
      const variants = ['coming-soon', 'under-construction', 'not-found', 'no-access', 'empty'] as const;

      variants.forEach(variant => {
        const { container, unmount } = render(<EmptyPage variant={variant} />);

        // All variants should have the same structure
        expect(container.querySelector('h1')).toBeInTheDocument();
        expect(container.querySelector('p')).toBeInTheDocument();

        unmount();
      });
    });

    it('renders platform badge consistently', () => {
      render(<EmptyPage />);

      expect(screen.getByText(/AURA HCM Platform/i)).toBeInTheDocument();
      expect(screen.getByText(/394 Features/i)).toBeInTheDocument();
    });
  });
});
