// @ts-nocheck — Dev/demo seed data, intentionally loose-typed.
/**
 * Employee Recognition & Rewards Module - Sample Data
 * Comprehensive sample data for immediate testing
 */

import type {
  Recognition,
  Badge,
  EmployeeBadge,
  RewardsCatalog,
  Redemption,
  PointsTransaction,
  EmployeePoints,
  RecognitionProgram,
  Nomination,
  Award,
  RecognitionLeaderboard,
  RecognitionMetrics,
  RecognitionSettings,
  CoreValue,
  RecognitionNotification,
  RecognitionAuditLog
} from './types';
import {
  RecognitionReport
} from './types';

// Core Company Values
export const sampleCoreValues: CoreValue[] = [
  {
    id: 'cv-001',
    valueName: 'Innovation',
    description: 'We embrace creativity and continuous improvement',
    examples: [
      'Proposing new ideas and solutions',
      'Taking calculated risks',
      'Learning from failures'
    ],
    iconUrl: '/icons/innovation.svg',
    color: '#8B5CF6',
    displayOrder: 1,
    isActive: true
  },
  {
    id: 'cv-002',
    valueName: 'Teamwork',
    description: 'We collaborate and support each other',
    examples: [
      'Helping colleagues succeed',
      'Sharing knowledge freely',
      'Working across teams'
    ],
    iconUrl: '/icons/teamwork.svg',
    color: '#3B82F6',
    displayOrder: 2,
    isActive: true
  },
  {
    id: 'cv-003',
    valueName: 'Excellence',
    description: 'We deliver exceptional quality in everything we do',
    examples: [
      'Going above and beyond',
      'Attention to detail',
      'Continuous learning'
    ],
    iconUrl: '/icons/excellence.svg',
    color: '#10B981',
    displayOrder: 3,
    isActive: true
  },
  {
    id: 'cv-004',
    valueName: 'Integrity',
    description: 'We act with honesty and strong moral principles',
    examples: [
      'Doing the right thing',
      'Being transparent',
      'Accountability'
    ],
    iconUrl: '/icons/integrity.svg',
    color: '#F59E0B',
    displayOrder: 4,
    isActive: true
  },
  {
    id: 'cv-005',
    valueName: 'Customer Focus',
    description: 'We put our customers at the heart of everything',
    examples: [
      'Understanding customer needs',
      'Exceeding expectations',
      'Building lasting relationships'
    ],
    iconUrl: '/icons/customer.svg',
    color: '#EF4444',
    displayOrder: 5,
    isActive: true
  }
];

