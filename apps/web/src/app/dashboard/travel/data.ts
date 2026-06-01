// @ts-nocheck — Dev/demo seed data, intentionally loose-typed.
// Travel Management Sample Data
import type {
  TravelRequest, TravelBooking, TravelPolicy, TravelMetrics, TravelSettings,
  TravelItinerary, AccommodationRequest, TransportRequest, TravelAdvance, TravelApprover, TravelExpense
} from './types';

// Sample Travel Requests
export const sampleTravelRequests: TravelRequest[] = [
  {
    id: 'tr-001',
    requestCode: 'TR-2024-001',
    employeeId: 'emp-001',
    employeeName: 'Sarah Johnson',
    departmentId: 'dept-001',
    departmentName: 'Sales',
    managerId: 'mgr-001',
    managerName: 'Michael Chen',
    travelType: 'domestic',
    purpose: 'client_meeting',
    purposeDetails: 'Meeting with major client TechCorp to finalize Q1 contract worth $500K',
    fromLocation: 'San Francisco, CA',
    toLocation: 'New York, NY',
    departureDate: '2024-02-15',
    returnDate: '2024-02-18',
    duration: 3,
    estimatedCost: 2500,
    currency: 'USD',
    status: 'approved',
    itinerary: [
      {
        id: 'itin-001',
        date: '2024-02-15',
        fromLocation: 'San Francisco, CA',
        toLocation: 'New York, NY',
        departureTime: '08:00 AM',
        arrivalTime: '04:30 PM',
        mode: 'flight',
        notes: 'United Airlines UA123'
      },
      {
        id: 'itin-002',
        date: '2024-02-18',
        fromLocation: 'New York, NY',
        toLocation: 'San Francisco, CA',
        departureTime: '06:00 PM',
        arrivalTime: '09:30 PM',
        mode: 'flight',
        notes: 'United Airlines UA456'
      }
    ],
    accommodation: [
      {
        id: 'acc-001',
        checkInDate: '2024-02-15',
        checkOutDate: '2024-02-18',
        city: 'New York',
        accommodationType: 'hotel',
        preferredHotels: ['Marriott Marquis', 'Hilton Times Square'],
        roomType: 'single',
        nights: 3,
        estimatedCostPerNight: 300,
        specialRequirements: 'Non-smoking room, high floor'
      }
    ],
    transport: [
      {
        id: 'trans-001',
        date: '2024-02-15',
        from: 'San Francisco Airport',
        to: 'Office',
        mode: 'taxi',
        estimatedCost: 50,
        bookingRequired: false
      },
      {
        id: 'trans-002',
        date: '2024-02-15',
        from: 'San Francisco, CA',
        to: 'New York, NY',
        mode: 'flight',
        class: 'economy',
        estimatedCost: 450,
        bookingRequired: true,
        preferredTime: '08:00 AM'
      },
      {
        id: 'trans-003',
        date: '2024-02-18',
        from: 'New York, NY',
        to: 'San Francisco, CA',
        mode: 'flight',
        class: 'economy',
        estimatedCost: 450,
        bookingRequired: true,
        preferredTime: '06:00 PM'
      }
    ],
    advance: {
      id: 'adv-001',
      requestedAmount: 2000,
      approvedAmount: 2000,
      status: 'disbursed',
      disbursedDate: '2024-02-10'
    },
    approvers: [
      {
        id: 'app-001',
        approverLevel: 1,
        approverId: 'mgr-001',
        approverName: 'Michael Chen',
        approverRole: 'Manager',
        status: 'approved',
        approvedDate: '2024-02-05',
        comments: 'Approved - Important client meeting'
      },
      {
        id: 'app-002',
        approverLevel: 2,
        approverId: 'dir-001',
        approverName: 'David Williams',
        approverRole: 'Director',
        status: 'approved',
        approvedDate: '2024-02-06',
        comments: 'Strategic client, approved'
      }
    ],
    bookings: [
      {
        id: 'book-001',
        bookingType: 'flight',
        bookingReference: 'UA123-456-789',
        vendor: 'United Airlines',
        bookingDate: '2024-02-07',
        travelDate: '2024-02-15',
        from: 'San Francisco, CA',
        to: 'New York, NY',
        amount: 450,
        status: 'confirmed',
        bookingUrl: 'https://united.com/booking/UA123-456-789',
        cancellationPolicy: 'Refundable up to 24 hours before departure'
      },
      {
        id: 'book-002',
        bookingType: 'hotel',
        bookingReference: 'MAR-NYC-2024-001',
        vendor: 'Marriott Marquis',
        bookingDate: '2024-02-07',
        travelDate: '2024-02-15',
        amount: 900,
        status: 'confirmed',
        bookingUrl: 'https://marriott.com/booking/MAR-NYC-2024-001',
        cancellationPolicy: 'Free cancellation up to 2 days before check-in'
      }
    ],
    expenses: [
      {
        id: 'exp-001',
        expenseDate: '2024-02-15',
        category: 'transport',
        description: 'Taxi from JFK Airport to hotel',
        amount: 65,
        currency: 'USD',
        receiptUrl: '/receipts/exp-001.pdf',
        isReimbursable: true
      },
      {
        id: 'exp-002',
        expenseDate: '2024-02-16',
        category: 'meals',
        description: 'Client dinner at The Capital Grille',
        amount: 285,
        currency: 'USD',
        receiptUrl: '/receipts/exp-002.pdf',
        isReimbursable: true
      }
    ],
    submittedDate: '2024-02-01',
    approvedDate: '2024-02-06',
    createdBy: 'emp-001',
    createdDate: '2024-02-01',
    lastModified: '2024-02-06'
  },
  {
    id: 'tr-002',
    requestCode: 'TR-2024-002',
    employeeId: 'emp-002',
    employeeName: 'John Smith',
    departmentId: 'dept-002',
    departmentName: 'Engineering',
    managerId: 'mgr-002',
    managerName: 'Lisa Anderson',
    travelType: 'international',
    purpose: 'conference',
    purposeDetails: 'Attending AWS re:Invent 2024 in Las Vegas to learn about latest cloud technologies',
    fromLocation: 'San Francisco, CA',
    toLocation: 'Las Vegas, NV',
    departureDate: '2024-11-28',
    returnDate: '2024-12-02',
    duration: 4,
    estimatedCost: 3500,
    currency: 'USD',
    status: 'submitted',
    itinerary: [
      {
        id: 'itin-003',
        date: '2024-11-28',
        fromLocation: 'San Francisco, CA',
        toLocation: 'Las Vegas, NV',
        departureTime: '10:00 AM',
        arrivalTime: '11:30 AM',
        mode: 'flight',
        notes: 'Southwest Airlines SW789'
      },
      {
        id: 'itin-004',
        date: '2024-12-02',
        fromLocation: 'Las Vegas, NV',
        toLocation: 'San Francisco, CA',
        departureTime: '07:00 PM',
        arrivalTime: '08:30 PM',
        mode: 'flight',
        notes: 'Southwest Airlines SW790'
      }
    ],
    accommodation: [
      {
        id: 'acc-002',
        checkInDate: '2024-11-28',
        checkOutDate: '2024-12-02',
        city: 'Las Vegas',
        accommodationType: 'hotel',
        preferredHotels: ['Venetian Resort', 'MGM Grand'],
        roomType: 'single',
        nights: 4,
        estimatedCostPerNight: 250,
        specialRequirements: 'Near conference venue'
      }
    ],
    transport: [
      {
        id: 'trans-004',
        date: '2024-11-28',
        from: 'San Francisco, CA',
        to: 'Las Vegas, NV',
        mode: 'flight',
        class: 'economy',
        estimatedCost: 250,
        bookingRequired: true,
        preferredTime: '10:00 AM'
      },
      {
        id: 'trans-005',
        date: '2024-12-02',
        from: 'Las Vegas, NV',
        to: 'San Francisco, CA',
        mode: 'flight',
        class: 'economy',
        estimatedCost: 250,
        bookingRequired: true,
        preferredTime: '07:00 PM'
      }
    ],
    advance: {
      id: 'adv-002',
      requestedAmount: 2800,
      status: 'requested'
    },
    approvers: [
      {
        id: 'app-003',
        approverLevel: 1,
        approverId: 'mgr-002',
        approverName: 'Lisa Anderson',
        approverRole: 'Engineering Manager',
        status: 'pending'
      }
    ],
    bookings: [],
    expenses: [],
    submittedDate: '2024-01-20',
    createdBy: 'emp-002',
    createdDate: '2024-01-20',
    lastModified: '2024-01-20'
  },
  {
    id: 'tr-003',
    requestCode: 'TR-2024-003',
    employeeId: 'emp-003',
    employeeName: 'Emily Chen',
    departmentId: 'dept-003',
    departmentName: 'Marketing',
    managerId: 'mgr-003',
    managerName: 'Robert Taylor',
    travelType: 'international',
    purpose: 'training',
    purposeDetails: 'Advanced Digital Marketing certification program in London',
    fromLocation: 'San Francisco, CA',
    toLocation: 'London, UK',
    departureDate: '2024-03-10',
    returnDate: '2024-03-17',
    duration: 7,
    estimatedCost: 5800,
    currency: 'USD',
    status: 'approved',
    itinerary: [
      {
        id: 'itin-005',
        date: '2024-03-10',
        fromLocation: 'San Francisco, CA',
        toLocation: 'London, UK',
        departureTime: '05:00 PM',
        arrivalTime: '11:00 AM +1',
        mode: 'flight',
        notes: 'British Airways BA285'
      },
      {
        id: 'itin-006',
        date: '2024-03-17',
        fromLocation: 'London, UK',
        toLocation: 'San Francisco, CA',
        departureTime: '01:00 PM',
        arrivalTime: '04:00 PM',
        mode: 'flight',
        notes: 'British Airways BA286'
      }
    ],
    accommodation: [
      {
        id: 'acc-003',
        checkInDate: '2024-03-10',
        checkOutDate: '2024-03-17',
        city: 'London',
        accommodationType: 'hotel',
        preferredHotels: ['Premier Inn', 'Travelodge'],
        roomType: 'single',
        nights: 7,
        estimatedCostPerNight: 180,
        specialRequirements: 'Near training center in Central London'
      }
    ],
    transport: [
      {
        id: 'trans-006',
        date: '2024-03-10',
        from: 'San Francisco, CA',
        to: 'London, UK',
        mode: 'flight',
        class: 'premium_economy',
        estimatedCost: 1200,
        bookingRequired: true,
        preferredTime: '05:00 PM'
      },
      {
        id: 'trans-007',
        date: '2024-03-17',
        from: 'London, UK',
        to: 'San Francisco, CA',
        mode: 'flight',
        class: 'premium_economy',
        estimatedCost: 1200,
        bookingRequired: true,
        preferredTime: '01:00 PM'
      }
    ],
    advance: {
      id: 'adv-003',
      requestedAmount: 4640,
      approvedAmount: 4640,
      status: 'approved'
    },
    approvers: [
      {
        id: 'app-004',
        approverLevel: 1,
        approverId: 'mgr-003',
        approverName: 'Robert Taylor',
        approverRole: 'Marketing Director',
        status: 'approved',
        approvedDate: '2024-02-15',
        comments: 'Important for team skill development'
      },
      {
        id: 'app-005',
        approverLevel: 2,
        approverId: 'cmo-001',
        approverName: 'Jennifer Martinez',
        approverRole: 'CMO',
        status: 'approved',
        approvedDate: '2024-02-16',
        comments: 'Approved - strategic investment'
      }
    ],
    bookings: [
      {
        id: 'book-003',
        bookingType: 'flight',
        bookingReference: 'BA285-987-654',
        vendor: 'British Airways',
        bookingDate: '2024-02-17',
        travelDate: '2024-03-10',
        from: 'San Francisco, CA',
        to: 'London, UK',
        amount: 2400,
        status: 'confirmed',
        bookingUrl: 'https://ba.com/booking/BA285-987-654',
        cancellationPolicy: 'Non-refundable, change fee applies'
      },
      {
        id: 'book-004',
        bookingType: 'hotel',
        bookingReference: 'PI-LDN-2024-003',
        vendor: 'Premier Inn',
        bookingDate: '2024-02-17',
        travelDate: '2024-03-10',
        amount: 1260,
        status: 'confirmed',
        bookingUrl: 'https://premierinn.com/booking/PI-LDN-2024-003',
        cancellationPolicy: 'Free cancellation up to 1 day before check-in'
      }
    ],
    expenses: [],
    submittedDate: '2024-02-10',
    approvedDate: '2024-02-16',
    createdBy: 'emp-003',
    createdDate: '2024-02-10',
    lastModified: '2024-02-17'
  },
  {
    id: 'tr-004',
    requestCode: 'TR-2024-004',
    employeeId: 'emp-004',
    employeeName: 'Michael Brown',
    departmentId: 'dept-001',
    departmentName: 'Sales',
    managerId: 'mgr-001',
    managerName: 'Michael Chen',
    travelType: 'domestic',
    purpose: 'site_visit',
    purposeDetails: 'Site visit to new regional office in Austin, Texas',
    fromLocation: 'San Francisco, CA',
    toLocation: 'Austin, TX',
    departureDate: '2024-02-20',
    returnDate: '2024-02-22',
    duration: 2,
    estimatedCost: 1800,
    currency: 'USD',
    status: 'booked',
    itinerary: [
      {
        id: 'itin-007',
        date: '2024-02-20',
        fromLocation: 'San Francisco, CA',
        toLocation: 'Austin, TX',
        departureTime: '09:00 AM',
        arrivalTime: '02:30 PM',
        mode: 'flight',
        notes: 'Delta Airlines DL456'
      },
      {
        id: 'itin-008',
        date: '2024-02-22',
        fromLocation: 'Austin, TX',
        toLocation: 'San Francisco, CA',
        departureTime: '04:00 PM',
        arrivalTime: '06:30 PM',
        mode: 'flight',
        notes: 'Delta Airlines DL457'
      }
    ],
    accommodation: [
      {
        id: 'acc-004',
        checkInDate: '2024-02-20',
        checkOutDate: '2024-02-22',
        city: 'Austin',
        accommodationType: 'hotel',
        preferredHotels: ['Hilton Austin', 'Hyatt Regency'],
        roomType: 'single',
        nights: 2,
        estimatedCostPerNight: 200,
        specialRequirements: 'Downtown location'
      }
    ],
    transport: [
      {
        id: 'trans-008',
        date: '2024-02-20',
        from: 'San Francisco, CA',
        to: 'Austin, TX',
        mode: 'flight',
        class: 'economy',
        estimatedCost: 350,
        bookingRequired: true,
        preferredTime: '09:00 AM'
      },
      {
        id: 'trans-009',
        date: '2024-02-22',
        from: 'Austin, TX',
        to: 'San Francisco, CA',
        mode: 'flight',
        class: 'economy',
        estimatedCost: 350,
        bookingRequired: true,
        preferredTime: '04:00 PM'
      }
    ],
    approvers: [
      {
        id: 'app-006',
        approverLevel: 1,
        approverId: 'mgr-001',
        approverName: 'Michael Chen',
        approverRole: 'Manager',
        status: 'approved',
        approvedDate: '2024-02-12',
        comments: 'Approved for office setup'
      }
    ],
    bookings: [
      {
        id: 'book-005',
        bookingType: 'flight',
        bookingReference: 'DL456-111-222',
        vendor: 'Delta Airlines',
        bookingDate: '2024-02-13',
        travelDate: '2024-02-20',
        from: 'San Francisco, CA',
        to: 'Austin, TX',
        amount: 700,
        status: 'confirmed',
        bookingUrl: 'https://delta.com/booking/DL456-111-222',
        cancellationPolicy: 'Refundable with fee'
      },
      {
        id: 'book-006',
        bookingType: 'hotel',
        bookingReference: 'HLT-AUS-2024-004',
        vendor: 'Hilton Austin',
        bookingDate: '2024-02-13',
        travelDate: '2024-02-20',
        amount: 400,
        status: 'confirmed',
        bookingUrl: 'https://hilton.com/booking/HLT-AUS-2024-004',
        cancellationPolicy: 'Free cancellation up to 24 hours before check-in'
      }
    ],
    expenses: [],
    submittedDate: '2024-02-08',
    approvedDate: '2024-02-12',
    createdBy: 'emp-004',
    createdDate: '2024-02-08',
    lastModified: '2024-02-13'
  },
  {
    id: 'tr-005',
    requestCode: 'TR-2024-005',
    employeeId: 'emp-005',
    employeeName: 'Jessica Lee',
    departmentId: 'dept-004',
    departmentName: 'HR',
    managerId: 'mgr-004',
    managerName: 'Amanda White',
    travelType: 'domestic',
    purpose: 'recruitment',
    purposeDetails: 'Campus recruitment drive at Stanford University',
    fromLocation: 'San Francisco, CA',
    toLocation: 'Palo Alto, CA',
    departureDate: '2024-02-25',
    returnDate: '2024-02-25',
    duration: 0,
    estimatedCost: 150,
    currency: 'USD',
    status: 'completed',
    itinerary: [
      {
        id: 'itin-009',
        date: '2024-02-25',
        fromLocation: 'San Francisco, CA',
        toLocation: 'Palo Alto, CA',
        departureTime: '08:00 AM',
        arrivalTime: '09:00 AM',
        mode: 'car',
        notes: 'Company car'
      },
      {
        id: 'itin-010',
        date: '2024-02-25',
        fromLocation: 'Palo Alto, CA',
        toLocation: 'San Francisco, CA',
        departureTime: '05:00 PM',
        arrivalTime: '06:00 PM',
        mode: 'car',
        notes: 'Company car'
      }
    ],
    accommodation: [],
    transport: [
      {
        id: 'trans-010',
        date: '2024-02-25',
        from: 'San Francisco, CA',
        to: 'Palo Alto, CA',
        mode: 'car',
        estimatedCost: 50,
        bookingRequired: false
      },
      {
        id: 'trans-011',
        date: '2024-02-25',
        from: 'Palo Alto, CA',
        to: 'San Francisco, CA',
        mode: 'car',
        estimatedCost: 50,
        bookingRequired: false
      }
    ],
    approvers: [
      {
        id: 'app-007',
        approverLevel: 1,
        approverId: 'mgr-004',
        approverName: 'Amanda White',
        approverRole: 'HR Director',
        status: 'approved',
        approvedDate: '2024-02-18',
        comments: 'Approved - talent acquisition priority'
      }
    ],
    bookings: [],
    expenses: [
      {
        id: 'exp-003',
        expenseDate: '2024-02-25',
        category: 'meals',
        description: 'Lunch with candidates',
        amount: 75,
        currency: 'USD',
        receiptUrl: '/receipts/exp-003.pdf',
        isReimbursable: true
      },
      {
        id: 'exp-004',
        expenseDate: '2024-02-25',
        category: 'transport',
        description: 'Parking at Stanford',
        amount: 25,
        currency: 'USD',
        receiptUrl: '/receipts/exp-004.pdf',
        isReimbursable: true
      }
    ],
    submittedDate: '2024-02-15',
    approvedDate: '2024-02-18',
    completedDate: '2024-02-25',
    createdBy: 'emp-005',
    createdDate: '2024-02-15',
    lastModified: '2024-02-25'
  }
];

