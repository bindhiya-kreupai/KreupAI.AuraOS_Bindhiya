/**
 * @module providerDirectoryService
 * @description Health plan provider directory — search providers by name/specialty/location,
 *   network status, cost estimates, formulary lookup, and telemedicine options.
 * @project AURA HCM Platform
 * @section 18.6 — Provider Directory & Network
 *
 * References:
 *  NPI: National Provider Identifier (10-digit unique identifier under HIPAA 45 C.F.R. § 162.406)
 *  Network adequacy: ACA § 1311(c)(1)(B); state-specific network adequacy standards
 *  Cost transparency: No Surprises Act (CAA 2021) — good-faith cost estimates
 *  Formulary tiers: CMS standard (Tier 1 generic, Tier 2 preferred brand, Tier 3 non-preferred brand, Tier 4 specialty)
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type ProviderType =
  | 'PRIMARY_CARE'
  | 'SPECIALIST'
  | 'HOSPITAL'
  | 'URGENT_CARE'
  | 'MENTAL_HEALTH'
  | 'PHYSICAL_THERAPY'
  | 'LABORATORY'
  | 'IMAGING'
  | 'PHARMACY'
  | 'DENTAL'
  | 'VISION'
  | 'TELEMEDICINE';

export type NetworkStatus = 'IN_NETWORK' | 'OUT_OF_NETWORK' | 'PREFERRED' | 'RESTRICTED';
export type ProviderGender = 'MALE' | 'FEMALE' | 'NOT_SPECIFIED';
export type FormularyTier = 'TIER_1' | 'TIER_2' | 'TIER_3' | 'TIER_4' | 'TIER_5' | 'NOT_COVERED';
export type AcceptingStatus = 'ACCEPTING' | 'WAITLIST' | 'CLOSED' | 'EXISTING_ONLY';

export interface Provider {
  npi: string; // 10-digit National Provider Identifier
  name: string;
  firstName: string;
  lastName: string;
  credentials: string; // MD, DO, DDS, etc.
  specialty: string;
  subspecialty: string | null;
  providerType: ProviderType;
  gender: ProviderGender;
  languages: string[];
  location: ProviderLocation;
  phone: string;
  fax: string | null;
  website: string | null;
  acceptingStatus: AcceptingStatus;
  networkStatus: NetworkStatus;
  planNetworks: PlanNetwork[];
  ratings: ProviderRating;
  hospitalAffiliations: string[];
  medicalSchool: string | null;
  boardCertifications: string[];
  yearsInPractice: number;
  telehealth: boolean;
  accessibilityFeatures: string[];
  lastVerified: string;
}

export interface ProviderLocation {
  address: string;
  address2: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
  lat: number;
  lng: number;
  distanceMiles?: number;
}

export interface PlanNetwork {
  planId: string;
  planName: string;
  networkStatus: NetworkStatus;
  effectiveDate: string;
  terminationDate: string | null;
}

export interface ProviderRating {
  overallScore: number; // 1.0-5.0
  reviewCount: number;
  qualityMeasures: QualityMeasure[];
  patientExperienceScore: number;
  clinicalOutcomeScore: number;
  accessibilityScore: number;
}

export interface QualityMeasure {
  measure: string;
  score: number;
  benchmark: number;
  performanceCategory: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'BELOW_AVERAGE';
}

export interface ProviderSearchParams {
  query?: string;
  specialty?: string;
  providerType?: ProviderType;
  planId?: string;
  networkStatus?: NetworkStatus;
  acceptingNewPatients?: boolean;
  gender?: ProviderGender;
  language?: string;
  telehealth?: boolean;
  maxDistance?: number;
  limit?: number;
  offset?: number;
}

export interface GeoSearchParams {
  lat: number;
  lng: number;
  radiusMiles: number;
  specialty?: string;
  providerType?: ProviderType;
  planId?: string;
  acceptingNewPatients?: boolean;
  limit?: number;
}

export interface CostEstimate {
  procedureCode: string;
  procedureDescription: string;
  providerId: string;
  providerName: string;
  planId: string;
  networkStatus: NetworkStatus;
  estimatedTotalCost: number;
  planAllowedAmount: number;
  deductibleApplied: number;
  coinsuranceAmount: number;
  copayAmount: number;
  estimatedEmployeeCost: number;
  estimatedPlanPays: number;
  disclaimer: string;
  basedOnDeductibleMet: boolean;
  deductibleRemaining: number;
  outOfPocketRemaining: number;
}

export interface FormularyDrug {
  drugName: string;
  genericName: string;
  brandName: string | null;
  isGeneric: boolean;
  tier: FormularyTier;
  tierLabel: string;
  requiresPriorAuthorization: boolean;
  requiresStepTherapy: boolean;
  quantityLimits: string | null;
  copayRetail30: number | null;
  copayRetail90: number | null;
  copayMail90: number | null;
  alternatives: FormularyAlternative[];
  planId: string;
  therapeuticClass: string;
}

export interface FormularyAlternative {
  drugName: string;
  tier: FormularyTier;
  isGeneric: boolean;
  estimatedSavings: number | null;
}

export interface TelemedicineProvider {
  id: string;
  name: string;
  platform: string;
  specialties: string[];
  availabilityHours: string;
  averageWaitMinutes: number;
  visitCopay: number;
  isAvailable247: boolean;
  languages: string[];
  plansCovered: string[];
  rating: number;
  appStoreRating: number;
  features: string[];
}

export interface NetworkStatusResult {
  providerId: string;
  providerName: string;
  planId: string;
  planName: string;
  networkStatus: NetworkStatus;
  networkName: string;
  effectiveDate: string;
  terminationDate: string | null;
  inNetworkBenefits: NetworkBenefits;
  outOfNetworkBenefits: NetworkBenefits | null;
}

export interface NetworkBenefits {
  deductible: number;
  outOfPocketMax: number;
  primaryCareCopay: number;
  specialistCopay: number;
  urgentCareCopay: number;
  emergencyRoomCopay: number;
  coinsurance: number;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK_PROVIDERS: Provider[] = [
  {
    npi: '1234567890',
    name: 'Dr. Aisha Al-Rashid, MD',
    firstName: 'Aisha',
    lastName: 'Al-Rashid',
    credentials: 'MD, FACP',
    specialty: 'Internal Medicine',
    subspecialty: 'Preventive Medicine',
    providerType: 'PRIMARY_CARE',
    gender: 'FEMALE',
    languages: ['English', 'Arabic', 'Urdu'],
    location: {
      address: '101 Healthcare Boulevard',
      address2: 'Suite 200',
      city: 'Dubai',
      state: 'Dubai',
      zip: '00000',
      country: 'UAE',
      lat: 25.2048,
      lng: 55.2708,
    },
    phone: '+971-4-555-0100',
    fax: '+971-4-555-0101',
    website: 'https://dralrashid.example.com',
    acceptingStatus: 'ACCEPTING',
    networkStatus: 'PREFERRED',
    planNetworks: [
      {
        planId: 'h-gold',
        planName: 'Balanced Choice (Gold)',
        networkStatus: 'PREFERRED',
        effectiveDate: '2026-01-01',
        terminationDate: null,
      },
      {
        planId: 'h-hdhp',
        planName: 'High Deductible Health Plan',
        networkStatus: 'IN_NETWORK',
        effectiveDate: '2026-01-01',
        terminationDate: null,
      },
    ],
    ratings: {
      overallScore: 4.8,
      reviewCount: 312,
      patientExperienceScore: 4.9,
      clinicalOutcomeScore: 4.7,
      accessibilityScore: 4.6,
      qualityMeasures: [
        {
          measure: 'Diabetes Care — HbA1c Control',
          score: 88,
          benchmark: 75,
          performanceCategory: 'EXCELLENT',
        },
        {
          measure: 'Preventive Screenings Ordered',
          score: 94,
          benchmark: 80,
          performanceCategory: 'EXCELLENT',
        },
        { measure: 'Hypertension Control', score: 82, benchmark: 74, performanceCategory: 'GOOD' },
      ],
    },
    hospitalAffiliations: ['Dubai Healthcare City Hospital', 'Emirates Specialty Hospital'],
    medicalSchool: 'University of Dubai Medical School',
    boardCertifications: ['Internal Medicine', 'Preventive Medicine'],
    yearsInPractice: 14,
    telehealth: true,
    accessibilityFeatures: [
      'Wheelchair accessible',
      'Sign language interpreter available',
      'Extended hours',
    ],
    lastVerified: '2026-01-15',
  },
  {
    npi: '2345678901',
    name: 'Dr. Ravi Krishnamurthy, MD',
    firstName: 'Ravi',
    lastName: 'Krishnamurthy',
    credentials: 'MD, PhD',
    specialty: 'Cardiology',
    subspecialty: 'Interventional Cardiology',
    providerType: 'SPECIALIST',
    gender: 'MALE',
    languages: ['English', 'Hindi', 'Tamil', 'Telugu'],
    location: {
      address: '55 Cardiology Center Drive',
      address2: null,
      city: 'Dubai',
      state: 'Dubai',
      zip: '00000',
      country: 'UAE',
      lat: 25.2097,
      lng: 55.2678,
    },
    phone: '+971-4-555-0200',
    fax: null,
    website: null,
    acceptingStatus: 'WAITLIST',
    networkStatus: 'IN_NETWORK',
    planNetworks: [
      {
        planId: 'h-gold',
        planName: 'Balanced Choice (Gold)',
        networkStatus: 'IN_NETWORK',
        effectiveDate: '2026-01-01',
        terminationDate: null,
      },
    ],
    ratings: {
      overallScore: 4.9,
      reviewCount: 188,
      patientExperienceScore: 4.8,
      clinicalOutcomeScore: 4.9,
      accessibilityScore: 4.2,
      qualityMeasures: [
        {
          measure: 'Post-MI Beta-blocker Therapy',
          score: 98,
          benchmark: 85,
          performanceCategory: 'EXCELLENT',
        },
        {
          measure: 'Cardiac Rehab Referral',
          score: 91,
          benchmark: 70,
          performanceCategory: 'EXCELLENT',
        },
      ],
    },
    hospitalAffiliations: ['Dubai Heart Centre'],
    medicalSchool: 'All India Institute of Medical Sciences (AIIMS)',
    boardCertifications: ['Cardiology', 'Interventional Cardiology'],
    yearsInPractice: 22,
    telehealth: false,
    accessibilityFeatures: ['Wheelchair accessible'],
    lastVerified: '2026-01-10',
  },
  {
    npi: '3456789012',
    name: 'Dr. Lisa Chen, DDS',
    firstName: 'Lisa',
    lastName: 'Chen',
    credentials: 'DDS, MS',
    specialty: 'Orthodontics',
    subspecialty: null,
    providerType: 'DENTAL',
    gender: 'FEMALE',
    languages: ['English', 'Mandarin', 'Cantonese'],
    location: {
      address: '200 Smile Street',
      address2: 'Floor 3',
      city: 'Dubai',
      state: 'Dubai',
      zip: '00000',
      country: 'UAE',
      lat: 25.1972,
      lng: 55.2796,
    },
    phone: '+971-4-555-0300',
    fax: '+971-4-555-0301',
    website: null,
    acceptingStatus: 'ACCEPTING',
    networkStatus: 'IN_NETWORK',
    planNetworks: [
      {
        planId: 'd-gold',
        planName: 'Comprehensive Dental',
        networkStatus: 'IN_NETWORK',
        effectiveDate: '2026-01-01',
        terminationDate: null,
      },
    ],
    ratings: {
      overallScore: 4.6,
      reviewCount: 241,
      patientExperienceScore: 4.7,
      clinicalOutcomeScore: 4.5,
      accessibilityScore: 4.4,
      qualityMeasures: [],
    },
    hospitalAffiliations: [],
    medicalSchool: null,
    boardCertifications: ['Orthodontics'],
    yearsInPractice: 9,
    telehealth: false,
    accessibilityFeatures: ['Wheelchair accessible', 'Children welcome'],
    lastVerified: '2026-01-12',
  },
  {
    npi: '4567890123',
    name: 'Dr. Omar Hassan, MD',
    firstName: 'Omar',
    lastName: 'Hassan',
    credentials: 'MD, FAAN',
    specialty: 'Neurology',
    subspecialty: 'Headache Medicine',
    providerType: 'SPECIALIST',
    gender: 'MALE',
    languages: ['English', 'Arabic', 'French'],
    location: {
      address: '78 Neuroscience Tower',
      address2: 'Suite 1200',
      city: 'Dubai',
      state: 'Dubai',
      zip: '00000',
      country: 'UAE',
      lat: 25.218,
      lng: 55.281,
    },
    phone: '+971-4-555-0400',
    fax: null,
    website: 'https://neurologyuae.example.com',
    acceptingStatus: 'ACCEPTING',
    networkStatus: 'OUT_OF_NETWORK',
    planNetworks: [],
    ratings: {
      overallScore: 4.7,
      reviewCount: 98,
      patientExperienceScore: 4.6,
      clinicalOutcomeScore: 4.8,
      accessibilityScore: 4.3,
      qualityMeasures: [],
    },
    hospitalAffiliations: ['American Hospital Dubai'],
    medicalSchool: 'Cairo University Faculty of Medicine',
    boardCertifications: ['Neurology'],
    yearsInPractice: 18,
    telehealth: true,
    accessibilityFeatures: ['Wheelchair accessible'],
    lastVerified: '2025-12-01',
  },
  {
    npi: '5678901234',
    name: 'Sunita Mehta, PhD, LCSW',
    firstName: 'Sunita',
    lastName: 'Mehta',
    credentials: 'PhD, LCSW',
    specialty: 'Mental Health Counseling',
    subspecialty: 'Cognitive Behavioral Therapy',
    providerType: 'MENTAL_HEALTH',
    gender: 'FEMALE',
    languages: ['English', 'Hindi', 'Gujarati'],
    location: {
      address: '14 Wellness Center Road',
      address2: null,
      city: 'Dubai',
      state: 'Dubai',
      zip: '00000',
      country: 'UAE',
      lat: 25.1888,
      lng: 55.2612,
    },
    phone: '+971-4-555-0500',
    fax: null,
    website: null,
    acceptingStatus: 'ACCEPTING',
    networkStatus: 'IN_NETWORK',
    planNetworks: [
      {
        planId: 'h-gold',
        planName: 'Balanced Choice (Gold)',
        networkStatus: 'IN_NETWORK',
        effectiveDate: '2026-01-01',
        terminationDate: null,
      },
    ],
    ratings: {
      overallScore: 4.9,
      reviewCount: 157,
      patientExperienceScore: 5.0,
      clinicalOutcomeScore: 4.8,
      accessibilityScore: 4.7,
      qualityMeasures: [],
    },
    hospitalAffiliations: [],
    medicalSchool: null,
    boardCertifications: ['Licensed Clinical Social Worker', 'Certified CBT Therapist'],
    yearsInPractice: 12,
    telehealth: true,
    accessibilityFeatures: ['Telehealth available', 'Evening appointments'],
    lastVerified: '2026-01-18',
  },
];

const MOCK_TELEMEDICINE_PROVIDERS: TelemedicineProvider[] = [
  {
    id: 'tele-001',
    name: 'Doctor on Demand',
    platform: 'DoctorOnDemand',
    specialties: ['Primary Care', 'Mental Health', 'Urgent Care', 'Dermatology'],
    availabilityHours: '24/7',
    averageWaitMinutes: 8,
    visitCopay: 0,
    isAvailable247: true,
    languages: ['English', 'Spanish'],
    plansCovered: ['h-gold', 'h-hdhp', 'h-silver'],
    rating: 4.7,
    appStoreRating: 4.6,
    features: [
      'Video visits',
      'Prescription delivery',
      'Lab orders',
      'Mental health therapy',
      'Care team messaging',
    ],
  },
  {
    id: 'tele-002',
    name: 'Teladoc Health',
    platform: 'Teladoc',
    specialties: ['Primary Care', 'Mental Health', 'Dermatology', 'Nutrition', 'Back & Neck Pain'],
    availabilityHours: '24/7',
    averageWaitMinutes: 12,
    visitCopay: 0,
    isAvailable247: true,
    languages: ['English', 'Arabic', 'Spanish', 'Hindi'],
    plansCovered: ['h-gold', 'h-silver'],
    rating: 4.5,
    appStoreRating: 4.4,
    features: [
      'Video and phone visits',
      'Chronic condition management',
      'Mental health ongoing care',
      'Health coaching',
    ],
  },
  {
    id: 'tele-003',
    name: 'MDLive',
    platform: 'MDLive',
    specialties: ['Urgent Care', 'Behavioral Health', 'Dermatology'],
    availabilityHours: '24/7',
    averageWaitMinutes: 15,
    visitCopay: 0,
    isAvailable247: true,
    languages: ['English', 'Spanish'],
    plansCovered: ['h-gold'],
    rating: 4.4,
    appStoreRating: 4.3,
    features: [
      'Video visits',
      'After-visit summary',
      'Prescription capability',
      'Behavioral health specialties',
    ],
  },
];

const MOCK_FORMULARY: FormularyDrug[] = [
  {
    drugName: 'Atorvastatin',
    genericName: 'atorvastatin calcium',
    brandName: 'Lipitor',
    isGeneric: true,
    tier: 'TIER_1',
    tierLabel: 'Tier 1 — Preferred Generic',
    requiresPriorAuthorization: false,
    requiresStepTherapy: false,
    quantityLimits: '90 tablets/30 days',
    copayRetail30: 10,
    copayRetail90: 25,
    copayMail90: 20,
    planId: 'h-gold',
    therapeuticClass: 'Cardiovascular — HMG-CoA Reductase Inhibitors (Statins)',
    alternatives: [],
  },
  {
    drugName: 'Ozempic',
    genericName: 'semaglutide',
    brandName: 'Ozempic',
    isGeneric: false,
    tier: 'TIER_4',
    tierLabel: 'Tier 4 — Specialty',
    requiresPriorAuthorization: true,
    requiresStepTherapy: true,
    quantityLimits: '4 pens/28 days',
    copayRetail30: 100,
    copayRetail90: null,
    copayMail90: 250,
    planId: 'h-gold',
    therapeuticClass: 'Endocrine — GLP-1 Receptor Agonists',
    alternatives: [
      { drugName: 'Metformin', tier: 'TIER_1', isGeneric: true, estimatedSavings: 400 },
    ],
  },
  {
    drugName: 'Metformin',
    genericName: 'metformin hydrochloride',
    brandName: 'Glucophage',
    isGeneric: true,
    tier: 'TIER_1',
    tierLabel: 'Tier 1 — Preferred Generic',
    requiresPriorAuthorization: false,
    requiresStepTherapy: false,
    quantityLimits: null,
    copayRetail30: 10,
    copayRetail90: 25,
    copayMail90: 20,
    planId: 'h-gold',
    therapeuticClass: 'Endocrine — Biguanides',
    alternatives: [],
  },
  {
    drugName: 'Humira',
    genericName: 'adalimumab',
    brandName: 'Humira',
    isGeneric: false,
    tier: 'TIER_5',
    tierLabel: 'Tier 5 — Specialty (High Cost)',
    requiresPriorAuthorization: true,
    requiresStepTherapy: true,
    quantityLimits: '2 pens/14 days',
    copayRetail30: 150,
    copayRetail90: null,
    copayMail90: 400,
    planId: 'h-gold',
    therapeuticClass: 'Immunology — TNF Inhibitors',
    alternatives: [
      {
        drugName: 'Hadlima (adalimumab biosimilar)',
        tier: 'TIER_4',
        isGeneric: false,
        estimatedSavings: 600,
      },
      {
        drugName: 'Hyrimoz (adalimumab biosimilar)',
        tier: 'TIER_4',
        isGeneric: false,
        estimatedSavings: 600,
      },
    ],
  },
  {
    drugName: 'Amoxicillin',
    genericName: 'amoxicillin trihydrate',
    brandName: 'Amoxil',
    isGeneric: true,
    tier: 'TIER_1',
    tierLabel: 'Tier 1 — Preferred Generic',
    requiresPriorAuthorization: false,
    requiresStepTherapy: false,
    quantityLimits: '30 capsules/10 days',
    copayRetail30: 10,
    copayRetail90: 25,
    copayMail90: 20,
    planId: 'h-gold',
    therapeuticClass: 'Anti-infectives — Aminopenicillins',
    alternatives: [],
  },
];

// ── Service Functions ──────────────────────────────────────────────────────────

/**
 * Search providers by name, specialty, and other filters.
 */