// Sample Recognitions
export const sampleRecognitions: Recognition[] = [
  {
    id: 'rec-001',
    recognitionCode: 'REC-2024-001',
    recognitionType: 'peer_to_peer',
    category: 'teamwork',
    status: 'published',
    senderId: 'emp-001',
    senderName: 'Sarah Johnson',
    senderEmail: 'sarah.johnson@company.com',
    senderDepartment: 'Engineering',
    recipientId: 'emp-002',
    recipientName: 'Michael Chen',
    recipientEmail: 'michael.chen@company.com',
    recipientDepartment: 'Engineering',
    programId: 'prog-001',
    programName: 'Peer Recognition Program',
    title: 'Outstanding Collaboration on Q4 Release',
    message: 'Michael went above and beyond to help our team meet the Q4 deadline. His expertise in backend architecture and willingness to mentor junior developers made all the difference. He stayed late to help debug critical issues and was always available for questions.',
    coreValues: ['cv-002', 'cv-003'],
    visibility: 'company',
    isAnonymous: false,
    rewards: [
      {
        id: 'rw-001',
        rewardType: 'points',
        rewardName: 'Recognition Points',
        pointsValue: 500,
        description: 'Standard peer recognition points'
      },
      {
        id: 'rw-002',
        rewardType: 'badge',
        rewardName: 'Team Player',
        pointsValue: 100,
        badgeId: 'badge-001'
      }
    ],
    totalPointsAwarded: 600,
    badges: ['badge-001'],
    attachments: [],
    reactions: [
      {
        id: 'react-001',
        userId: 'emp-003',
        userName: 'Emily Davis',
        emoji: '🎉',
        reactionType: 'celebrate',
        createdDate: '2024-01-15T14:30:00Z'
      },
      {
        id: 'react-002',
        userId: 'emp-004',
        userName: 'David Wilson',
        emoji: '❤️',
        reactionType: 'love',
        createdDate: '2024-01-15T15:00:00Z'
      },
      {
        id: 'react-003',
        userId: 'emp-005',
        userName: 'Lisa Anderson',
        emoji: '💡',
        reactionType: 'inspire',
        createdDate: '2024-01-15T15:30:00Z'
      }
    ],
    comments: [
      {
        id: 'comm-001',
        recognitionId: 'rec-001',
        userId: 'emp-003',
        userName: 'Emily Davis',
        comment: 'Well deserved! Michael is always so helpful.',
        mentions: ['emp-002'],
        createdDate: '2024-01-15T14:45:00Z'
      },
      {
        id: 'comm-002',
        recognitionId: 'rec-001',
        userId: 'emp-002',
        userName: 'Michael Chen',
        comment: 'Thank you Sarah! It was a team effort.',
        mentions: ['emp-001'],
        createdDate: '2024-01-15T16:00:00Z'
      }
    ],
    viewCount: 47,
    isPublished: true,
    publishedDate: '2024-01-15T14:00:00Z',
    approvalRequired: false,
    relatedRecognitions: [],
    tags: ['teamwork', 'collaboration', 'q4-release'],
    createdDate: '2024-01-15T14:00:00Z',
    lastModified: '2024-01-15T16:00:00Z'
  },
  {
    id: 'rec-002',
    recognitionCode: 'REC-2024-002',
    recognitionType: 'manager_to_employee',
    category: 'innovation',
    status: 'published',
    senderId: 'emp-006',
    senderName: 'Robert Thompson',
    senderEmail: 'robert.thompson@company.com',
    senderDepartment: 'Product',
    recipientId: 'emp-007',
    recipientName: 'Jessica Martinez',
    recipientEmail: 'jessica.martinez@company.com',
    recipientDepartment: 'Product',
    programId: 'prog-002',
    programName: 'Innovation Awards',
    title: 'Revolutionary AI Feature Design',
    message: 'Jessica designed and led the implementation of our new AI-powered recommendation engine. Her innovative approach increased user engagement by 45% and has become a key differentiator for our product. This is exactly the kind of forward-thinking innovation we need.',
    coreValues: ['cv-001', 'cv-003'],
    visibility: 'company',
    isAnonymous: false,
    rewards: [
      {
        id: 'rw-003',
        rewardType: 'points',
        rewardName: 'Manager Recognition Points',
        pointsValue: 1000,
        description: 'Manager recognition with 2x multiplier'
      },
      {
        id: 'rw-004',
        rewardType: 'badge',
        rewardName: 'Innovation Champion',
        pointsValue: 250,
        badgeId: 'badge-002'
      },
      {
        id: 'rw-005',
        rewardType: 'gift_card',
        rewardName: 'Amazon Gift Card',
        pointsValue: 0,
        monetaryValue: 100,
        currency: 'USD',
        description: '$100 Amazon gift card'
      }
    ],
    totalPointsAwarded: 1250,
    badges: ['badge-002'],
    attachments: [
      {
        id: 'att-001',
        fileName: 'ai-feature-metrics.pdf',
        fileUrl: '/attachments/ai-feature-metrics.pdf',
        fileSize: 245000,
        fileType: 'application/pdf',
        uploadedBy: 'emp-006',
        uploadedDate: '2024-01-16T10:00:00Z'
      }
    ],
    reactions: [
      {
        id: 'react-004',
        userId: 'emp-001',
        userName: 'Sarah Johnson',
        emoji: '🚀',
        reactionType: 'inspire',
        createdDate: '2024-01-16T11:00:00Z'
      },
      {
        id: 'react-005',
        userId: 'emp-008',
        userName: 'James Brown',
        emoji: '👏',
        reactionType: 'celebrate',
        createdDate: '2024-01-16T11:30:00Z'
      }
    ],
    comments: [
      {
        id: 'comm-003',
        recognitionId: 'rec-002',
        userId: 'emp-009',
        userName: 'CEO - John Smith',
        comment: 'Incredible work Jessica! This is the kind of innovation that will drive our success.',
        mentions: ['emp-007'],
        createdDate: '2024-01-16T12:00:00Z'
      }
    ],
    viewCount: 89,
    isPublished: true,
    publishedDate: '2024-01-16T10:30:00Z',
    approvalRequired: true,
    approvedBy: 'emp-009',
    approvedByName: 'John Smith',
    approvedDate: '2024-01-16T10:25:00Z',
    relatedRecognitions: [],
    tags: ['innovation', 'ai', 'product', 'engagement'],
    createdDate: '2024-01-16T10:00:00Z',
    lastModified: '2024-01-16T12:00:00Z'
  },
  {
    id: 'rec-003',
    recognitionCode: 'REC-2024-003',
    recognitionType: 'spot_award',
    category: 'customer_service',
    status: 'approved',
    senderId: 'emp-010',
    senderName: 'Amanda White',
    senderEmail: 'amanda.white@company.com',
    senderDepartment: 'Customer Success',
    recipientId: 'emp-011',
    recipientName: 'Kevin Garcia',
    recipientEmail: 'kevin.garcia@company.com',
    recipientDepartment: 'Support',
    title: 'Crisis Resolution Excellence',
    message: 'Kevin handled a critical customer escalation with exceptional professionalism. The customer was threatening to churn, but Kevin\'s empathy and problem-solving skills turned the situation around. They\'re now our biggest advocate and upgraded their plan!',
    coreValues: ['cv-005', 'cv-003'],
    visibility: 'public',
    isAnonymous: false,
    rewards: [
      {
        id: 'rw-006',
        rewardType: 'points',
        rewardName: 'Spot Award Points',
        pointsValue: 750,
        description: 'Spot award for exceptional performance'
      },
      {
        id: 'rw-007',
        rewardType: 'monetary',
        rewardName: 'Spot Bonus',
        pointsValue: 0,
        monetaryValue: 250,
        currency: 'USD',
        description: 'One-time bonus for crisis resolution'
      }
    ],
    totalPointsAwarded: 750,
    badges: [],
    attachments: [],
    reactions: [],
    comments: [],
    viewCount: 23,
    isPublished: false,
    approvalRequired: true,
    approvedBy: 'emp-012',
    approvedByName: 'Director - Susan Lee',
    approvedDate: '2024-01-17T09:00:00Z',
    relatedRecognitions: [],
    tags: ['customer-service', 'crisis-management', 'retention'],
    createdDate: '2024-01-17T08:00:00Z',
    lastModified: '2024-01-17T09:00:00Z'
  }
];

