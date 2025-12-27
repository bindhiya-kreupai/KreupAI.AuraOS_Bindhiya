/**
 * DataTable Component Tests
 * Tests rendering, interactions, search, toolbar actions, and accessibility
 *
 * @reference docs/testing/COMPONENT-TESTING-GUIDE.md
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable, Column } from './data-table';
import { axe } from '@/__tests__/setupAxe';

// Test data types
interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: 'active' | 'inactive';
}

// Sample test data
const employees: Employee[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    department: 'Engineering',
    role: 'Software Engineer',
    status: 'active',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    department: 'Product',
    role: 'Product Manager',
    status: 'active',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    department: 'Design',
    role: 'UI Designer',
    status: 'inactive',
  },
];

// Sample columns configuration
const basicColumns: Column<Employee>[] = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'department', header: 'Department' },
];

const columnsWithRender: Column<Employee>[] = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <span className={row.status === 'active' ? 'text-green-600' : 'text-gray-400'}>
        {row.status.toUpperCase()}
      </span>
    ),
  },
];

const columnsWithWidth: Column<Employee>[] = [
  { key: 'name', header: 'Name', width: '30%' },
  { key: 'email', header: 'Email', width: '40%' },
  { key: 'department', header: 'Department', width: '30%' },
];

describe('DataTable', () => {
  describe('Rendering', () => {
    it('renders table with data and columns', () => {
      render(<DataTable data={employees} columns={basicColumns} />);

      // Verify headers
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Department')).toBeInTheDocument();

      // Verify data rows
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
      expect(screen.getByText('Design')).toBeInTheDocument();
    });

    it('renders empty state when no data', () => {
      render(<DataTable data={[]} columns={basicColumns} />);

      expect(screen.getByText('No data found')).toBeInTheDocument();
    });

    it('renders search input', () => {
      render(<DataTable data={employees} columns={basicColumns} />);

      const searchInput = screen.getByPlaceholderText('Search...');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('type', 'text');
    });

    it('renders toolbar with search only by default', () => {
      render(<DataTable data={employees} columns={basicColumns} />);

      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
      // Filter, Import, Export buttons should not render without handlers
      expect(screen.queryByTitle('Filter')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Import')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Export')).not.toBeInTheDocument();
    });

    it('renders all columns correctly', () => {
      render(<DataTable data={employees} columns={basicColumns} />);

      const table = screen.getByRole('table');
      const headers = within(table).getAllByRole('columnheader');

      // 3 columns + 1 actions column
      expect(headers).toHaveLength(4);
    });

    it('applies custom className', () => {
      const { container } = render(
        <DataTable data={employees} columns={basicColumns} className="custom-table-class" />
      );

      const tableWrapper = container.firstChild;
      expect(tableWrapper).toHaveClass('custom-table-class');
    });

    it('renders footer with entry count', () => {
      render(<DataTable data={employees} columns={basicColumns} />);

      expect(screen.getByText('Showing 3 entries')).toBeInTheDocument();
    });

    it('renders pagination buttons (disabled by default)', () => {
      render(<DataTable data={employees} columns={basicColumns} />);

      const prevButton = screen.getByRole('button', { name: /previous/i });
      const nextButton = screen.getByRole('button', { name: /next/i });

      expect(prevButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
    });
  });

  describe('Custom Rendering', () => {
    it('uses custom render function when provided', () => {
      render(<DataTable data={employees} columns={columnsWithRender} />);

      // Custom render should uppercase status
      expect(screen.getByText('ACTIVE')).toBeInTheDocument();
      expect(screen.getByText('INACTIVE')).toBeInTheDocument();
    });

    it('falls back to direct property access without render function', () => {
      render(<DataTable data={employees} columns={basicColumns} />);

      expect(screen.getByText('Engineering')).toBeInTheDocument();
    });

    it('applies column width styles', () => {
      render(<DataTable data={employees} columns={columnsWithWidth} />);

      const table = screen.getByRole('table');
      const headers = within(table).getAllByRole('columnheader');

      expect(headers[0]).toHaveStyle({ width: '30%' });
      expect(headers[1]).toHaveStyle({ width: '40%' });
      expect(headers[2]).toHaveStyle({ width: '30%' });
    });
  });

  describe('Search Functionality', () => {
    it('calls onSearch when typing in search input', async () => {
      const user = userEvent.setup();
      const handleSearch = vi.fn();

      render(<DataTable data={employees} columns={basicColumns} onSearch={handleSearch} />);

      const searchInput = screen.getByPlaceholderText('Search...');
      await user.type(searchInput, 'John');

      // Called once per character typed
      expect(handleSearch).toHaveBeenCalledTimes(4);
      expect(handleSearch).toHaveBeenLastCalledWith('John');
    });

    it('does not call onSearch when handler not provided', async () => {
      const user = userEvent.setup();

      render(<DataTable data={employees} columns={basicColumns} />);

      const searchInput = screen.getByPlaceholderText('Search...');

      // Should not throw error
      await user.type(searchInput, 'test');

      expect(searchInput).toHaveValue('test');
    });

    it('handles empty search query', async () => {
      const user = userEvent.setup();
      const handleSearch = vi.fn();

      render(<DataTable data={employees} columns={basicColumns} onSearch={handleSearch} />);

      const searchInput = screen.getByPlaceholderText('Search...');
      await user.type(searchInput, 'test');
      await user.clear(searchInput);

      expect(handleSearch).toHaveBeenLastCalledWith('');
    });
  });

  describe('Toolbar Actions', () => {
    it('renders filter button when onFilter provided', () => {
      const handleFilter = vi.fn();

      render(<DataTable data={employees} columns={basicColumns} onFilter={handleFilter} />);

      const filterButton = screen.getByTitle('Filter');
      expect(filterButton).toBeInTheDocument();
    });

    it('calls onFilter when filter button clicked', async () => {
      const user = userEvent.setup();
      const handleFilter = vi.fn();

      render(<DataTable data={employees} columns={basicColumns} onFilter={handleFilter} />);

      const filterButton = screen.getByTitle('Filter');
      await user.click(filterButton);

      expect(handleFilter).toHaveBeenCalledTimes(1);
    });

    it('renders import button when onImport provided', () => {
      const handleImport = vi.fn();

      render(<DataTable data={employees} columns={basicColumns} onImport={handleImport} />);

      const importButton = screen.getByTitle('Import');
      expect(importButton).toBeInTheDocument();
    });

    it('calls onImport when import button clicked', async () => {
      const user = userEvent.setup();
      const handleImport = vi.fn();

      render(<DataTable data={employees} columns={basicColumns} onImport={handleImport} />);

      const importButton = screen.getByTitle('Import');
      await user.click(importButton);

      expect(handleImport).toHaveBeenCalledTimes(1);
    });

    it('renders export button when onExport provided', () => {
      const handleExport = vi.fn();

      render(<DataTable data={employees} columns={basicColumns} onExport={handleExport} />);

      const exportButton = screen.getByTitle('Export');
      expect(exportButton).toBeInTheDocument();
    });

    it('calls onExport when export button clicked', async () => {
      const user = userEvent.setup();
      const handleExport = vi.fn();

      render(<DataTable data={employees} columns={basicColumns} onExport={handleExport} />);

      const exportButton = screen.getByTitle('Export');
      await user.click(exportButton);

      expect(handleExport).toHaveBeenCalledTimes(1);
    });

    it('renders all toolbar actions when all handlers provided', () => {
      render(
        <DataTable
          data={employees}
          columns={basicColumns}
          onFilter={vi.fn()}
          onImport={vi.fn()}
          onExport={vi.fn()}
        />
      );

      expect(screen.getByTitle('Filter')).toBeInTheDocument();
      expect(screen.getByTitle('Import')).toBeInTheDocument();
      expect(screen.getByTitle('Export')).toBeInTheDocument();
    });
  });

  describe('Row Interactions', () => {
    it('calls onRowClick when row is clicked', async () => {
      const user = userEvent.setup();
      const handleRowClick = vi.fn();

      render(<DataTable data={employees} columns={basicColumns} onRowClick={handleRowClick} />);

      const table = screen.getByRole('table');
      const rows = within(table).getAllByRole('row');

      // Click first data row (skip header row)
      await user.click(rows[1]);

      expect(handleRowClick).toHaveBeenCalledTimes(1);
      expect(handleRowClick).toHaveBeenCalledWith(employees[0]);
    });

    it('does not error when onRowClick not provided', async () => {
      const user = userEvent.setup();

      render(<DataTable data={employees} columns={basicColumns} />);

      const table = screen.getByRole('table');
      const rows = within(table).getAllByRole('row');

      // Should not throw error
      await user.click(rows[1]);

      // Test passes if no error thrown
      expect(true).toBe(true);
    });

    it('shows row action button on hover', () => {
      render(<DataTable data={employees} columns={basicColumns} />);

      const table = screen.getByRole('table');
      const rows = within(table).getAllByRole('row');

      // Action button should be present (hidden with opacity-0)
      const actionButtons = screen.getAllByRole('button', { hidden: true });

      // Each row has an action button (3 rows + toolbar buttons)
      expect(actionButtons.length).toBeGreaterThanOrEqual(3);
    });

    it('handles multiple row clicks', async () => {
      const user = userEvent.setup();
      const handleRowClick = vi.fn();

      render(<DataTable data={employees} columns={basicColumns} onRowClick={handleRowClick} />);

      const table = screen.getByRole('table');
      const rows = within(table).getAllByRole('row');

      await user.click(rows[1]);
      await user.click(rows[2]);
      await user.click(rows[3]);

      expect(handleRowClick).toHaveBeenCalledTimes(3);
      expect(handleRowClick).toHaveBeenNthCalledWith(1, employees[0]);
      expect(handleRowClick).toHaveBeenNthCalledWith(2, employees[1]);
      expect(handleRowClick).toHaveBeenNthCalledWith(3, employees[2]);
    });
  });

  describe('Empty State', () => {
    it('displays empty state message when data is empty', () => {
      render(<DataTable data={[]} columns={basicColumns} />);

      expect(screen.getByText('No data found')).toBeInTheDocument();
    });

    it('empty state spans all columns', () => {
      render(<DataTable data={[]} columns={basicColumns} />);

      const table = screen.getByRole('table');
      const emptyCell = within(table).getByText('No data found');

      // Should span 3 columns + 1 action column = 4
      expect(emptyCell).toHaveAttribute('colspan', '4');
    });

    it('shows search and toolbar even with empty data', () => {
      render(
        <DataTable
          data={[]}
          columns={basicColumns}
          onSearch={vi.fn()}
          onFilter={vi.fn()}
        />
      );

      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
      expect(screen.getByTitle('Filter')).toBeInTheDocument();
    });

    it('shows correct entry count for empty data', () => {
      render(<DataTable data={[]} columns={basicColumns} />);

      expect(screen.getByText('Showing 0 entries')).toBeInTheDocument();
    });
  });

  describe('Data Handling', () => {
    it('renders all rows from data array', () => {
      render(<DataTable data={employees} columns={basicColumns} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('handles single row data', () => {
      const singleEmployee = [employees[0]];

      render(<DataTable data={singleEmployee} columns={basicColumns} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      expect(screen.getByText('Showing 1 entries')).toBeInTheDocument();
    });

    it('handles large datasets', () => {
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        name: `Employee ${i}`,
        email: `employee${i}@example.com`,
        department: 'Engineering',
        role: 'Engineer',
        status: 'active' as const,
      }));

      render(<DataTable data={largeDataset} columns={basicColumns} />);

      expect(screen.getByText('Showing 100 entries')).toBeInTheDocument();
    });

    it('uses row.id as key for rendering', () => {
      const { container } = render(<DataTable data={employees} columns={basicColumns} />);

      const rows = container.querySelectorAll('tbody tr');

      // Each row should be rendered
      expect(rows.length).toBe(3);
    });
  });

  describe('Column Header Sorting UI', () => {
    it('shows sort icon on header hover', () => {
      render(<DataTable data={employees} columns={basicColumns} />);

      const nameHeader = screen.getByText('Name');

      // Sort icon should be in header (hidden by default)
      const headerContainer = nameHeader.closest('div');
      expect(headerContainer).toHaveClass('group');
    });

    it('renders all column headers with sort UI', () => {
      render(<DataTable data={employees} columns={basicColumns} />);

      const table = screen.getByRole('table');
      const headers = within(table).getAllByRole('columnheader');

      // Exclude the last empty header (actions column)
      headers.slice(0, -1).forEach((header) => {
        const headerDiv = within(header).getByText(/name|email|department/i).closest('div');
        expect(headerDiv).toHaveClass('cursor-pointer');
      });
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations with data', async () => {
      const { container } = render(<DataTable data={employees} columns={basicColumns} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations with empty state', async () => {
      const { container } = render(<DataTable data={[]} columns={basicColumns} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations with all toolbar actions', async () => {
      const { container } = render(
        <DataTable
          data={employees}
          columns={basicColumns}
          onSearch={vi.fn()}
          onFilter={vi.fn()}
          onImport={vi.fn()}
          onExport={vi.fn()}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('toolbar buttons have accessible titles', () => {
      render(
        <DataTable
          data={employees}
          columns={basicColumns}
          onFilter={vi.fn()}
          onImport={vi.fn()}
          onExport={vi.fn()}
        />
      );

      expect(screen.getByTitle('Filter')).toHaveAccessibleName();
      expect(screen.getByTitle('Import')).toHaveAccessibleName();
      expect(screen.getByTitle('Export')).toHaveAccessibleName();
    });

    it('search input has accessible placeholder', () => {
      render(<DataTable data={employees} columns={basicColumns} />);

      const searchInput = screen.getByPlaceholderText('Search...');
      expect(searchInput).toBeInTheDocument();
    });

    it('uses semantic HTML table elements', () => {
      render(<DataTable data={employees} columns={basicColumns} />);

      expect(screen.getByRole('table')).toBeInTheDocument();

      const table = screen.getByRole('table');
      expect(within(table).getByRole('rowgroup')).toBeInTheDocument(); // thead or tbody
    });

    it('pagination buttons have accessible labels', () => {
      render(<DataTable data={employees} columns={basicColumns} />);

      expect(screen.getByRole('button', { name: /previous/i })).toHaveAccessibleName();
      expect(screen.getByRole('button', { name: /next/i })).toHaveAccessibleName();
    });
  });

  describe('Keyboard Navigation', () => {
    it('search input is keyboard accessible', async () => {
      const user = userEvent.setup();

      render(<DataTable data={employees} columns={basicColumns} />);

      // Tab to search input
      await user.tab();

      const searchInput = screen.getByPlaceholderText('Search...');
      expect(searchInput).toHaveFocus();
    });

    it('can tab through toolbar buttons', async () => {
      const user = userEvent.setup();

      render(
        <DataTable
          data={employees}
          columns={basicColumns}
          onFilter={vi.fn()}
          onImport={vi.fn()}
          onExport={vi.fn()}
        />
      );

      await user.tab(); // Search input
      await user.tab(); // Filter button

      expect(screen.getByTitle('Filter')).toHaveFocus();

      await user.tab(); // Import button
      expect(screen.getByTitle('Import')).toHaveFocus();

      await user.tab(); // Export button
      expect(screen.getByTitle('Export')).toHaveFocus();
    });

    it('toolbar buttons activate on Enter key', async () => {
      const user = userEvent.setup();
      const handleFilter = vi.fn();

      render(<DataTable data={employees} columns={basicColumns} onFilter={handleFilter} />);

      const filterButton = screen.getByTitle('Filter');
      filterButton.focus();

      await user.keyboard('{Enter}');

      expect(handleFilter).toHaveBeenCalledTimes(1);
    });

    it('toolbar buttons activate on Space key', async () => {
      const user = userEvent.setup();
      const handleExport = vi.fn();

      render(<DataTable data={employees} columns={basicColumns} onExport={handleExport} />);

      const exportButton = screen.getByTitle('Export');
      exportButton.focus();

      await user.keyboard(' ');

      expect(handleExport).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles missing optional handlers gracefully', () => {
      render(<DataTable data={employees} columns={basicColumns} />);

      // Should render without errors
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('handles data with only id field', () => {
      const minimalData = [{ id: '1' }, { id: '2' }];
      const minimalColumns: Column<{ id: string }>[] = [
        { key: 'id', header: 'ID' },
      ];

      render(<DataTable data={minimalData} columns={minimalColumns} />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('handles numeric IDs', () => {
      const numericIdData = [
        { id: 1, name: 'Test 1' },
        { id: 2, name: 'Test 2' },
      ];
      const columns: Column<{ id: number; name: string }>[] = [
        { key: 'name', header: 'Name' },
      ];

      render(<DataTable data={numericIdData} columns={columns} />);

      expect(screen.getByText('Test 1')).toBeInTheDocument();
      expect(screen.getByText('Test 2')).toBeInTheDocument();
    });

    it('handles columns with undefined render function', () => {
      const columnsWithUndefined: Column<Employee>[] = [
        { key: 'name', header: 'Name', render: undefined },
        { key: 'email', header: 'Email' },
      ];

      render(<DataTable data={employees} columns={columnsWithUndefined} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('handles rapid search input', async () => {
      const user = userEvent.setup();
      const handleSearch = vi.fn();

      render(<DataTable data={employees} columns={basicColumns} onSearch={handleSearch} />);

      const searchInput = screen.getByPlaceholderText('Search...');
      await user.type(searchInput, 'abcdefghij', { delay: 1 });

      expect(handleSearch).toHaveBeenCalledTimes(10);
    });

    it('handles special characters in search', async () => {
      const user = userEvent.setup();
      const handleSearch = vi.fn();

      render(<DataTable data={employees} columns={basicColumns} onSearch={handleSearch} />);

      const searchInput = screen.getByPlaceholderText('Search...');
      await user.type(searchInput, '@#$%^&*()');

      expect(handleSearch).toHaveBeenLastCalledWith('@#$%^&*()');
    });
  });

  describe('Visual Regression Prevention', () => {
    it('maintains consistent wrapper classes', () => {
      const { container } = render(<DataTable data={employees} columns={basicColumns} />);

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('bg-white', 'rounded-xl', 'border', 'shadow-sm');
    });

    it('maintains consistent toolbar structure', () => {
      const { container } = render(<DataTable data={employees} columns={basicColumns} />);

      const toolbar = container.querySelector('.border-b');
      expect(toolbar).toBeInTheDocument();
      expect(toolbar).toHaveClass('p-3', 'border-b', 'flex');
    });

    it('maintains consistent table structure', () => {
      render(<DataTable data={employees} columns={basicColumns} />);

      const table = screen.getByRole('table');
      expect(table).toHaveClass('w-full', 'text-sm', 'text-left');
    });

    it('maintains consistent footer structure', () => {
      const { container } = render(<DataTable data={employees} columns={basicColumns} />);

      const footer = container.querySelector('.border-t');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveClass('px-4', 'py-3', 'border-t', 'flex');
    });
  });

  describe('Performance', () => {
    it('renders efficiently with large dataset', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i}`,
        name: `Employee ${i}`,
        email: `employee${i}@example.com`,
        department: 'Engineering',
        role: 'Engineer',
        status: 'active' as const,
      }));

      const startTime = performance.now();
      render(<DataTable data={largeDataset} columns={basicColumns} />);
      const endTime = performance.now();

      // Rendering should complete in reasonable time (< 1000ms)
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('handles frequent search updates efficiently', async () => {
      const user = userEvent.setup();
      const handleSearch = vi.fn();

      render(<DataTable data={employees} columns={basicColumns} onSearch={handleSearch} />);

      const searchInput = screen.getByPlaceholderText('Search...');

      const startTime = performance.now();
      await user.type(searchInput, 'test search query');
      const endTime = performance.now();

      // Typing should be responsive (< 500ms for 17 characters)
      expect(endTime - startTime).toBeLessThan(500);
    });
  });
});
