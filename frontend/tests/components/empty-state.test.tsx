import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EmptyState } from '@/components/ui/empty-state';

describe('EmptyState', () => {
  it('renders the title', () => {
    render(<EmptyState title="No hosted zones" />);
    expect(screen.getByText('No hosted zones')).toBeInTheDocument();
  });

  it('renders subtitle and action when provided', () => {
    render(
      <EmptyState
        title="No records"
        subtitle="Add an A record to get started."
        action={<button type="button">Create record</button>}
      />,
    );
    expect(screen.getByText('Add an A record to get started.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create record' })).toBeInTheDocument();
  });

  it('omits subtitle when undefined', () => {
    render(<EmptyState title="Empty" />);
    expect(screen.queryByText('Add an A record to get started.')).not.toBeInTheDocument();
  });
});