// Sample Travel Policies
export const sampleTravelPolicies: TravelPolicy[] = [
  {
    id: 'pol-001',
    policyName: 'Executive Travel Policy',
    isActive: true,
    applicableGrades: ['C-Level', 'VP', 'SVP'],
    domesticFlightClass: 'business',
    internationalFlightClass: 'business',
    hotelBudgetPerNight: {
      tier1: 400,
      tier2: 300,
      tier3: 250
    },
    perDiemRates: {
      domestic: 100,
      international: 150
    },
    advancePercentage: 80,
    requiresApproval: true,
    approvalLevels: 1,
    bookingLeadTime: 7,
    createdBy: 'admin-001',
    createdDate: '2024-01-01'
  },
  {
    id: 'pol-002',
    policyName: 'Manager Travel Policy',
    isActive: true,
    applicableGrades: ['Manager', 'Senior Manager', 'Director'],
    domesticFlightClass: 'premium_economy',
    internationalFlightClass: 'premium_economy',
    hotelBudgetPerNight: {
      tier1: 250,
      tier2: 200,
      tier3: 150
    },
    perDiemRates: {
      domestic: 75,
      international: 100
    },
    advancePercentage: 75,
    requiresApproval: true,
    approvalLevels: 2,
    bookingLeadTime: 10,
    createdBy: 'admin-001',
    createdDate: '2024-01-01'
  },
  {
    id: 'pol-003',
    policyName: 'Standard Travel Policy',
    isActive: true,
    applicableGrades: ['Staff', 'Senior Staff', 'Lead'],
    domesticFlightClass: 'economy',
    internationalFlightClass: 'economy',
    hotelBudgetPerNight: {
      tier1: 180,
      tier2: 150,
      tier3: 120
    },
    perDiemRates: {
      domestic: 50,
      international: 75
    },
    advancePercentage: 70,
    requiresApproval: true,
    approvalLevels: 2,
    bookingLeadTime: 14,
    createdBy: 'admin-001',
    createdDate: '2024-01-01'
  }
];