export async function searchProviders(
  query: string,
  filters?: ProviderSearchParams
): Promise<Provider[]> {
  await new Promise((r) => setTimeout(r, 300));

  let results = [...MOCK_PROVIDERS];

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.specialty.toLowerCase().includes(q) ||
        p.location.city.toLowerCase().includes(q)
    );
  }
  if (filters?.specialty) {
    results = results.filter((p) =>
      p.specialty.toLowerCase().includes(filters.specialty!.toLowerCase())
    );
  }
  if (filters?.providerType) {
    results = results.filter((p) => p.providerType === filters.providerType);
  }
  if (filters?.networkStatus) {
    results = results.filter((p) => p.networkStatus === filters.networkStatus);
  }
  if (filters?.planId) {
    results = results.filter((p) => p.planNetworks.some((n) => n.planId === filters.planId));
  }
  if (filters?.acceptingNewPatients) {
    results = results.filter((p) => p.acceptingStatus === 'ACCEPTING');
  }
  if (filters?.gender) {
    results = results.filter((p) => p.gender === filters.gender);
  }
  if (filters?.telehealth) {
    results = results.filter((p) => p.telehealth);
  }
  if (filters?.language) {
    results = results.filter((p) =>
      p.languages.some((l) => l.toLowerCase().includes(filters.language!.toLowerCase()))
    );
  }

  const offset = filters?.offset ?? 0;
  const limit = filters?.limit ?? 20;
  return results.slice(offset, offset + limit);
}