// Sample Badges
export const sampleBadges: Badge[] = [
  {
    id: 'badge-001',
    badgeCode: 'BADGE-TEAMPLAYER',
    badgeName: 'Team Player',
    description: 'Awarded for exceptional collaboration and teamwork',
    category: 'teamwork',
    level: 'gold',
    iconUrl: '/badges/team-player.svg',
    criteria: {
      criteriaType: 'manual',
      requirements: [
        'Demonstrates consistent collaboration',
        'Helps team members succeed',
        'Positive team feedback'
      ]
    },
    pointsValue: 100,
    rarity: 'uncommon',
    isActive: true,
    isAutoAwarded: false,
    totalAwarded: 47,
    createdBy: 'emp-009',
    createdDate: '2023-01-01T00:00:00Z'
  },
  {
    id: 'badge-002',
    badgeCode: 'BADGE-INNOVATION',
    badgeName: 'Innovation Champion',
    description: 'Awarded for groundbreaking ideas and creative solutions',
    category: 'innovation',
    level: 'platinum',
    iconUrl: '/badges/innovation-champion.svg',
    criteria: {
      criteriaType: 'manual',
      requirements: [
        'Proposes innovative solutions',
        'Implements new approaches',
        'Drives measurable impact'
      ]
    },
    pointsValue: 250,
    rarity: 'rare',
    isActive: true,
    isAutoAwarded: false,
    totalAwarded: 23,
    createdBy: 'emp-009',
    createdDate: '2023-01-01T00:00:00Z'
  },
  {
    id: 'badge-003',
    badgeCode: 'BADGE-MILESTONE-1YR',
    badgeName: '1 Year Anniversary',
    description: 'Celebrating your first year with the company',
    category: 'culture',
    level: 'bronze',
    iconUrl: '/badges/1-year.svg',
    criteria: {
      criteriaType: 'automatic',
      requirements: ['Complete 1 year of employment'],
      threshold: 365,
      timeframe: 'days'
    },
    pointsValue: 200,
    rarity: 'common',
    isActive: true,
    isAutoAwarded: true,
    totalAwarded: 156,
    createdBy: 'system',
    createdDate: '2023-01-01T00:00:00Z'
  },
  {
    id: 'badge-004',
    badgeCode: 'BADGE-EXCELLENCE',
    badgeName: 'Excellence Award',
    description: 'The highest honor for outstanding performance',
    category: 'performance',
    level: 'diamond',
    iconUrl: '/badges/excellence.svg',
    criteria: {
      criteriaType: 'achievement',
      requirements: [
        'Exceptional performance ratings',
        'Multiple peer recognitions',
        'Significant business impact'
      ]
    },
    pointsValue: 500,
    rarity: 'legendary',
    isActive: true,
    isAutoAwarded: false,
    totalAwarded: 8,
    createdBy: 'emp-009',
    createdDate: '2023-01-01T00:00:00Z'
  },
  {
    id: 'badge-005',
    badgeCode: 'BADGE-CUSTOMER-HERO',
    badgeName: 'Customer Hero',
    description: 'Awarded for exceptional customer service',
    category: 'customer_service',
    level: 'gold',
    iconUrl: '/badges/customer-hero.svg',
    criteria: {
      criteriaType: 'manual',
      requirements: [
        'Outstanding customer feedback',
        'Resolves complex issues',
        'Goes above and beyond'
      ]
    },
    pointsValue: 150,
    rarity: 'uncommon',
    isActive: true,
    isAutoAwarded: false,
    totalAwarded: 34,
    createdBy: 'emp-009',
    createdDate: '2023-01-01T00:00:00Z'
  }
];

// Sample Employee Badges
export const sampleEmployeeBadges: EmployeeBadge[] = [
  {
    id: 'eb-001',
    employeeId: 'emp-002',
    employeeName: 'Michael Chen',
    badgeId: 'badge-001',
    badgeName: 'Team Player',
    badgeLevel: 'gold',
    awardedBy: 'emp-001',
    awardedByName: 'Sarah Johnson',
    awardedDate: '2024-01-15T14:00:00Z',
    recognitionId: 'rec-001',
    reason: 'Outstanding collaboration on Q4 release',
    displayOnProfile: true
  },
  {
    id: 'eb-002',
    employeeId: 'emp-007',
    employeeName: 'Jessica Martinez',
    badgeId: 'badge-002',
    badgeName: 'Innovation Champion',
    badgeLevel: 'platinum',
    awardedBy: 'emp-006',
    awardedByName: 'Robert Thompson',
    awardedDate: '2024-01-16T10:30:00Z',
    recognitionId: 'rec-002',
    reason: 'Revolutionary AI feature design',
    displayOnProfile: true
  },
  {
    id: 'eb-003',
    employeeId: 'emp-002',
    employeeName: 'Michael Chen',
    badgeId: 'badge-003',
    badgeName: '1 Year Anniversary',
    badgeLevel: 'bronze',
    awardedBy: 'system',
    awardedByName: 'System',
    awardedDate: '2024-01-10T00:00:00Z',
    reason: 'Completed 1 year of employment',
    displayOnProfile: true
  }
];

