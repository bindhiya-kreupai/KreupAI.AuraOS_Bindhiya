
import { NextResponse } from 'next/server';

// Type definitions for the registry
type MockDataGenerator = () => any;
type MockRegistry = Record<string, MockDataGenerator | any>;

/**
 * Universal Mock Registry
 * Maps API routes to mock data or generator functions.
 * 
 * Pattern:
 * 'path/to/resource': mockObject
 * OR
 * 'path/to/resource': () => generateDynamicMock()
 */
export const mockRegistry: MockRegistry = {
    // ==========================================================================
    // AGRICULTURE MODULE
    // ==========================================================================
    'industry-agriculture/seasonal-labor/workers': [
        { id: 'W001', name: 'Maria Garcia', role: 'Harvester', status: 'Active' },
        { id: 'W002', name: 'Liam Wilson', role: 'Supervisor', status: 'Active' },
    ],
    'industry-agriculture/housing/facilities': [
        { id: 'H001', name: 'North Barracks', capacity: 50, occupied: 42 },
        { id: 'H002', name: 'South Cabins', capacity: 30, occupied: 15 },
    ],
    'industry-agriculture/crop-cycles': [],
    'industry-agriculture/analytics': { yield: 95, efficiency: 88 },
    'industry-agriculture/settings': { irrigationAuto: true, alertThreshold: 10 },

    // ==========================================================================
    // COLLABORATION MODULE
    // ==========================================================================
    'collaboration/whiteboards': [
        { id: 'WB001', title: 'Q4 Brainstorming', createdBy: 'User1', updatedAt: new Date().toISOString() },
    ],
    'collaboration/kanban': [
        { id: 'KB001', title: 'Project Alpha', columns: ['To Do', 'In Progress', 'Done'] },
    ],
    'collaboration/standups': [],

    // ==========================================================================
    // MOBILE APP MODULE
    // ==========================================================================
    'mobile-app/config': {
        version: '2.4.0',
        maintenanceMode: false,
        features: { offlineMode: true, biometrics: true },
    },
    'mobile-app/notifications': [],
    'mobile-app/analytics': { activeUsers: 1250, crashRate: 0.05 },

    // ==========================================================================
    // ENERGY MODULE
    // ==========================================================================
    'energy/smart-grid/meters': [
        { id: 'SM-001', type: 'Residential', location: 'Building A', status: 'Active', reading: 1450.5 },
        { id: 'SM-002', type: 'Industrial', location: 'Factory Floor', status: 'Warning', reading: 5600.2 },
    ],
    'energy/water/meters': [
        { id: 'WM-001', type: 'Main Line', location: 'Entrance', status: 'Active', flowRate: 45.2 },
    ],
    'energy/renewable-assets': [
        { id: 'SOL-001', type: 'Solar Array', capacity: 500, currentOutput: 350, status: 'Active' },
    ],
    'energy/settings': {
        gridOptimization: true,
        carbonTarget: 'Net Zero by 2030',
    },

    // ==========================================================================
    // ADMIN / MASTER DATA MODULE
    // ==========================================================================
    'master-data/banks': [
        { id: 'BNK001', name: 'Chase Bank', swiftCode: 'CHASUS33', branchName: 'New York Main', status: 'Active' },
        { id: 'BNK002', name: 'Bank of America', swiftCode: 'BOFAUS3N', branchName: 'San Francisco', status: 'Active' },
    ],
    'master-data/companies': [
        { id: 'COMP001', name: 'Acme Corp', registrationNumber: 'REG12345', taxId: 'TAX999', status: 'Active' },
    ],
    'master-data/locations': [
        { id: 'LOC001', name: 'Headquarters', city: 'New York', country: 'USA', status: 'Active' },
    ],
    'master-data/departments': [
        { id: 'DEPT001', name: 'Engineering', code: 'ENG', head: 'Alice Smith', status: 'Active' },
        { id: 'DEPT002', name: 'Human Resources', code: 'HR', head: 'Bob Jones', status: 'Active' },
    ],

    // ==========================================================================
    // CONSTRUCTION MODULE
    // ==========================================================================
    'industry-construction/projects': [
        { id: 'PRJ-001', name: 'Downtown Highrise', status: 'In Progress', budget: 5000000, completion: 45 },
    ],
    'industry-construction/sites': [
        { id: 'SITE-001', name: 'Site Alpha', location: '123 Main St', supervisor: 'John Doe' },
    ],

    // ==========================================================================
    // EDUCATION MODULE
    // ==========================================================================
    'industry-education/students': [
        { id: 'STU-001', name: 'Student One', grade: '10th', status: 'Enrolled' },
    ],
    'industry-education/courses': [
        { id: 'CRS-001', name: 'Mathematics 101', teacher: 'Mrs. Davis', studentsEnrolled: 30 },
    ],

    // ==========================================================================
    // AUTOMOTIVE MODULE
    // ==========================================================================
    'industry-automotive/vehicles': [
        { id: 'VEH-001', vin: 'VIN123456789', model: 'Model X', status: 'In Stock' },
    ],
};

/**
 * Registry Lookup Helper
 * Tries to find a match for the requested path.
 * Handles exact matches and potentially param-based matching in future iterations.
 */
export function getMockData(pathSegments: string[]): any | null {
    const path = pathSegments.join('/');

    // 1. Try exact match
    if (mockRegistry[path]) {
        const data = mockRegistry[path];
        return typeof data === 'function' ? data() : data;
    }

    // 2. Try partial match for detail views (basic heuristic)
    // e.g., 'industry-agriculture/seasonal-labor/workers/W001' -> returns single item if list exists
    const parentPath = pathSegments.slice(0, -1).join('/');
    if (mockRegistry[parentPath] && Array.isArray(mockRegistry[parentPath])) {
        // Return a generic item from the list or null
        const list = mockRegistry[parentPath];
        return list.length > 0 ? list[0] : {};
    }

    return null;
}