/**
 * Get full provider detail by NPI (National Provider Identifier).
 */
export async function getProvider(npi: string): Promise<Provider | null> {
  await new Promise((r) => setTimeout(r, 200));
  return MOCK_PROVIDERS.find((p) => p.npi === npi) ?? null;
}

/**
 * Search providers by geographic location within a radius.
 */
export async function getProvidersByLocation(
  lat: number,
  lng: number,
  radiusMiles: number,
  params?: Omit<GeoSearchParams, 'lat' | 'lng' | 'radiusMiles'>
): Promise<Provider[]> {
  await new Promise((r) => setTimeout(r, 350));

  // Haversine formula approximation (simplified for mock)
  function distanceMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 3958.8; // Earth radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  let results = MOCK_PROVIDERS.map((p) => ({
    ...p,
    location: {
      ...p.location,
      distanceMiles: parseFloat(distanceMiles(lat, lng, p.location.lat, p.location.lng).toFixed(1)),
    },
  })).filter((p) => (p.location.distanceMiles ?? Infinity) <= radiusMiles);

  if (params?.specialty) {
    results = results.filter((p) =>
      p.specialty.toLowerCase().includes(params.specialty!.toLowerCase())
    );
  }
  if (params?.providerType) {
    results = results.filter((p) => p.providerType === params.providerType);
  }
  if (params?.planId) {
    results = results.filter((p) => p.planNetworks.some((n) => n.planId === params.planId));
  }
  if (params?.acceptingNewPatients) {
    results = results.filter((p) => p.acceptingStatus === 'ACCEPTING');
  }

  results.sort((a, b) => (a.location.distanceMiles ?? 0) - (b.location.distanceMiles ?? 0));

  const limit = params?.limit ?? 20;
  return results.slice(0, limit);
}