// Sample Rewards Catalog
export const sampleRewardsCatalog: RewardsCatalog[] = [
  {
    id: 'cat-001',
    itemCode: 'GC-AMAZON-25',
    itemName: '$25 Amazon Gift Card',
    description: 'Redeem for a $25 Amazon gift card to purchase anything you want',
    category: 'Gift Cards',
    rewardType: 'gift_card',
    pointsCost: 2500,
    monetaryValue: 25,
    currency: 'USD',
    imageUrl: '/catalog/amazon-gc.jpg',
    vendor: 'Amazon',
    isAvailable: true,
    features: ['Instant delivery', 'No expiration', 'Millions of products'],
    terms: [
      'Gift card will be emailed within 24 hours',
      'Valid only on Amazon.com',
      'Cannot be redeemed for cash'
    ],
    deliveryTimeframe: 'Instant',
    totalRedeemed: 234,
    rating: 4.8,
    reviews: [
      {
        id: 'rev-001',
        catalogItemId: 'cat-001',
        employeeId: 'emp-013',
        employeeName: 'Tom Harris',
        rating: 5,
        review: 'Super easy to redeem and use. Great selection!',
        createdDate: '2024-01-10T15:00:00Z'
      }
    ],
    tags: ['popular', 'gift-card', 'amazon'],
    isActive: true,
    createdDate: '2023-01-01T00:00:00Z',
    lastModified: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat-002',
    itemCode: 'GC-STARBUCKS-10',
    itemName: '$10 Starbucks Gift Card',
    description: 'Enjoy your favorite coffee on us',
    category: 'Gift Cards',
    rewardType: 'gift_card',
    pointsCost: 1000,
    monetaryValue: 10,
    currency: 'USD',
    imageUrl: '/catalog/starbucks-gc.jpg',
    vendor: 'Starbucks',
    isAvailable: true,
    features: ['Mobile or physical card', 'Reload anytime', 'Earn Stars'],
    terms: [
      'Valid at all Starbucks locations',
      'Can be combined with other offers',
      'Balance never expires'
    ],
    deliveryTimeframe: 'Instant',
    totalRedeemed: 567,
    rating: 4.9,
    reviews: [],
    tags: ['popular', 'coffee', 'food-beverage'],
    isActive: true,
    createdDate: '2023-01-01T00:00:00Z',
    lastModified: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat-003',
    itemCode: 'TECH-AIRPODS-PRO',
    itemName: 'Apple AirPods Pro (2nd Gen)',
    description: 'Premium wireless earbuds with active noise cancellation',
    category: 'Electronics',
    rewardType: 'physical_item',
    pointsCost: 24900,
    monetaryValue: 249,
    currency: 'USD',
    imageUrl: '/catalog/airpods-pro.jpg',
    vendor: 'Apple',
    stockQuantity: 15,
    isAvailable: true,
    features: [
      'Active Noise Cancellation',
      'Adaptive Transparency',
      'Personalized Spatial Audio',
      'Up to 6 hours listening time'
    ],
    terms: [
      'Limited stock available',
      'Ships within 5-7 business days',
      'Standard manufacturer warranty applies'
    ],
    deliveryTimeframe: '5-7 business days',
    totalRedeemed: 45,
    rating: 4.7,
    reviews: [],
    tags: ['premium', 'electronics', 'audio'],
    isActive: true,
    createdDate: '2023-06-01T00:00:00Z',
    lastModified: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat-004',
    itemCode: 'EXP-SPA-DAY',
    itemName: 'Luxury Spa Day Experience',
    description: 'Full day spa package including massage, facial, and treatments',
    category: 'Experiences',
    rewardType: 'experience',
    pointsCost: 15000,
    monetaryValue: 150,
    currency: 'USD',
    imageUrl: '/catalog/spa-day.jpg',
    vendor: 'Local Spa Partners',
    isAvailable: true,
    features: [
      '90-minute massage',
      '60-minute facial',
      'Access to all spa facilities',
      'Refreshments included'
    ],
    terms: [
      'Booking required in advance',
      'Valid at participating locations',
      'Valid for 12 months from redemption'
    ],
    deliveryTimeframe: 'Voucher within 24 hours',
    totalRedeemed: 89,
    rating: 4.9,
    reviews: [],
    tags: ['wellness', 'experience', 'relaxation'],
    isActive: true,
    createdDate: '2023-03-01T00:00:00Z',
    lastModified: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat-005',
    itemCode: 'SWAG-HOODIE',
    itemName: 'Company Branded Hoodie',
    description: 'Premium quality hoodie with company logo',
    category: 'Company Swag',
    rewardType: 'physical_item',
    pointsCost: 3500,
    monetaryValue: 35,
    currency: 'USD',
    imageUrl: '/catalog/company-hoodie.jpg',
    stockQuantity: 250,
    isAvailable: true,
    features: [
      'Available in all sizes',
      '80% cotton, 20% polyester',
      'Embroidered logo',
      'Multiple color options'
    ],
    terms: [
      'Select size during checkout',
      'Ships within 3-5 business days',
      'Exchange policy applies'
    ],
    deliveryTimeframe: '3-5 business days',
    totalRedeemed: 312,
    rating: 4.6,
    reviews: [],
    tags: ['swag', 'apparel', 'company-branded'],
    isActive: true,
    createdDate: '2023-01-01T00:00:00Z',
    lastModified: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat-006',
    itemCode: 'TIME-EXTRA-PTO',
    itemName: 'Extra PTO Day',
    description: 'Additional paid time off day to use anytime',
    category: 'Time Off',
    rewardType: 'time_off',
    pointsCost: 8000,
    monetaryValue: 200,
    currency: 'USD',
    imageUrl: '/catalog/pto-day.jpg',
    isAvailable: true,
    minRedemptionLevel: 'gold',
    features: [
      'Use anytime within the year',
      'No blackout dates',
      'Can be combined with regular PTO',
      'Automatic approval'
    ],
    terms: [
      'Must be used within current calendar year',
      'Subject to manager notification',
      'Cannot be converted to cash'
    ],
    deliveryTimeframe: 'Added to PTO balance immediately',
    totalRedeemed: 178,
    rating: 5.0,
    reviews: [],
    tags: ['premium', 'time-off', 'pto', 'work-life-balance'],
    isActive: true,
    createdDate: '2023-01-01T00:00:00Z',
    lastModified: '2024-01-01T00:00:00Z'
  }
];

