// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton, SkeletonForm, SkeletonVerdict } from '@aura/ui/components/ui';

describe('Skeleton', () => {
  it('renders with role=status by default', () => {
    render(<Skeleton />);
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
  });

  it('uses the provided aria-label when supplied', () => {
    render(<Skeleton label="Loading employees" />);
    expect(screen.getByLabelText(/Loading employees/i)).toBeInTheDocument();
  });

  it('falls back to a generic "Loading" label', () => {
    render(<Skeleton />);
    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
  });

  it('applies the variant shape class for "title"', () => {
    const { container } = render(<Skeleton variant="title" />);
    const node = container.firstChild as HTMLElement;
    expect(node.className).toContain('h-5');
  });

  it('applies the variant shape class for "avatar"', () => {
    const { container } = render(<Skeleton variant="avatar" />);
    const node = container.firstChild as HTMLElement;
    expect(node.className).toMatch(/rounded-full/);
  });

  it('honours widthClass + heightClass overrides', () => {
    const { container } = render(<Skeleton widthClass="w-24" heightClass="h-2" />);
    const node = container.firstChild as HTMLElement;
    expect(node.className).toContain('w-24');
    expect(node.className).toContain('h-2');
  });

  it('applies animate-pulse for the shimmer', () => {
    const { container } = render(<Skeleton />);
    const node = container.firstChild as HTMLElement;
    expect(node.className).toContain('animate-pulse');
  });

  it('renders N rows when rows > 1', () => {
    const { container } = render(<Skeleton rows={4} />);
    // The outer wrapper holds the rows
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.children.length).toBe(4);
  });

  it('the last row is rendered with the narrower w-3/4 fallback', () => {
    const { container } = render(<Skeleton rows={3} />);
    const wrapper = container.firstChild as HTMLElement;
    const last = wrapper.lastChild as HTMLElement;
    expect(last.className).toContain('w-3/4');
  });
});

describe('SkeletonForm', () => {
  it('renders title + N text rows + submit-shaped block by default', () => {
    const { container } = render(<SkeletonForm rows={3} />);
    // role=status on the container itself
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
    // 1 (title) + 1 wrapper-for-rows + 1 (submit) = at least 3 direct children
    expect((container.firstChild as HTMLElement).children.length).toBeGreaterThanOrEqual(3);
  });

  it('hides the submit block when showSubmit=false', () => {
    const { container } = render(<SkeletonForm rows={2} showSubmit={false} />);
    expect((container.firstChild as HTMLElement).children.length).toBe(2);
  });
});

describe('SkeletonVerdict', () => {
  it('renders a card-shaped placeholder with title + 2 text rows', () => {
    const { container } = render(<SkeletonVerdict />);
    const card = container.firstChild as HTMLElement;
    expect(card.getAttribute('role')).toBe('status');
    expect(card.getAttribute('aria-label')).toBe('Verdict loading');
    // The card has 2 direct children: header row + text-rows block.
    expect(card.children.length).toBe(2);
  });
});