/**
 * Check if a provider is in-network for a given plan.
 */
export async function getNetworkStatus(
  providerId: string,
  planId: string
): Promise<NetworkStatusResult> {
  await new Promise((r) => setTimeout(r, 200));

  const provider = MOCK_PROVIDERS.find((p) => p.npi === providerId);
  if (!provider) throw new Error(`Provider ${providerId} not found`);

  const planNetwork = provider.planNetworks.find((n) => n.planId === planId);
  const networkStatus = planNetwork?.networkStatus ?? 'OUT_OF_NETWORK';

  return {
    providerId,
    providerName: provider.name,
    planId,
    planName: planNetwork?.planName ?? 'Unknown Plan',
    networkStatus,
    networkName: networkStatus === 'OUT_OF_NETWORK' ? 'Not in network' : 'Blue Choice PPO Network',
    effectiveDate: planNetwork?.effectiveDate ?? '',
    terminationDate: planNetwork?.terminationDate ?? null,
    inNetworkBenefits: {
      deductible: 1500,
      outOfPocketMax: 5000,
      primaryCareCopay: 30,
      specialistCopay: 60,
      urgentCareCopay: 75,
      emergencyRoomCopay: 200,
      coinsurance: 20,
    },
    outOfNetworkBenefits:
      networkStatus === 'OUT_OF_NETWORK'
        ? {
            deductible: 4500,
            outOfPocketMax: 12000,
            primaryCareCopay: 0,
            specialistCopay: 0,
            urgentCareCopay: 0,
            emergencyRoomCopay: 200,
            coinsurance: 40,
          }
        : null,
  };
}