// Sample Redemptions
export const sampleRedemptions: Redemption[] = [
  {
    id: 'red-001',
    redemptionCode: 'RED-2024-001',
    employeeId: 'emp-002',
    employeeName: 'Michael Chen',
    employeeEmail: 'michael.chen@company.com',
    catalogItemId: 'cat-001',
    catalogItemName: '$25 Amazon Gift Card',
    rewardType: 'gift_card',
    pointsCost: 2500,
    quantity: 1,
    totalPointsCost: 2500,
    status: 'delivered',
    notes: 'Gift card code emailed successfully',
    processedBy: 'system',
    processedDate: '2024-01-15T15:00:00Z',
    createdDate: '2024-01-15T15:00:00Z',
    lastModified: '2024-01-15T15:05:00Z'
  },
  {
    id: 'red-002',
    redemptionCode: 'RED-2024-002',
    employeeId: 'emp-007',
    employeeName: 'Jessica Martinez',
    employeeEmail: 'jessica.martinez@company.com',
    catalogItemId: 'cat-004',
    catalogItemName: 'Luxury Spa Day Experience',
    rewardType: 'experience',
    pointsCost: 15000,
    quantity: 1,
    totalPointsCost: 15000,
    status: 'approved',
    notes: 'Voucher code sent via email',
    processedBy: 'emp-014',
    processedDate: '2024-01-16T14:00:00Z',
    createdDate: '2024-01-16T12:00:00Z',
    lastModified: '2024-01-16T14:00:00Z'
  },
  {
    id: 'red-003',
    redemptionCode: 'RED-2024-003',
    employeeId: 'emp-011',
    employeeName: 'Kevin Garcia',
    employeeEmail: 'kevin.garcia@company.com',
    catalogItemId: 'cat-003',
    catalogItemName: 'Apple AirPods Pro (2nd Gen)',
    rewardType: 'physical_item',
    pointsCost: 24900,
    quantity: 1,
    totalPointsCost: 24900,
    status: 'shipped',
    shippingAddress: {
      fullName: 'Kevin Garcia',
      addressLine1: '123 Main Street',
      addressLine2: 'Apt 4B',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA',
      phoneNumber: '+1-555-0123'
    },
    trackingNumber: '1Z999AA10123456784',
    estimatedDelivery: '2024-01-25T00:00:00Z',
    processedBy: 'emp-014',
    processedDate: '2024-01-18T10:00:00Z',
    createdDate: '2024-01-17T16:00:00Z',
    lastModified: '2024-01-18T10:00:00Z'
  }
];

// Sample Points Transactions
export const samplePointsTransactions: PointsTransaction[] = [
  {
    id: 'pt-001',
    transactionCode: 'PT-2024-001',
    employeeId: 'emp-002',
    employeeName: 'Michael Chen',
    transactionType: 'earned',
    points: 600,
    balance: 8100,
    source: 'recognition',
    recognitionId: 'rec-001',
    description: 'Recognition: Outstanding Collaboration on Q4 Release',
    expiryDate: '2025-01-15T14:00:00Z',
    createdDate: '2024-01-15T14:00:00Z'
  },
  {
    id: 'pt-002',
    transactionCode: 'PT-2024-002',
    employeeId: 'emp-002',
    employeeName: 'Michael Chen',
    transactionType: 'redeemed',
    points: -2500,
    balance: 5600,
    source: 'redemption',
    redemptionId: 'red-001',
    description: 'Redeemed: $25 Amazon Gift Card',
    createdDate: '2024-01-15T15:00:00Z'
  },
  {
    id: 'pt-003',
    transactionCode: 'PT-2024-003',
    employeeId: 'emp-007',
    employeeName: 'Jessica Martinez',
    transactionType: 'earned',
    points: 1250,
    balance: 18750,
    source: 'recognition',
    recognitionId: 'rec-002',
    description: 'Recognition: Revolutionary AI Feature Design',
    expiryDate: '2025-01-16T10:30:00Z',
    createdDate: '2024-01-16T10:30:00Z'
  },
  {
    id: 'pt-004',
    transactionCode: 'PT-2024-004',
    employeeId: 'emp-007',
    employeeName: 'Jessica Martinez',
    transactionType: 'redeemed',
    points: -15000,
    balance: 3750,
    source: 'redemption',
    redemptionId: 'red-002',
    description: 'Redeemed: Luxury Spa Day Experience',
    createdDate: '2024-01-16T12:00:00Z'
  },
  {
    id: 'pt-005',
    transactionCode: 'PT-2024-005',
    employeeId: 'emp-011',
    employeeName: 'Kevin Garcia',
    transactionType: 'earned',
    points: 750,
    balance: 26400,
    source: 'recognition',
    recognitionId: 'rec-003',
    description: 'Spot Award: Crisis Resolution Excellence',
    expiryDate: '2025-01-17T08:00:00Z',
    createdDate: '2024-01-17T08:00:00Z'
  },
  {
    id: 'pt-006',
    transactionCode: 'PT-2024-006',
    employeeId: 'emp-011',
    employeeName: 'Kevin Garcia',
    transactionType: 'bonus',
    points: 1000,
    balance: 2400,
    source: 'monthly_bonus',
    description: 'Monthly Performance Bonus',
    expiryDate: '2025-02-01T00:00:00Z',
    processedBy: 'system',
    createdDate: '2024-01-01T00:00:00Z'
  }
];

// Sample Employee Points
export const sampleEmployeePoints: EmployeePoints[] = [
  {
    employeeId: 'emp-002',
    employeeName: 'Michael Chen',
    currentBalance: 5600,
    lifetimeEarned: 12300,
    lifetimeRedeemed: 6700,
    expiringSoon: 500,
    nextExpiryDate: '2024-02-15T00:00:00Z',
    tier: {
      tierName: 'Gold',
      minPoints: 5000,
      maxPoints: 14999,
      benefits: [
        '10% bonus on points earned',
        'Early access to new catalog items',
        'Priority redemption processing'
      ],
      multiplier: 1.1
    },
    transactions: [samplePointsTransactions[0], samplePointsTransactions[1]],
    lastEarned: '2024-01-15T14:00:00Z',
    lastRedeemed: '2024-01-15T15:00:00Z'
  },
  {
    employeeId: 'emp-007',
    employeeName: 'Jessica Martinez',
    currentBalance: 3750,
    lifetimeEarned: 28900,
    lifetimeRedeemed: 25150,
    expiringSoon: 0,
    tier: {
      tierName: 'Silver',
      minPoints: 2500,
      maxPoints: 4999,
      benefits: [
        '5% bonus on points earned',
        'Access to exclusive rewards'
      ],
      multiplier: 1.05
    },
    transactions: [samplePointsTransactions[2], samplePointsTransactions[3]],
    lastEarned: '2024-01-16T10:30:00Z',
    lastRedeemed: '2024-01-16T12:00:00Z'
  },
  {
    employeeId: 'emp-011',
    employeeName: 'Kevin Garcia',
    currentBalance: 2400,
    lifetimeEarned: 45600,
    lifetimeRedeemed: 43200,
    expiringSoon: 200,
    nextExpiryDate: '2024-02-20T00:00:00Z',
    tier: {
      tierName: 'Silver',
      minPoints: 2500,
      maxPoints: 4999,
      benefits: [
        '5% bonus on points earned',
        'Access to exclusive rewards'
      ],
      multiplier: 1.05
    },
    transactions: [samplePointsTransactions[4], samplePointsTransactions[5]],
    lastEarned: '2024-01-17T08:00:00Z'
  }
];

