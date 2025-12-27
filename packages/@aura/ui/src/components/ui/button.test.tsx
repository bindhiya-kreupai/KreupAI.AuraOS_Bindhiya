/**
 * Button Component Tests
 * Tests all variants, sizes, states, and accessibility
 *
 * @reference docs/testing/COMPONENT-TESTING-GUIDE.md
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './button';
import { axe } from '@/__tests__/setupAxe';

describe('Button', () => {
  describe('Rendering', () => {
    it('renders with default variant and size', () => {
      render(<Button>Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');
    });

    it('renders children correctly', () => {
      render(<Button>Test Button</Button>);

      expect(screen.getByText('Test Button')).toBeInTheDocument();
    });

    it('renders as a child component when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );

      const link = screen.getByRole('link', { name: /link button/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
    });
  });

  describe('Variants', () => {
    it('renders default variant', () => {
      render(<Button variant="default">Default</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('renders destructive variant', () => {
      render(<Button variant="destructive">Delete</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground');
    });

    it('renders outline variant', () => {
      render(<Button variant="outline">Outline</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('border', 'border-input', 'bg-background');
    });

    it('renders secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground');
    });

    it('renders ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:bg-accent', 'hover:text-accent-foreground');
    });

    it('renders link variant', () => {
      render(<Button variant="link">Link</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-primary', 'underline-offset-4');
    });
  });

  describe('Sizes', () => {
    it('renders default size', () => {
      render(<Button size="default">Default Size</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10', 'px-4', 'py-2');
    });

    it('renders small size', () => {
      render(<Button size="sm">Small</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-9', 'px-3');
    });

    it('renders large size', () => {
      render(<Button size="lg">Large</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-11', 'px-8');
    });

    it('renders icon size', () => {
      render(<Button size="icon" aria-label="Icon button">🔍</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10', 'w-10');
    });
  });

  describe('Interactions', () => {
    it('handles click events', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not fire click when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Button onClick={handleClick} disabled>Disabled</Button>);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('handles multiple clicks', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole('button');
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('States', () => {
    it('renders disabled state', () => {
      render(<Button disabled>Disabled Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
    });

    it('is enabled by default', () => {
      render(<Button>Enabled Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeEnabled();
    });
  });

  describe('Custom Props', () => {
    it('applies custom className', () => {
      render(<Button className="custom-class">Custom</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('forwards HTML button attributes', () => {
      render(
        <Button type="submit" name="submitBtn" value="submit">
          Submit
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('name', 'submitBtn');
      expect(button).toHaveAttribute('value', 'submit');
    });

    it('forwards aria attributes', () => {
      render(
        <Button aria-label="Close dialog" aria-pressed="true">
          ×
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Close dialog');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('forwards data attributes', () => {
      render(<Button data-testid="custom-button" data-action="save">Save</Button>);

      const button = screen.getByTestId('custom-button');
      expect(button).toHaveAttribute('data-action', 'save');
    });
  });

  describe('Focus Management', () => {
    it('is focusable by default', () => {
      render(<Button>Focusable</Button>);

      const button = screen.getByRole('button');
      button.focus();

      expect(button).toHaveFocus();
    });

    it('shows focus ring on keyboard focus', () => {
      render(<Button>Focus me</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2');
    });

    it('is not focusable when disabled', () => {
      render(<Button disabled>Not Focusable</Button>);

      const button = screen.getByRole('button');
      button.focus();

      expect(button).not.toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations - default variant', async () => {
      const { container } = render(<Button>Accessible Button</Button>);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations - destructive variant', async () => {
      const { container } = render(
        <Button variant="destructive">Delete</Button>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations - outline variant', async () => {
      const { container } = render(
        <Button variant="outline">Outline</Button>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations - disabled state', async () => {
      const { container } = render(<Button disabled>Disabled</Button>);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations - icon button with aria-label', async () => {
      const { container } = render(
        <Button size="icon" aria-label="Search">
          🔍
        </Button>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has accessible name from children', () => {
      render(<Button>Submit Form</Button>);

      const button = screen.getByRole('button', { name: /submit form/i });
      expect(button).toHaveAccessibleName();
    });

    it('has accessible name from aria-label', () => {
      render(<Button aria-label="Close modal">×</Button>);

      const button = screen.getByRole('button', { name: /close modal/i });
      expect(button).toHaveAccessibleName('Close modal');
    });
  });

  describe('Keyboard Navigation', () => {
    it('activates on Enter key', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>Press Enter</Button>);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('activates on Space key', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>Press Space</Button>);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard(' ');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('can be tabbed to', async () => {
      const user = userEvent.setup();

      render(
        <div>
          <input type="text" />
          <Button>Tab to me</Button>
        </div>
      );

      const input = screen.getByRole('textbox');
      input.focus();

      await user.tab();

      const button = screen.getByRole('button');
      expect(button).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('renders with empty children', () => {
      render(<Button>{''}</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('renders with React elements as children', () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>
      );

      expect(screen.getByText('Icon')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
    });

    it('handles rapid clicks', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>Rapid Click</Button>);

      const button = screen.getByRole('button');

      // Rapid fire clicks
      await user.click(button);
      await user.click(button);
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(5);
    });

    it('maintains functionality when variant changes', () => {
      const { rerender } = render(<Button variant="default">Button</Button>);

      let button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary');

      rerender(<Button variant="destructive">Button</Button>);

      button = screen.getByRole('button');
      expect(button).toHaveClass('bg-destructive');
    });
  });

  describe('Form Integration', () => {
    it('works as submit button in form', () => {
      const handleSubmit = vi.fn((e) => e.preventDefault());

      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit</Button>
        </form>
      );

      const button = screen.getByRole('button');
      button.click();

      expect(handleSubmit).toHaveBeenCalled();
    });

    it('works as reset button in form', () => {
      render(
        <form>
          <input defaultValue="test" />
          <Button type="reset">Reset</Button>
        </form>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'reset');
    });

    it('works as regular button in form (type="button")', () => {
      const handleSubmit = vi.fn((e) => e.preventDefault());
      const handleClick = vi.fn();

      render(
        <form onSubmit={handleSubmit}>
          <Button type="button" onClick={handleClick}>
            Don't Submit
          </Button>
        </form>
      );

      const button = screen.getByRole('button');
      button.click();

      expect(handleClick).toHaveBeenCalled();
      expect(handleSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Visual Regression Prevention', () => {
    it('maintains consistent base classes', () => {
      render(<Button>Consistent</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'inline-flex',
        'items-center',
        'justify-center',
        'whitespace-nowrap',
        'rounded-md',
        'text-sm',
        'font-medium'
      );
    });

    it('maintains transition classes', () => {
      render(<Button>Transition</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('transition-colors');
    });

    it('maintains focus ring classes', () => {
      render(<Button>Focus Ring</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'ring-offset-background',
        'focus-visible:outline-none',
        'focus-visible:ring-2',
        'focus-visible:ring-ring',
        'focus-visible:ring-offset-2'
      );
    });
  });
});