/**
 * Estimate patient cost for a procedure with a specific provider and plan.
 * Based on No Surprises Act good-faith estimate requirements.
 */
export async function estimateCost(
  procedureCode: string,
  providerId: string,
  planId: string
): Promise<CostEstimate> {
  await new Promise((r) => setTimeout(r, 300));

  // Mock cost data by CPT code
  const costMap: Record<string, { description: string; total: number }> = {
    99213: { description: 'Office Visit — Established Patient, Level 3', total: 180 },
    99214: { description: 'Office Visit — Established Patient, Level 4', total: 250 },
    99203: { description: 'Office Visit — New Patient, Level 3', total: 220 },
    93000: { description: 'Electrocardiogram (ECG), Routine with Interpretation', total: 145 },
    80053: { description: 'Comprehensive Metabolic Panel (CMP)', total: 95 },
    70553: { description: 'MRI Brain with Contrast', total: 2800 },
    27447: { description: 'Total Knee Replacement', total: 32000 },
    43239: { description: 'Upper GI Endoscopy with Biopsy', total: 3200 },
    90837: { description: 'Psychotherapy, 60 Minutes', total: 200 },
  };

  const procedureInfo = costMap[procedureCode] ?? {
    description: `Procedure ${procedureCode}`,
    total: 500,
  };
  const provider = MOCK_PROVIDERS.find((p) => p.npi === providerId);
  const planNetwork = provider?.planNetworks.find((n) => n.planId === planId);
  const isInNetwork = planNetwork?.networkStatus !== 'OUT_OF_NETWORK' && !!planNetwork;

  const allowedAmount = isInNetwork ? procedureInfo.total * 0.85 : procedureInfo.total * 0.6;
  const deductibleRemaining = 1050;
  const deductibleApplied = Math.min(deductibleRemaining, allowedAmount);
  const afterDeductible = allowedAmount - deductibleApplied;
  const coinsurance = isInNetwork ? 0.2 : 0.4;
  const coinsuranceAmount = afterDeductible * coinsurance;
  const employeeCost = deductibleApplied + coinsuranceAmount;
  const planPays = allowedAmount - employeeCost;

  return {
    procedureCode,
    procedureDescription: procedureInfo.description,
    providerId,
    providerName: provider?.name ?? 'Unknown Provider',
    planId,
    networkStatus: isInNetwork ? 'IN_NETWORK' : 'OUT_OF_NETWORK',
    estimatedTotalCost: procedureInfo.total,
    planAllowedAmount: parseFloat(allowedAmount.toFixed(2)),
    deductibleApplied: parseFloat(deductibleApplied.toFixed(2)),
    coinsuranceAmount: parseFloat(coinsuranceAmount.toFixed(2)),
    copayAmount: 0,
    estimatedEmployeeCost: parseFloat(employeeCost.toFixed(2)),
    estimatedPlanPays: parseFloat(Math.max(0, planPays).toFixed(2)),
    disclaimer:
      'This is a good-faith estimate only. Actual costs may vary based on services rendered, diagnosis codes, and applicable plan provisions. This estimate does not guarantee payment. Per the No Surprises Act (42 U.S.C. § 300gg-111).',
    basedOnDeductibleMet: false,
    deductibleRemaining,
    outOfPocketRemaining: 3950,
  };
}