// Sample Travel Metrics
export const sampleTravelMetrics: TravelMetrics = {
  totalRequests: 125,
  approvedRequests: 98,
  rejectedRequests: 12,
  totalTravelCost: 287500,
  averageTravelCost: 2933,
  travelByPurpose: [
    { purpose: 'client_meeting', count: 45, cost: 112500 },
    { purpose: 'conference', count: 28, cost: 98000 },
    { purpose: 'training', count: 22, cost: 44000 },
    { purpose: 'site_visit', count: 15, cost: 22500 },
    { purpose: 'recruitment', count: 10, cost: 7500 },
    { purpose: 'team_building', count: 3, cost: 3000 }
  ],
  travelByDepartment: [
    { departmentId: 'dept-001', departmentName: 'Sales', count: 42, cost: 126000 },
    { departmentId: 'dept-002', departmentName: 'Engineering', count: 31, cost: 77500 },
    { departmentId: 'dept-003', departmentName: 'Marketing', count: 24, cost: 60000 },
    { departmentId: 'dept-004', departmentName: 'HR', count: 18, cost: 18000 },
    { departmentId: 'dept-005', departmentName: 'Finance', count: 10, cost: 6000 }
  ],
  topTravelers: [
    { employeeId: 'emp-001', employeeName: 'Sarah Johnson', trips: 12, cost: 30000 },
    { employeeId: 'emp-002', employeeName: 'John Smith', trips: 10, cost: 35000 },
    { employeeId: 'emp-003', employeeName: 'Emily Chen', trips: 9, cost: 27000 },
    { employeeId: 'emp-004', employeeName: 'Michael Brown', trips: 8, cost: 24000 },
    { employeeId: 'emp-005', employeeName: 'Jessica Lee', trips: 7, cost: 14000 }
  ]
};

// Sample Travel Settings
export const sampleTravelSettings: TravelSettings = {
  requireApproval: true,
  approvalLevels: 2,
  allowSelfBooking: false,
  advanceAllowed: true,
  maxAdvancePercentage: 80,
  travelAgencyIntegration: false,
  notificationEmail: 'travel@company.com'
};

// Helper function to generate travel request code
export const generateTravelRequestCode = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TR-${year}-${random}`;
};

// Helper function to calculate trip duration
export const calculateDuration = (departureDate: string, returnDate: string): number => {
  const departure = new Date(departureDate);
  const returnD = new Date(returnDate);
  const diffTime = Math.abs(returnD.getTime() - departure.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Helper function to get applicable policy
export const getApplicablePolicy = (employeeGrade: string): TravelPolicy | undefined => {
  return sampleTravelPolicies.find(policy =>
    policy.isActive && policy.applicableGrades.includes(employeeGrade)
  );
};

// Export all data
export const travelData = {
  requests: sampleTravelRequests,
  policies: sampleTravelPolicies,
  metrics: sampleTravelMetrics,
  settings: sampleTravelSettings
};