// Sample Recognition Programs
export const sampleRecognitionPrograms: RecognitionProgram[] = [
  {
    id: 'prog-001',
    programCode: 'PROG-PEER-2024',
    programName: 'Peer Recognition Program',
    description: 'Empower employees to recognize and appreciate their colleagues\' contributions',
    programType: 'peer_to_peer',
    category: 'teamwork',
    status: 'active',
    startDate: '2024-01-01T00:00:00Z',
    budget: {
      totalBudget: 100000,
      spentAmount: 23450,
      remainingAmount: 76550,
      currency: 'USD',
      fiscalYear: '2024'
    },
    eligibility: {
      departments: [],
      locations: [],
      jobLevels: [],
      employeeTypes: ['full_time', 'part_time'],
      minTenure: 30
    },
    rules: [
      {
        id: 'rule-001',
        ruleName: 'Recognition Limit',
        ruleType: 'limit',
        description: 'Maximum recognitions per employee per month',
        condition: 'recognitions_sent > 10',
        action: 'block',
        isActive: true
      },
      {
        id: 'rule-002',
        ruleName: 'Points Range',
        ruleType: 'limit',
        description: 'Points must be between 50 and 1000',
        condition: 'points < 50 OR points > 1000',
        action: 'validate',
        isActive: true
      }
    ],
    rewards: [
      {
        rewardType: 'points',
        rewardName: 'Recognition Points',
        pointsValue: 500,
        isDefault: true
      },
      {
        rewardType: 'badge',
        rewardName: 'Team Player Badge',
        pointsValue: 100,
        isDefault: false
      }
    ],
    requiresApproval: false,
    approvers: [],
    visibility: 'company',
    allowNominations: false,
    allowPeerRecognition: true,
    frequency: 'one_time',
    participantCount: 234,
    recognitionCount: 1567,
    pointsDistributed: 783500,
    isActive: true,
    createdBy: 'emp-009',
    createdDate: '2024-01-01T00:00:00Z',
    lastModified: '2024-01-15T00:00:00Z'
  },
  {
    id: 'prog-002',
    programCode: 'PROG-INNOVATION-2024',
    programName: 'Innovation Awards',
    description: 'Quarterly awards recognizing groundbreaking ideas and innovations',
    programType: 'company_award',
    category: 'innovation',
    status: 'active',
    startDate: '2024-01-01T00:00:00Z',
    budget: {
      totalBudget: 50000,
      spentAmount: 12500,
      remainingAmount: 37500,
      currency: 'USD',
      fiscalYear: '2024'
    },
    eligibility: {
      departments: [],
      locations: [],
      jobLevels: [],
      employeeTypes: ['full_time'],
      minTenure: 90
    },
    rules: [
      {
        id: 'rule-003',
        ruleName: 'Manager Approval',
        ruleType: 'requirement',
        description: 'All innovation awards require manager approval',
        condition: 'award_type = innovation',
        action: 'require_approval',
        isActive: true
      }
    ],
    rewards: [
      {
        rewardType: 'points',
        rewardName: 'Innovation Points',
        pointsValue: 1000,
        isDefault: true
      },
      {
        rewardType: 'monetary',
        rewardName: 'Cash Award',
        pointsValue: 0,
        monetaryValue: 500,
        isDefault: false
      }
    ],
    requiresApproval: true,
    approvers: ['emp-009', 'emp-006'],
    visibility: 'company',
    allowNominations: true,
    allowPeerRecognition: false,
    frequency: 'quarterly',
    participantCount: 89,
    recognitionCount: 45,
    pointsDistributed: 45000,
    isActive: true,
    createdBy: 'emp-009',
    createdDate: '2024-01-01T00:00:00Z',
    lastModified: '2024-01-10T00:00:00Z'
  }
];

// Sample Nominations
export const sampleNominations: Nomination[] = [
  {
    id: 'nom-001',
    nominationCode: 'NOM-2024-Q1-001',
    programId: 'prog-002',
    programName: 'Innovation Awards',
    nominatorId: 'emp-001',
    nominatorName: 'Sarah Johnson',
    nomineeId: 'emp-007',
    nomineeName: 'Jessica Martinez',
    nomineeEmail: 'jessica.martinez@company.com',
    nomineeDepartment: 'Product',
    category: 'innovation',
    title: 'AI-Powered Recommendation Engine',
    description: 'Jessica designed and implemented our revolutionary AI recommendation engine that has transformed user engagement.',
    achievements: [
      'Increased user engagement by 45%',
      'Reduced churn by 12%',
      'Implemented machine learning models',
      'Created scalable architecture'
    ],
    impact: 'This innovation has become a key product differentiator and has directly contributed to a 20% increase in new customer acquisitions.',
    supportingDocuments: ['/documents/ai-metrics.pdf', '/documents/technical-design.pdf'],
    status: 'selected',
    reviewers: [
      {
        reviewerId: 'emp-006',
        reviewerName: 'Robert Thompson',
        status: 'reviewed',
        rating: 5,
        comments: 'Exceptional work with measurable business impact',
        reviewedDate: '2024-01-14T10:00:00Z'
      },
      {
        reviewerId: 'emp-009',
        reviewerName: 'John Smith',
        status: 'reviewed',
        rating: 5,
        comments: 'This is exactly the kind of innovation we need to stay competitive',
        reviewedDate: '2024-01-15T09:00:00Z'
      }
    ],
    votes: [
      {
        voterId: 'emp-001',
        voterName: 'Sarah Johnson',
        voteDate: '2024-01-12T15:00:00Z'
      },
      {
        voterId: 'emp-002',
        voterName: 'Michael Chen',
        voteDate: '2024-01-13T10:00:00Z'
      }
    ],
    isWinner: true,
    awardedDate: '2024-01-16T10:00:00Z',
    createdDate: '2024-01-12T14:00:00Z',
    lastModified: '2024-01-16T10:00:00Z'
  }
];

