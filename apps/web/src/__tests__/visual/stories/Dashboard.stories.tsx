import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';

/**
 * Dashboard Page Visual Testing
 * Week 13-14: Visual & Accessibility Testing
 *
 * Tests visual regression and accessibility for the main dashboard page
 */

// Mock Dashboard Component (replace with actual component import)
const Dashboard = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to AuraOS HCM Platform</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Stats Cards */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Employees</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">1,234</p>
          <p className="text-sm text-green-600 mt-2">↑ 5% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Active Projects</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">42</p>
          <p className="text-sm text-green-600 mt-2">↑ 2% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Pending Approvals</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">18</p>
          <p className="text-sm text-yellow-600 mt-2">3 urgent</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Department Count</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">12</p>
          <p className="text-sm text-gray-600 mt-2">No change</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
              <div>
                <p className="text-sm text-gray-900">New employee onboarded</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></span>
              <div>
                <p className="text-sm text-gray-900">Leave request approved</p>
                <p className="text-xs text-gray-500">4 hours ago</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3"></span>
              <div>
                <p className="text-sm text-gray-900">Payroll processing started</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors">
              <span className="text-2xl">👤</span>
              <p className="text-sm font-medium text-gray-900 mt-2">Add Employee</p>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors">
              <span className="text-2xl">📊</span>
              <p className="text-sm font-medium text-gray-900 mt-2">View Reports</p>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors">
              <span className="text-2xl">💰</span>
              <p className="text-sm font-medium text-gray-900 mt-2">Process Payroll</p>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors">
              <span className="text-2xl">📅</span>
              <p className="text-sm font-medium text-gray-900 mt-2">Manage Leave</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const meta: Meta<typeof Dashboard> = {
  title: 'Pages/Dashboard',
  component: Dashboard,
  parameters: {
    layout: 'fullscreen',
    chromatic: {
      viewports: [375, 768, 1280, 1920],
      delay: 300,
      pauseAnimationAtEnd: true,
    },
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'landmark-one-main', enabled: true },
          { id: 'region', enabled: true },
        ],
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Dashboard>;

/**
 * Default dashboard view with all sections visible
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify main heading is present
    await expect(canvas.getByText('Dashboard')).toBeInTheDocument();

    // Verify all stat cards are present
    await expect(canvas.getByText('Total Employees')).toBeInTheDocument();
    await expect(canvas.getByText('1,234')).toBeInTheDocument();
    await expect(canvas.getByText('Active Projects')).toBeInTheDocument();
    await expect(canvas.getByText('42')).toBeInTheDocument();

    // Verify sections are rendered
    await expect(canvas.getByText('Recent Activity')).toBeInTheDocument();
    await expect(canvas.getByText('Quick Actions')).toBeInTheDocument();
  },
};

/**
 * Dashboard on mobile viewport (375px)
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
 * Dashboard on tablet viewport (768px)
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
 * Dashboard on desktop viewport (1280px)
 */
export const Desktop: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
    chromatic: {
      viewports: [1280],
    },
  },
};

/**
 * Dashboard with dark background
 */
export const DarkBackground: Story = {
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
};

/**
 * Dashboard - Focus state testing
 */
export const FocusStates: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstButton = canvas.getAllByRole('button')[0];
    firstButton.focus();
  },
};

/**
 * Dashboard - Hover state testing
 */
export const HoverStates: Story = {
  parameters: {
    pseudo: { hover: true },
  },
};
