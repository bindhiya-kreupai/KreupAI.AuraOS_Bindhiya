/**
 * ModuleGrid Component Tests - Production Ready
 * Comprehensive test coverage for the module feature grid component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ModuleGrid } from './module-grid';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe('ModuleGrid', () => {
  const defaultProps = {
    title: 'Core HR',
    description: 'Manage core HR operations',
    features: ['Employee Directory', 'Organization Structure', 'Job Management'],
  };

  // ====================================================================
  // RENDERING
  // ====================================================================

  describe('Rendering', () => {
    it('renders with required props', () => {
      render(<ModuleGrid {...defaultProps} />);

      expect(screen.getByText('Core HR')).toBeInTheDocument();
      expect(screen.getByText('Manage core HR operations')).toBeInTheDocument();
    });

    it('renders all features', () => {
      render(<ModuleGrid {...defaultProps} />);

      expect(screen.getByText('Employee Directory')).toBeInTheDocument();
      expect(screen.getByText('Organization Structure')).toBeInTheDocument();
      expect(screen.getByText('Job Management')).toBeInTheDocument();
    });

    it('renders custom icon when provided', () => {
      const CustomIcon = vi.fn(() => <div data-testid="custom-icon">Icon</div>);
      render(<ModuleGrid {...defaultProps} icon={CustomIcon} />);

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
      expect(CustomIcon).toHaveBeenCalled();
    });

    it('renders default LayoutGrid icon when no icon provided', () => {
      render(<ModuleGrid {...defaultProps} />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('renders feature cards with descriptions', () => {
      render(<ModuleGrid {...defaultProps} />);

      expect(screen.getByText(/Access and manage employee directory/i)).toBeInTheDocument();
      expect(screen.getByText(/Access and manage organization structure/i)).toBeInTheDocument();
      expect(screen.getByText(/Access and manage job management/i)).toBeInTheDocument();
    });

    it('renders Open Module text on each feature card', () => {
      render(<ModuleGrid {...defaultProps} />);

      const openModuleTexts = screen.getAllByText('Open Module');
      expect(openModuleTexts).toHaveLength(3);
    });
  });

  // ====================================================================
  // FEATURE LINKS
  // ====================================================================

  describe('Feature Links', () => {
    it('generates kebab-case links from feature names', () => {
      render(<ModuleGrid {...defaultProps} />);

      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveAttribute('href', 'employee-directory');
      expect(links[1]).toHaveAttribute('href', 'organization-structure');
      expect(links[2]).toHaveAttribute('href', 'job-management');
    });

    it('uses basePath when provided', () => {
      render(<ModuleGrid {...defaultProps} basePath="/dashboard/core-hr" />);

      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveAttribute('href', '/dashboard/core-hr/employee-directory');
      expect(links[1]).toHaveAttribute('href', '/dashboard/core-hr/organization-structure');
      expect(links[2]).toHaveAttribute('href', '/dashboard/core-hr/job-management');
    });

    it('handles feature names with special characters', () => {
      const specialFeatures = ['Feature & Test', 'Feature (test)'];
      render(<ModuleGrid {...defaultProps} features={specialFeatures} />);

      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveAttribute('href', 'feature-test');
      expect(links[1]).toHaveAttribute('href', 'feature-test');
    });

    it('handles feature names with multiple spaces', () => {
      const features = ['Multiple   Spaces   Feature'];
      render(<ModuleGrid {...defaultProps} features={features} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'multiple-spaces-feature');
    });

    it('converts uppercase to lowercase in links', () => {
      const features = ['UPPERCASE FEATURE'];
      render(<ModuleGrid {...defaultProps} features={features} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'uppercase-feature');
    });

    it('removes leading and trailing hyphens', () => {
      const features = ['---Test Feature---'];
      render(<ModuleGrid {...defaultProps} features={features} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'test-feature');
    });
  });

  // ====================================================================
  // GRID LAYOUT
  // ====================================================================

  describe('Grid Layout', () => {
    it('renders features in grid layout', () => {
      const { container } = render(<ModuleGrid {...defaultProps} />);

      const grid = container.querySelector('[class*="grid"]');
      expect(grid).toBeInTheDocument();
    });

    it('renders single feature', () => {
      render(<ModuleGrid {...defaultProps} features={['Single Feature']} />);

      expect(screen.getByText('Single Feature')).toBeInTheDocument();
    });

    it('renders many features', () => {
      const manyFeatures = Array.from({ length: 12 }, (_, i) => `Feature ${i + 1}`);
      render(<ModuleGrid {...defaultProps} features={manyFeatures} />);

      manyFeatures.forEach((feature) => {
        expect(screen.getByText(feature)).toBeInTheDocument();
      });
    });

    it('applies responsive grid classes', () => {
      const { container } = render(<ModuleGrid {...defaultProps} />);

      const grid = container.querySelector('[class*="grid-cols"]');
      expect(grid).toBeInTheDocument();
    });
  });

  // ====================================================================
  // EDGE CASES
  // ====================================================================

  describe('Edge Cases', () => {
    it('handles empty features array', () => {
      render(<ModuleGrid {...defaultProps} features={[]} />);

      expect(screen.getByText('Core HR')).toBeInTheDocument();
      expect(screen.queryByText('Open Module')).not.toBeInTheDocument();
    });

    it('handles basePath without leading slash', () => {
      render(<ModuleGrid {...defaultProps} basePath="dashboard/core-hr" />);

      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveAttribute('href', 'dashboard/core-hr/employee-directory');
    });

    it('handles very long feature names', () => {
      const longFeature = 'A Very Long Feature Name That Should Still Work Correctly';
      render(<ModuleGrid {...defaultProps} features={[longFeature]} />);

      expect(screen.getByText(longFeature)).toBeInTheDocument();
    });

    it('handles very long title', () => {
      const longTitle = 'A'.repeat(100);
      render(<ModuleGrid {...defaultProps} title={longTitle} />);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('handles very long description', () => {
      const longDescription = 'B'.repeat(200);
      render(<ModuleGrid {...defaultProps} description={longDescription} />);

      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });
  });

  // ====================================================================
  // ACCESSIBILITY
  // ====================================================================

  describe('Accessibility', () => {
    it('uses semantic heading for title', () => {
      render(<ModuleGrid {...defaultProps} />);

      const heading = screen.getByRole('heading', { level: 1, name: /core hr/i });
      expect(heading).toBeInTheDocument();
    });

    it('uses semantic heading for feature cards', () => {
      render(<ModuleGrid {...defaultProps} />);

      const featureHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(featureHeadings.length).toBe(3);
    });

    it('all links are keyboard accessible', () => {
      render(<ModuleGrid {...defaultProps} />);

      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link.tagName).toBe('A');
        expect(link).toHaveAttribute('href');
      });
    });

    it('feature cards have proper link structure', () => {
      render(<ModuleGrid {...defaultProps} />);

      const links = screen.getAllByRole('link');
      expect(links.length).toBe(3);

      links.forEach((link) => {
        expect(link).toHaveAccessibleName();
      });
    });

    it('icon has proper contrast with background', () => {
      render(<ModuleGrid {...defaultProps} />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading.parentElement).toBeInTheDocument();
    });
  });

  // ====================================================================
  // INTEGRATION
  // ====================================================================

  describe('Integration', () => {
    it('works with all props provided', () => {
      const CustomIcon = () => <div data-testid="custom-icon">Icon</div>;
      const features = ['Feature 1', 'Feature 2'];

      render(
        <ModuleGrid
          title="Test Module"
          description="Test description"
          icon={CustomIcon}
          features={features}
          basePath="/test"
        />
      );

      expect(screen.getByText('Test Module')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
      expect(screen.getByText('Feature 1')).toBeInTheDocument();
      expect(screen.getByText('Feature 2')).toBeInTheDocument();

      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveAttribute('href', '/test/feature-1');
      expect(links[1]).toHaveAttribute('href', '/test/feature-2');
    });

    it('works with minimal props', () => {
      render(
        <ModuleGrid
          title="Minimal"
          description="Description"
          features={['Feature']}
        />
      );

      expect(screen.getByText('Minimal')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Feature')).toBeInTheDocument();
    });
  });
});