// Sample Awards
export const sampleAwards: Award[] = [
  {
    id: 'award-001',
    awardCode: 'AWARD-EOY-2024',
    awardName: 'Employee of the Year',
    description: 'Annual award recognizing the most outstanding employee contribution',
    category: 'performance',
    awardType: 'individual',
    frequency: 'annual',
    criteria: [
      'Exceptional performance throughout the year',
      'Significant business impact',
      'Demonstrates company values',
      'Peer and manager recommendations'
    ],
    rewards: [
      {
        rewardType: 'monetary',
        description: 'Cash award',
        value: 5000,
        currency: 'USD'
      },
      {
        rewardType: 'points',
        description: 'Recognition points',
        value: 10000
      },
      {
        rewardType: 'badge',
        description: 'Excellence badge',
        value: 500
      }
    ],
    winners: [],
    nominationRequired: true,
    isActive: true,
    nextAwardDate: '2024-12-15T00:00:00Z',
    createdBy: 'emp-009',
    createdDate: '2023-01-01T00:00:00Z'
  },
  {
    id: 'award-002',
    awardCode: 'AWARD-TEAM-Q1',
    awardName: 'Team of the Quarter - Q1 2024',
    description: 'Quarterly award for outstanding team performance',
    category: 'teamwork',
    awardType: 'team',
    frequency: 'quarterly',
    criteria: [
      'Delivered exceptional results',
      'Strong collaboration',
      'Innovative approach',
      'Overcame significant challenges'
    ],
    rewards: [
      {
        rewardType: 'points',
        description: 'Points per team member',
        value: 2000
      },
      {
        rewardType: 'experience',
        description: 'Team celebration dinner',
        value: 1000,
        currency: 'USD'
      }
    ],
    winners: [
      {
        id: 'win-001',
        awardId: 'award-002',
        teamId: 'team-eng-001',
        teamName: 'Engineering - Mobile Team',
        awardedDate: '2024-04-01T00:00:00Z',
        achievements: [
          'Delivered mobile app 2 weeks ahead of schedule',
          'Zero critical bugs in production',
          '4.8 star rating on app stores'
        ]
      }
    ],
    nominationRequired: false,
    isActive: true,
    nextAwardDate: '2024-04-01T00:00:00Z',
    createdBy: 'emp-009',
    createdDate: '2024-01-01T00:00:00Z'
  }
];

// Sample Leaderboard
export const sampleLeaderboard: RecognitionLeaderboard = {
  id: 'lb-001',
  leaderboardType: 'points_earned',
  period: 'current_month',
  rankings: [
    {
      rank: 1,
      employeeId: 'emp-007',
      employeeName: 'Jessica Martinez',
      employeeDepartment: 'Product',
      employeePhoto: '/avatars/jessica.jpg',
      value: 1250,
      trend: 'up',
      previousRank: 3
    },
    {
      rank: 2,
      employeeId: 'emp-011',
      employeeName: 'Kevin Garcia',
      employeeDepartment: 'Support',
      employeePhoto: '/avatars/kevin.jpg',
      value: 750,
      trend: 'stable',
      previousRank: 2
    },
    {
      rank: 3,
      employeeId: 'emp-002',
      employeeName: 'Michael Chen',
      employeeDepartment: 'Engineering',
      employeePhoto: '/avatars/michael.jpg',
      value: 600,
      trend: 'down',
      previousRank: 1
    }
  ],
  lastUpdated: '2024-01-17T12:00:00Z'
};

// Sample Metrics
export const sampleMetrics: RecognitionMetrics = {
  totalRecognitions: 1567,
  recognitionsThisMonth: 89,
  recognitionsThisQuarter: 234,
  recognitionsThisYear: 1567,
  averageRecognitionsPerEmployee: 6.7,
  participationRate: 78.5,
  topRecipients: [
    { employeeId: 'emp-007', employeeName: 'Jessica Martinez', count: 23 },
    { employeeId: 'emp-002', employeeName: 'Michael Chen', count: 19 },
    { employeeId: 'emp-011', employeeName: 'Kevin Garcia', count: 17 }
  ],
  topSenders: [
    { employeeId: 'emp-001', employeeName: 'Sarah Johnson', count: 31 },
    { employeeId: 'emp-006', employeeName: 'Robert Thompson', count: 28 },
    { employeeId: 'emp-010', employeeName: 'Amanda White', count: 24 }
  ],
  recognitionsByCategory: [
    { category: 'teamwork', count: 523, percentage: 33.4 },
    { category: 'innovation', count: 314, percentage: 20.0 },
    { category: 'customer_service', count: 282, percentage: 18.0 },
    { category: 'performance', count: 235, percentage: 15.0 },
    { category: 'leadership', count: 156, percentage: 10.0 },
    { category: 'culture', count: 57, percentage: 3.6 }
  ],
  recognitionsByType: [
    { type: 'peer_to_peer', count: 1045, percentage: 66.7 },
    { type: 'manager_to_employee', count: 367, percentage: 23.4 },
    { type: 'spot_award', count: 89, percentage: 5.7 },
    { type: 'company_award', count: 45, percentage: 2.9 },
    { type: 'milestone', count: 21, percentage: 1.3 }
  ],
  recognitionsByDepartment: [
    { departmentId: 'dept-eng', departmentName: 'Engineering', sent: 423, received: 512 },
    { departmentId: 'dept-prod', departmentName: 'Product', sent: 298, received: 334 },
    { departmentId: 'dept-sales', departmentName: 'Sales', sent: 267, received: 245 },
    { departmentId: 'dept-support', departmentName: 'Support', sent: 234, received: 289 },
    { departmentId: 'dept-marketing', departmentName: 'Marketing', sent: 189, received: 187 }
  ],
  totalPointsAwarded: 783500,
  totalPointsRedeemed: 423600,
  totalBadgesAwarded: 234,
  uniqueBadgesAwarded: 45,
  redemptionRate: 54.1,
  averageRedemptionValue: 85.50,
  programParticipation: [
    { programId: 'prog-001', programName: 'Peer Recognition Program', participants: 234, recognitions: 1045 },
    { programId: 'prog-002', programName: 'Innovation Awards', participants: 89, recognitions: 45 }
  ],
  engagementScore: 82.3,
  sentimentScore: 88.7,
  trends: [
    { period: '2024-01', recognitions: 89, pointsAwarded: 44500, redemptions: 23 },
    { period: '2023-12', recognitions: 145, pointsAwarded: 72500, redemptions: 45 },
    { period: '2023-11', recognitions: 134, pointsAwarded: 67000, redemptions: 38 },
    { period: '2023-10', recognitions: 156, pointsAwarded: 78000, redemptions: 52 }
  ]
};