/**
 * Look up a drug in the plan formulary with tier information and alternatives.
 */
export async function getFormulary(planId: string, drugName: string): Promise<FormularyDrug[]> {
  await new Promise((r) => setTimeout(r, 250));

  const results = MOCK_FORMULARY.filter(
    (d) =>
      d.planId === planId &&
      (d.drugName.toLowerCase().includes(drugName.toLowerCase()) ||
        d.genericName.toLowerCase().includes(drugName.toLowerCase()) ||
        (d.brandName && d.brandName.toLowerCase().includes(drugName.toLowerCase())))
  );

  return results;
}

/**
 * Get available telemedicine / virtual care providers covered by the plan.
 */
export async function getTelemedicineProviders(planId?: string): Promise<TelemedicineProvider[]> {
  await new Promise((r) => setTimeout(r, 200));

  if (planId) {
    return MOCK_TELEMEDICINE_PROVIDERS.filter((p) => p.plansCovered.includes(planId));
  }
  return [...MOCK_TELEMEDICINE_PROVIDERS];
}

// ── Named export ───────────────────────────────────────────────────────────────

export const providerDirectoryService = {
  searchProviders,
  getProvider,
  getProvidersByLocation,
  getNetworkStatus,
  estimateCost,
  getFormulary,
  getTelemedicineProviders,
};
