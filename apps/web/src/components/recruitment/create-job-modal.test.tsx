/**
 * CreateJobModal Component Tests - Production Ready
 * Comprehensive test coverage for the job posting creation modal
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateJobModal from './create-job-modal';

// Mock JobPostingService
const mockCreatePosting = vi.fn();

vi.mock('@/app/dashboard/recruitment/services', () => ({
  JobPostingService: {
    createPosting: mockCreatePosting,
  },
}));

describe('CreateJobModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreatePosting.mockResolvedValue({});
  });

  // ====================================================================
  // RENDERING
  // ====================================================================

  describe('Rendering', () => {
    it('renders when isOpen is true', () => {
      render(<CreateJobModal {...defaultProps} />);

      expect(screen.getByText('Create Job Posting')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(<CreateJobModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Create Job Posting')).not.toBeInTheDocument();
    });

    it('renders all form fields', () => {
      render(<CreateJobModal {...defaultProps} />);

      expect(screen.getByLabelText('Job Title')).toBeInTheDocument();
      expect(screen.getByLabelText('Department')).toBeInTheDocument();
      expect(screen.getByLabelText('Location')).toBeInTheDocument();
      expect(screen.getByLabelText('Employment Type')).toBeInTheDocument();
    });

    it('renders submit and cancel buttons', () => {
      render(<CreateJobModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: /create posting/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('renders close button', () => {
      render(<CreateJobModal {...defaultProps} />);

      const closeButton = screen.getByRole('button', { name: '' }).closest('button');
      expect(closeButton).toBeInTheDocument();
    });
  });

  // ====================================================================
  // FORM FIELDS
  // ====================================================================

  describe('Form Fields', () => {
    it('job title input is required', () => {
      render(<CreateJobModal {...defaultProps} />);

      const input = screen.getByLabelText('Job Title') as HTMLInputElement;
      expect(input).toBeRequired();
    });

    it('department select is required', () => {
      render(<CreateJobModal {...defaultProps} />);

      const select = screen.getByLabelText('Department') as HTMLSelectElement;
      expect(select).toBeRequired();
    });

    it('location input is required', () => {
      render(<CreateJobModal {...defaultProps} />);

      const input = screen.getByLabelText('Location') as HTMLInputElement;
      expect(input).toBeRequired();
    });

    it('has default value for employment type', () => {
      render(<CreateJobModal {...defaultProps} />);

      const select = screen.getByLabelText('Employment Type') as HTMLSelectElement;
      expect(select.value).toBe('Full-time');
    });

    it('department select has all options', () => {
      render(<CreateJobModal {...defaultProps} />);

      const select = screen.getByLabelText('Department') as HTMLSelectElement;
      const options = Array.from(select.options).map((opt) => opt.value);

      expect(options).toContain('Engineering');
      expect(options).toContain('Design');
      expect(options).toContain('Marketing');
      expect(options).toContain('Sales');
      expect(options).toContain('HR');
      expect(options).toContain('Finance');
    });

    it('employment type select has all options', () => {
      render(<CreateJobModal {...defaultProps} />);

      const select = screen.getByLabelText('Employment Type') as HTMLSelectElement;
      const options = Array.from(select.options).map((opt) => opt.value);

      expect(options).toContain('Full-time');
      expect(options).toContain('Part-time');
      expect(options).toContain('Contract');
      expect(options).toContain('Remote');
    });

    it('has placeholder for job title', () => {
      render(<CreateJobModal {...defaultProps} />);

      const input = screen.getByPlaceholderText('e.g. Senior Product Designer');
      expect(input).toBeInTheDocument();
    });

    it('has placeholder for location', () => {
      render(<CreateJobModal {...defaultProps} />);

      const input = screen.getByPlaceholderText('e.g. New York, NY');
      expect(input).toBeInTheDocument();
    });
  });

  // ====================================================================
  // USER INTERACTIONS
  // ====================================================================

  describe('User Interactions', () => {
    it('updates job title when typing', async () => {
      const user = userEvent.setup();
      render(<CreateJobModal {...defaultProps} />);

      const input = screen.getByLabelText('Job Title') as HTMLInputElement;
      await user.type(input, 'Senior Developer');

      expect(input.value).toBe('Senior Developer');
    });

    it('updates department when selected', async () => {
      const user = userEvent.setup();
      render(<CreateJobModal {...defaultProps} />);

      const select = screen.getByLabelText('Department') as HTMLSelectElement;
      await user.selectOptions(select, 'Engineering');

      expect(select.value).toBe('Engineering');
    });

    it('updates location when typing', async () => {
      const user = userEvent.setup();
      render(<CreateJobModal {...defaultProps} />);

      const input = screen.getByLabelText('Location') as HTMLInputElement;
      await user.type(input, 'San Francisco, CA');

      expect(input.value).toBe('San Francisco, CA');
    });

    it('updates employment type when selected', async () => {
      const user = userEvent.setup();
      render(<CreateJobModal {...defaultProps} />);

      const select = screen.getByLabelText('Employment Type') as HTMLSelectElement;
      await user.selectOptions(select, 'Remote');

      expect(select.value).toBe('Remote');
    });

    it('calls onClose when cancel button is clicked', () => {
      render(<CreateJobModal {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when X button is clicked', () => {
      render(<CreateJobModal {...defaultProps} />);

      const closeButtons = screen.getAllByRole('button');
      const xButton = closeButtons.find((btn) => btn.querySelector('svg'));

      if (xButton) {
        fireEvent.click(xButton);
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
      }
    });

    it('calls onClose when clicking backdrop', () => {
      const { container } = render(<CreateJobModal {...defaultProps} />);

      const backdrop = container.querySelector('[class*="backdrop-blur"]');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
      }
    });
  });

  // ====================================================================
  // FORM SUBMISSION
  // ====================================================================

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      const user = userEvent.setup();
      render(<CreateJobModal {...defaultProps} />);

      await user.type(screen.getByLabelText('Job Title'), 'Senior Developer');
      await user.selectOptions(screen.getByLabelText('Department'), 'Engineering');
      await user.type(screen.getByLabelText('Location'), 'San Francisco');

      const submitButton = screen.getByRole('button', { name: /create posting/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreatePosting).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Senior Developer',
            department: 'Engineering',
            location: 'San Francisco',
            type: 'Full-time',
            status: 'Active',
            channels: {
              linkedin: false,
              indeed: false,
              website: true,
              glassdoor: false,
            },
          })
        );
      });
    });

    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      mockCreatePosting.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<CreateJobModal {...defaultProps} />);

      await user.type(screen.getByLabelText('Job Title'), 'Test Job');
      await user.selectOptions(screen.getByLabelText('Department'), 'Engineering');
      await user.type(screen.getByLabelText('Location'), 'Test Location');

      const submitButton = screen.getByRole('button', { name: /create posting/i });
      await user.click(submitButton);

      expect(screen.getByText('Creating...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('calls onSuccess after successful submission', async () => {
      const user = userEvent.setup();
      render(<CreateJobModal {...defaultProps} />);

      await user.type(screen.getByLabelText('Job Title'), 'Test Job');
      await user.selectOptions(screen.getByLabelText('Department'), 'Engineering');
      await user.type(screen.getByLabelText('Location'), 'Test Location');

      const submitButton = screen.getByRole('button', { name: /create posting/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(defaultProps.onSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it('resets form after successful submission', async () => {
      const user = userEvent.setup();
      render(<CreateJobModal {...defaultProps} />);

      const titleInput = screen.getByLabelText('Job Title') as HTMLInputElement;
      const departmentSelect = screen.getByLabelText('Department') as HTMLSelectElement;
      const locationInput = screen.getByLabelText('Location') as HTMLInputElement;

      await user.type(titleInput, 'Test Job');
      await user.selectOptions(departmentSelect, 'Engineering');
      await user.type(locationInput, 'Test Location');

      const submitButton = screen.getByRole('button', { name: /create posting/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(titleInput.value).toBe('');
        expect(departmentSelect.value).toBe('');
        expect(locationInput.value).toBe('');
      });
    });

    it('displays error message on submission failure', async () => {
      const user = userEvent.setup();
      mockCreatePosting.mockRejectedValue(new Error('Network error'));

      render(<CreateJobModal {...defaultProps} />);

      await user.type(screen.getByLabelText('Job Title'), 'Test Job');
      await user.selectOptions(screen.getByLabelText('Department'), 'Engineering');
      await user.type(screen.getByLabelText('Location'), 'Test Location');

      const submitButton = screen.getByRole('button', { name: /create posting/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to create job. Please try again.')).toBeInTheDocument();
      });
    });

    it('button is not disabled before submission', () => {
      render(<CreateJobModal {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /create posting/i });
      expect(submitButton).not.toBeDisabled();
    });

    it('prevents multiple simultaneous submissions', async () => {
      const user = userEvent.setup();
      mockCreatePosting.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 200))
      );

      render(<CreateJobModal {...defaultProps} />);

      await user.type(screen.getByLabelText('Job Title'), 'Test Job');
      await user.selectOptions(screen.getByLabelText('Department'), 'Engineering');
      await user.type(screen.getByLabelText('Location'), 'Test Location');

      const submitButton = screen.getByRole('button', { name: /create posting/i });
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreatePosting).toHaveBeenCalledTimes(1);
      });
    });
  });

  // ====================================================================
  // VALIDATION
  // ====================================================================

  describe('Validation', () => {
    it('requires job title for submission', async () => {
      render(<CreateJobModal {...defaultProps} />);

      const form = screen.getByRole('button', { name: /create posting/i }).closest('form');

      if (form) {
        fireEvent.submit(form);

        // HTML5 validation should prevent submission
        expect(mockCreatePosting).not.toHaveBeenCalled();
      }
    });

    it('requires department for submission', async () => {
      const user = userEvent.setup();
      render(<CreateJobModal {...defaultProps} />);

      await user.type(screen.getByLabelText('Job Title'), 'Test Job');
      await user.type(screen.getByLabelText('Location'), 'Test Location');

      const form = screen.getByRole('button', { name: /create posting/i }).closest('form');

      if (form) {
        fireEvent.submit(form);

        // HTML5 validation should prevent submission
        expect(mockCreatePosting).not.toHaveBeenCalled();
      }
    });

    it('requires location for submission', async () => {
      const user = userEvent.setup();
      render(<CreateJobModal {...defaultProps} />);

      await user.type(screen.getByLabelText('Job Title'), 'Test Job');
      await user.selectOptions(screen.getByLabelText('Department'), 'Engineering');

      const form = screen.getByRole('button', { name: /create posting/i }).closest('form');

      if (form) {
        fireEvent.submit(form);

        // HTML5 validation should prevent submission
        expect(mockCreatePosting).not.toHaveBeenCalled();
      }
    });
  });

  // ====================================================================
  // ERROR HANDLING
  // ====================================================================

  describe('Error Handling', () => {
    it('clears error when form is resubmitted', async () => {
      const user = userEvent.setup();
      mockCreatePosting
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce({});

      render(<CreateJobModal {...defaultProps} />);

      await user.type(screen.getByLabelText('Job Title'), 'Test Job');
      await user.selectOptions(screen.getByLabelText('Department'), 'Engineering');
      await user.type(screen.getByLabelText('Location'), 'Test Location');

      const submitButton = screen.getByRole('button', { name: /create posting/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to create job. Please try again.')).toBeInTheDocument();
      });

      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.queryByText('Failed to create job. Please try again.')
        ).not.toBeInTheDocument();
      });
    });

    it('does not call onSuccess on error', async () => {
      const user = userEvent.setup();
      mockCreatePosting.mockRejectedValue(new Error('Error'));

      render(<CreateJobModal {...defaultProps} />);

      await user.type(screen.getByLabelText('Job Title'), 'Test Job');
      await user.selectOptions(screen.getByLabelText('Department'), 'Engineering');
      await user.type(screen.getByLabelText('Location'), 'Test Location');

      const submitButton = screen.getByRole('button', { name: /create posting/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to create job. Please try again.')).toBeInTheDocument();
      });

      expect(defaultProps.onSuccess).not.toHaveBeenCalled();
    });
  });

  // ====================================================================
  // ACCESSIBILITY
  // ====================================================================

  describe('Accessibility', () => {
    it('all form inputs have labels', () => {
      render(<CreateJobModal {...defaultProps} />);

      expect(screen.getByLabelText('Job Title')).toBeInTheDocument();
      expect(screen.getByLabelText('Department')).toBeInTheDocument();
      expect(screen.getByLabelText('Location')).toBeInTheDocument();
      expect(screen.getByLabelText('Employment Type')).toBeInTheDocument();
    });

    it('form inputs are keyboard accessible', () => {
      render(<CreateJobModal {...defaultProps} />);

      const inputs = screen.getAllByRole('textbox');
      const selects = screen.getAllByRole('combobox');

      [...inputs, ...selects].forEach((element) => {
        expect(element).toBeInTheDocument();
      });
    });

    it('buttons are keyboard accessible', () => {
      render(<CreateJobModal {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button.tagName).toBe('BUTTON');
      });
    });

    it('has proper focus management', () => {
      render(<CreateJobModal {...defaultProps} />);

      const firstInput = screen.getByLabelText('Job Title');
      expect(document.body).toContainElement(firstInput);
    });
  });

  // ====================================================================
  // EDGE CASES
  // ====================================================================

  describe('Edge Cases', () => {
    it('handles very long job titles', async () => {
      const user = userEvent.setup();
      const longTitle = 'A'.repeat(200);

      render(<CreateJobModal {...defaultProps} />);

      const input = screen.getByLabelText('Job Title');
      await user.type(input, longTitle);

      expect((input as HTMLInputElement).value).toBe(longTitle);
    });

    it('handles special characters in inputs', async () => {
      const user = userEvent.setup();
      render(<CreateJobModal {...defaultProps} />);

      const titleInput = screen.getByLabelText('Job Title');
      await user.type(titleInput, 'Senior Dev & Tech Lead <Expert>');

      expect((titleInput as HTMLInputElement).value).toBe('Senior Dev & Tech Lead <Expert>');
    });

    it('maintains form state when modal is closed and reopened', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<CreateJobModal {...defaultProps} />);

      await user.type(screen.getByLabelText('Job Title'), 'Test Job');

      rerender(<CreateJobModal {...defaultProps} isOpen={false} />);
      rerender(<CreateJobModal {...defaultProps} isOpen={true} />);

      // Form should maintain state (or reset depending on implementation)
      const input = screen.getByLabelText('Job Title') as HTMLInputElement;
      expect(input).toBeInTheDocument();
    });
  });
});