// Sample Settings
export const sampleSettings: RecognitionSettings = {
  enableRecognition: true,
  enablePeerToPeer: true,
  enableManagerRecognition: true,
  enablePoints: true,
  enableBadges: true,
  enableRewards: true,
  requireApproval: false,
  approvalLevels: 1,
  defaultApprovers: ['emp-009'],
  allowAnonymous: false,
  enableComments: true,
  enableReactions: true,
  defaultVisibility: 'company',
  pointsPerRecognition: 500,
  maxPointsPerRecognition: 2000,
  managerPointsMultiplier: 2,
  enablePointsExpiry: true,
  pointsExpiryMonths: 12,
  enableTiers: true,
  tiers: [
    {
      tierName: 'Bronze',
      minPoints: 0,
      maxPoints: 2499,
      benefits: ['Basic catalog access'],
      multiplier: 1.0
    },
    {
      tierName: 'Silver',
      minPoints: 2500,
      maxPoints: 4999,
      benefits: ['5% bonus on points earned', 'Access to exclusive rewards'],
      multiplier: 1.05
    },
    {
      tierName: 'Gold',
      minPoints: 5000,
      maxPoints: 14999,
      benefits: ['10% bonus on points earned', 'Early access to new catalog items', 'Priority redemption processing'],
      multiplier: 1.1
    },
    {
      tierName: 'Platinum',
      minPoints: 15000,
      benefits: ['15% bonus on points earned', 'VIP catalog access', 'Instant redemption', 'Personal concierge'],
      multiplier: 1.15
    }
  ],
  enableLeaderboards: true,
  publicLeaderboards: true,
  enableNominations: true,
  enableRedemption: true,
  minRedemptionPoints: 500,
  shippingEnabled: true,
  defaultCurrency: 'USD',
  fiscalYearStart: '01-01',
  enableNotifications: true,
  notifyOnRecognition: true,
  notifyOnBadge: true,
  notifyOnRedemption: true,
  enableMobileApp: true,
  enableIntegrations: true
};

// Sample Notifications
export const sampleNotifications: RecognitionNotification[] = [
  {
    id: 'notif-001',
    notificationType: 'received_recognition',
    recipientId: 'emp-002',
    recipientName: 'Michael Chen',
    title: 'You received a recognition!',
    message: 'Sarah Johnson recognized you for Outstanding Collaboration on Q4 Release',
    relatedId: 'rec-001',
    isRead: false,
    actionUrl: '/dashboard/recognition/rec-001',
    createdDate: '2024-01-15T14:00:00Z'
  },
  {
    id: 'notif-002',
    notificationType: 'badge_earned',
    recipientId: 'emp-002',
    recipientName: 'Michael Chen',
    title: 'You earned a badge!',
    message: 'Congratulations! You earned the Team Player badge',
    relatedId: 'badge-001',
    isRead: false,
    actionUrl: '/dashboard/recognition/badges',
    createdDate: '2024-01-15T14:00:00Z'
  },
  {
    id: 'notif-003',
    notificationType: 'redemption_shipped',
    recipientId: 'emp-011',
    recipientName: 'Kevin Garcia',
    title: 'Your reward has shipped!',
    message: 'Your Apple AirPods Pro has been shipped. Tracking: 1Z999AA10123456784',
    relatedId: 'red-003',
    isRead: true,
    readDate: '2024-01-18T11:00:00Z',
    actionUrl: '/dashboard/recognition/redemptions/red-003',
    createdDate: '2024-01-18T10:00:00Z'
  }
];

// Sample Audit Logs
export const sampleAuditLogs: RecognitionAuditLog[] = [
  {
    id: 'audit-001',
    timestamp: '2024-01-15T14:00:00Z',
    userId: 'emp-001',
    userName: 'Sarah Johnson',
    action: 'created',
    entityType: 'recognition',
    entityId: 'rec-001',
    details: 'Created peer recognition for Michael Chen',
    ipAddress: '192.168.1.100'
  },
  {
    id: 'audit-002',
    timestamp: '2024-01-16T10:25:00Z',
    userId: 'emp-009',
    userName: 'John Smith',
    action: 'approved',
    entityType: 'recognition',
    entityId: 'rec-002',
    details: 'Approved innovation award for Jessica Martinez',
    ipAddress: '192.168.1.101'
  },
  {
    id: 'audit-003',
    timestamp: '2024-01-16T12:00:00Z',
    userId: 'emp-007',
    userName: 'Jessica Martinez',
    action: 'redeemed',
    entityType: 'redemption',
    entityId: 'red-002',
    details: 'Redeemed Luxury Spa Day Experience for 15000 points',
    ipAddress: '192.168.1.102'
  }
];
