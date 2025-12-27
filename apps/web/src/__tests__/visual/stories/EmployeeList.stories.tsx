import type { Meta, StoryObj } from '@storybook/react';
import { expect, within, userEvent } from '@storybook/test';

/**
 * Employee List Page Visual Testing
 * Week 13-14: Visual & Accessibility Testing
 *
 * Tests visual regression and accessibility for the employee list page
 */

const mockEmployees = [
  {
    id: 1,
    employeeId: 'EMP001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    department: 'Engineering',
    position: 'Senior Software Engineer',
    status: 'Active',
  },
  {
    id: 2,
    employeeId: 'EMP002',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    department: 'HR',
    position: 'HR Manager',
    status: 'Active',
  },
  {
    id: 3,
    employeeId: 'EMP003',
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob.johnson@example.com',
    department: 'Sales',
    position: 'Sales Representative',
    status: 'On Leave',
  },
];

const EmployeeList = ({ employees = mockEmployees, loading = false, error = null }) => {
  if (loading) {
    return (
      <div className="p-6" role="status" aria-live="polite" aria-label="Loading employees">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6" role="alert">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <h3 className="text-red-800 font-medium">Error Loading Employees</h3>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
            <p className="text-gray-600 mt-2">Manage your workforce</p>
          </div>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Add new employee"
          >
            Add Employee
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              id="search"
              type="text"
              placeholder="Search employees..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Search employees by name or ID"
            />
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              id="department"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Filter by department"
            >
              <option value="">All Departments</option>
              <option value="engineering">Engineering</option>
              <option value="hr">HR</option>
              <option value="sales">Sales</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Filter by employment status"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="on-leave">On Leave</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              aria-label="Clear all filters"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200" role="table" aria-label="Employee list">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map((employee) => (
              <tr key={employee.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {employee.employeeId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {employee.firstName} {employee.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {employee.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {employee.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {employee.position}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      employee.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {employee.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    className="text-blue-600 hover:text-blue-900 mr-3"
                    aria-label={`View details for ${employee.firstName} ${employee.lastName}`}
                  >
                    View
                  </button>
                  <button
                    className="text-gray-600 hover:text-gray-900"
                    aria-label={`Edit ${employee.firstName} ${employee.lastName}`}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">1</span> to <span className="font-medium">3</span> of{' '}
          <span className="font-medium">3</span> results
        </div>
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <button
            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            disabled
            aria-label="Previous page"
          >
            Previous
          </button>
          <button
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            aria-label="Page 1"
            aria-current="page"
          >
            1
          </button>
          <button
            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            disabled
            aria-label="Next page"
          >
            Next
          </button>
        </nav>
      </div>
    </div>
  );
};

const meta: Meta<typeof EmployeeList> = {
  title: 'Pages/EmployeeList',
  component: EmployeeList,
  parameters: {
    layout: 'fullscreen',
    chromatic: {
      viewports: [375, 768, 1280, 1920],
      delay: 300,
    },
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'label', enabled: true },
          { id: 'button-name', enabled: true },
          { id: 'table-duplicate-name', enabled: true },
        ],
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EmployeeList>;

/**
 * Default employee list view with sample data
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify heading
    await expect(canvas.getByText('Employees')).toBeInTheDocument();

    // Verify table headers
    await expect(canvas.getByText('Employee ID')).toBeInTheDocument();
    await expect(canvas.getByText('Name')).toBeInTheDocument();
    await expect(canvas.getByText('Email')).toBeInTheDocument();

    // Verify at least one employee is shown
    await expect(canvas.getByText('EMP001')).toBeInTheDocument();
  },
};

/**
 * Empty state - no employees
 */
export const Empty: Story = {
  args: {
    employees: [],
  },
};

/**
 * Loading state
 */
export const Loading: Story = {
  args: {
    loading: true,
  },
};

/**
 * Error state
 */
export const Error: Story = {
  args: {
    error: 'Failed to load employees. Please try again later.',
  },
};

/**
 * Mobile viewport
 */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    chromatic: {
      viewports: [375],
    },
  },
};

/**
 * Tablet viewport
 */
export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    chromatic: {
      viewports: [768],
    },
  },
};

/**
 * With many employees (pagination test)
 */
export const ManyEmployees: Story = {
  args: {
    employees: Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      employeeId: `EMP${String(i + 1).padStart(3, '0')}`,
      firstName: `FirstName${i + 1}`,
      lastName: `LastName${i + 1}`,
      email: `employee${i + 1}@example.com`,
      department: ['Engineering', 'HR', 'Sales', 'Finance'][i % 4],
      position: 'Employee',
      status: i % 5 === 0 ? 'On Leave' : 'Active',
    })),
  },
};

/**
 * Keyboard navigation test
 */
export const KeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const searchInput = canvas.getByLabelText('Search employees by name or ID');

    // Focus search input
    searchInput.focus();
    await expect(searchInput).toHaveFocus();

    // Tab to next element
    await userEvent.tab();
    const departmentSelect = canvas.getByLabelText('Filter by department');
    await expect(departmentSelect).toHaveFocus();
  },
};
