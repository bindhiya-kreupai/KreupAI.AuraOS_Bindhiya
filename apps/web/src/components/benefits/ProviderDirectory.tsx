'use client';

/**
 * @component ProviderDirectory
 * @description Health plan provider search and directory — network status, cost estimator,
 *   formulary lookup, telemedicine options, and quality ratings.
 * @project AURA HCM Platform
 * @section 18.6 — Provider Directory & Network
 * @legal NPI: 45 C.F.R. § 162.406; No Surprises Act (CAA 2021) cost estimates;
 *   ACA § 1311(c)(1)(B) network adequacy standards.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  MapPin,
  Phone,
  Star,
  CheckCircle2,
  Clock,
  Video,
  Filter,
  Loader2,
  User,
  Building2,
  DollarSign,
  Pill,
  AlertTriangle,
  Info,
} from 'lucide-react';
import type {
  Provider,
  CostEstimate,
  FormularyDrug,
  TelemedicineProvider,
  NetworkStatus,
  ProviderGender,
  FormularyTier,
} from '@/services/providerDirectoryService';
import { providerDirectoryService } from '@/services/providerDirectoryService';

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(n);
}

function renderStars(score: number) {
  const full = Math.floor(score);
  const half = score % 1 >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < full ? 'text-yellow-400 fill-yellow-400' : half && i === full ? 'text-yellow-400 fill-yellow-200' : 'text-gray-300'}`}
        />
      ))}
      <span className="text-xs text-gray-600 ml-1">{score.toFixed(1)}</span>
    </div>
  );
}

// ── Network Badge ──────────────────────────────────────────────────────────────

const NETWORK_STYLES: Record<NetworkStatus, string> = {
  IN_NETWORK: 'bg-green-100 text-green-800 border border-green-200',
  OUT_OF_NETWORK: 'bg-red-100 text-red-800 border border-red-200',
  PREFERRED: 'bg-blue-100 text-blue-800 border border-blue-200',
  RESTRICTED: 'bg-orange-100 text-orange-800 border border-orange-200',
};

function NetworkBadge({ status }: { status: NetworkStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${NETWORK_STYLES[status]}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

const TIER_STYLES: Record<FormularyTier, { bg: string; label: string }> = {
  TIER_1: { bg: 'bg-green-100 text-green-800', label: 'Tier 1' },
  TIER_2: { bg: 'bg-blue-100 text-blue-800', label: 'Tier 2' },
  TIER_3: { bg: 'bg-yellow-100 text-yellow-800', label: 'Tier 3' },
  TIER_4: { bg: 'bg-orange-100 text-orange-800', label: 'Tier 4' },
  TIER_5: { bg: 'bg-red-100 text-red-800', label: 'Tier 5' },
  NOT_COVERED: { bg: 'bg-gray-100 text-gray-700', label: 'Not Covered' },
};

// ── Section types ──────────────────────────────────────────────────────────────

type SectionId = 'search' | 'cost-estimator' | 'formulary' | 'telemedicine';

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: 'search', label: 'Provider Search' },
  { id: 'cost-estimator', label: 'Cost Estimator' },
  { id: 'formulary', label: 'Formulary Lookup' },
  { id: 'telemedicine', label: 'Telemedicine' },
];

const CPT_PROCEDURES = [
  { code: '99213', label: 'Office Visit — Established Patient (Level 3)' },
  { code: '99214', label: 'Office Visit — Established Patient (Level 4)' },
  { code: '99203', label: 'Office Visit — New Patient (Level 3)' },
  { code: '93000', label: 'ECG — Routine with Interpretation' },
  { code: '80053', label: 'Comprehensive Metabolic Panel (CMP)' },
  { code: '70553', label: 'MRI Brain with Contrast' },
  { code: '27447', label: 'Total Knee Replacement' },
  { code: '43239', label: 'Upper GI Endoscopy with Biopsy' },
  { code: '90837', label: 'Psychotherapy, 60 Minutes' },
];

// ── Main Component ─────────────────────────────────────────────────────────────

export default function ProviderDirectory() {
  const [activeSection, setActiveSection] = useState<SectionId>('search');

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState<ProviderGender | ''>('');
  const [telehealthOnly, setTelehealthOnly] = useState(false);
  const [acceptingOnly, setAcceptingOnly] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  // Cost estimator states
  const [cptCode, setCptCode] = useState('99213');
  const [estimateProviderId, setEstimateProviderId] = useState('');
  const [costEstimate, setCostEstimate] = useState<CostEstimate | null>(null);
  const [estimateLoading, setEstimateLoading] = useState(false);

  // Formulary states
  const [drugSearch, setDrugSearch] = useState('');
  const [formularyResults, setFormularyResults] = useState<FormularyDrug[]>([]);
  const [formularyLoading, setFormularyLoading] = useState(false);

  // Telemedicine states
  const [teleProviders, setTeleProviders] = useState<TelemedicineProvider[]>([]);
  const [teleLoading, setTeleLoading] = useState(false);

  const handleSearch = useCallback(async () => {
    setSearchLoading(true);
    try {
      const results = await providerDirectoryService.searchProviders(searchQuery, {
        specialty: specialtyFilter || undefined,
        gender: genderFilter || undefined,
        telehealth: telehealthOnly || undefined,
        acceptingNewPatients: acceptingOnly || undefined,
        limit: 20,
      });
      setProviders(results);
    } catch (err: any) {
      console.error('Provider search error:', err);
    } finally {
      setSearchLoading(false);
    }
  }, [searchQuery, specialtyFilter, genderFilter, telehealthOnly, acceptingOnly]);

  useEffect(() => {
    handleSearch();
  }, []);

  useEffect(() => {
    if (activeSection === 'telemedicine' && teleProviders.length === 0) {
      setTeleLoading(true);
      providerDirectoryService.getTelemedicineProviders().then((results) => {
        setTeleProviders(results);
        setTeleLoading(false);
      });
    }
  }, [activeSection]);

  const handleEstimateCost = async () => {
    if (!estimateProviderId) return;
    setEstimateLoading(true);
    try {
      const estimate = await providerDirectoryService.estimateCost(
        cptCode,
        estimateProviderId,
        'h-gold'
      );
      setCostEstimate(estimate);
    } catch (err: any) {
      console.error('Cost estimate error:', err);
    } finally {
      setEstimateLoading(false);
    }
  };

  const handleFormularySearch = async () => {
    if (!drugSearch.trim()) return;
    setFormularyLoading(true);
    try {
      const results = await providerDirectoryService.getFormulary('h-gold', drugSearch);
      setFormularyResults(results);
    } catch (err: any) {
      console.error('Formulary search error:', err);
    } finally {
      setFormularyLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Provider Directory</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Search in-network providers, estimate costs, look up formulary drugs, and access
          telemedicine
        </p>
      </div>

      {/* Section Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav
            className="flex gap-1 px-4 pt-4 overflow-x-auto"
            aria-label="Provider directory sections"
          >
            {SECTIONS.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                  activeSection === sec.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {sec.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* ── Provider Search Section ────────────────────────────────────── */}
          {activeSection === 'search' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search by name, specialty, or location..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={searchLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  {searchLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Search
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500 font-medium">Filters:</span>
                </div>
                <input
                  type="text"
                  value={specialtyFilter}
                  onChange={(e) => setSpecialtyFilter(e.target.value)}
                  placeholder="Specialty..."
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value as ProviderGender | '')}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="">Any Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
                <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={telehealthOnly}
                    onChange={(e) => setTelehealthOnly(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  Telehealth only
                </label>
                <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptingOnly}
                    onChange={(e) => setAcceptingOnly(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  Accepting new patients
                </label>
              </div>

              {/* Provider Cards */}
              {searchLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-sm text-gray-500">Searching providers...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {providers.map((provider) => (
                    <div
                      key={provider.npi}
                      className={`bg-white border rounded-xl p-4 hover:shadow-sm transition-shadow cursor-pointer ${
                        selectedProvider?.npi === provider.npi
                          ? 'border-blue-300 shadow-sm'
                          : 'border-gray-200'
                      }`}
                      onClick={() =>
                        setSelectedProvider(
                          selectedProvider?.npi === provider.npi ? null : provider
                        )
                      }
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                              provider.gender === 'FEMALE'
                                ? 'bg-pink-100'
                                : provider.gender === 'MALE'
                                  ? 'bg-blue-100'
                                  : 'bg-gray-100'
                            }`}
                          >
                            <User
                              className={`w-5 h-5 ${provider.gender === 'FEMALE' ? 'text-pink-600' : provider.gender === 'MALE' ? 'text-blue-600' : 'text-gray-600'}`}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-gray-900">{provider.name}</p>
                              {provider.telehealth && (
                                <span className="flex items-center gap-0.5 text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                                  <Video className="w-3 h-3" />
                                  Telehealth
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-0.5">
                              {provider.specialty}
                              {provider.subspecialty ? ` — ${provider.subspecialty}` : ''}
                            </p>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <MapPin className="w-3 h-3" />
                                {provider.location.address}, {provider.location.city},{' '}
                                {provider.location.country}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <Phone className="w-3 h-3" />
                                {provider.phone}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              {renderStars(provider.ratings.overallScore)}
                              <span className="text-xs text-gray-400">
                                ({provider.ratings.reviewCount} reviews)
                              </span>
                              <span className="text-xs text-gray-400">
                                • {provider.yearsInPractice} yrs experience
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 ml-3 flex-shrink-0">
                          <NetworkBadge status={provider.networkStatus} />
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              provider.acceptingStatus === 'ACCEPTING'
                                ? 'bg-green-100 text-green-700'
                                : provider.acceptingStatus === 'WAITLIST'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {provider.acceptingStatus === 'ACCEPTING'
                              ? 'Accepting Patients'
                              : provider.acceptingStatus === 'WAITLIST'
                                ? 'Waitlist'
                                : provider.acceptingStatus}
                          </span>
                        </div>
                      </div>

                      {/* Expanded Detail Panel */}
                      {selectedProvider?.npi === provider.npi && (
                        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Credentials */}
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                              Credentials
                            </p>
                            <p className="text-sm font-medium text-gray-800">
                              {provider.credentials}
                            </p>
                            {provider.medicalSchool && (
                              <p className="text-xs text-gray-500 mt-1">{provider.medicalSchool}</p>
                            )}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {provider.boardCertifications.map((cert) => (
                                <span
                                  key={cert}
                                  className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200"
                                >
                                  {cert}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Hospital Affiliations */}
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                              Hospital Affiliations
                            </p>
                            {provider.hospitalAffiliations.length > 0 ? (
                              provider.hospitalAffiliations.map((h) => (
                                <div
                                  key={h}
                                  className="flex items-center gap-1.5 text-xs text-gray-700 mb-1"
                                >
                                  <Building2 className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                  {h}
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-gray-400">
                                No hospital affiliations listed
                              </p>
                            )}
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-3 mb-1.5">
                              Languages
                            </p>
                            <p className="text-xs text-gray-700">{provider.languages.join(', ')}</p>
                          </div>

                          {/* Quality Measures */}
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                              Quality Measures
                            </p>
                            {provider.ratings.qualityMeasures.length > 0 ? (
                              provider.ratings.qualityMeasures.map((qm) => (
                                <div key={qm.measure} className="mb-2">
                                  <div className="flex items-center justify-between text-xs mb-0.5">
                                    <span className="text-gray-600 truncate pr-2">
                                      {qm.measure}
                                    </span>
                                    <span
                                      className={`font-semibold flex-shrink-0 ${
                                        qm.performanceCategory === 'EXCELLENT'
                                          ? 'text-green-600'
                                          : qm.performanceCategory === 'GOOD'
                                            ? 'text-blue-600'
                                            : 'text-yellow-600'
                                      }`}
                                    >
                                      {qm.score}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1">
                                    <div
                                      className={`h-1 rounded-full ${qm.performanceCategory === 'EXCELLENT' ? 'bg-green-500' : qm.performanceCategory === 'GOOD' ? 'bg-blue-500' : 'bg-yellow-500'}`}
                                      style={{ width: `${qm.score}%` }}
                                    />
                                  </div>
                                  <p className="text-xs text-gray-400">
                                    Benchmark: {qm.benchmark}%
                                  </p>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-gray-400">No quality measures reported</p>
                            )}
                          </div>

                          {/* Accessibility & NPI */}
                          <div className="md:col-span-3 flex items-center justify-between pt-2 border-t border-gray-100">
                            <div className="flex flex-wrap gap-2">
                              {provider.accessibilityFeatures.map((f) => (
                                <span
                                  key={f}
                                  className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                                >
                                  {f}
                                </span>
                              ))}
                            </div>
                            <div className="text-right text-xs text-gray-400 flex-shrink-0 ml-4">
                              <p>NPI: {provider.npi}</p>
                              <p>Last Verified: {provider.lastVerified}</p>
                            </div>
                          </div>

                          {/* Quick actions */}
                          <div className="md:col-span-3 flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEstimateProviderId(provider.npi);
                                setActiveSection('cost-estimator');
                              }}
                              className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                              Estimate Cost
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {providers.length === 0 && !searchLoading && (
                    <div className="text-center py-10 text-gray-400">
                      <User className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">
                        No providers found. Try adjusting your search criteria.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Cost Estimator Section ────────────────────────────────────── */}
          {activeSection === 'cost-estimator' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Procedure Cost Estimator
                </h3>
                <p className="text-xs text-gray-500">
                  Good-faith estimates per the No Surprises Act (42 U.S.C. § 300gg-111). Actual
                  costs may vary.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Procedure (CPT Code)
                  </label>
                  <select
                    value={cptCode}
                    onChange={(e) => setCptCode(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {CPT_PROCEDURES.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.code} — {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Provider (NPI)
                  </label>
                  <select
                    value={estimateProviderId}
                    onChange={(e) => setEstimateProviderId(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select a provider...</option>
                    <option value="1234567890">Dr. Aisha Al-Rashid (NPI: 1234567890)</option>
                    <option value="2345678901">Dr. Ravi Krishnamurthy (NPI: 2345678901)</option>
                    <option value="3456789012">Dr. Lisa Chen (NPI: 3456789012)</option>
                    <option value="4567890123">Dr. Omar Hassan (NPI: 4567890123)</option>
                    <option value="5678901234">Sunita Mehta (NPI: 5678901234)</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleEstimateCost}
                    disabled={estimateLoading || !estimateProviderId}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
                  >
                    {estimateLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <DollarSign className="w-4 h-4" />
                    )}
                    Estimate Cost
                  </button>
                </div>
              </div>

              {costEstimate && (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div
                    className={`px-4 py-3 flex items-center justify-between ${costEstimate.networkStatus === 'IN_NETWORK' ? 'bg-green-50 border-b border-green-200' : 'bg-red-50 border-b border-red-200'}`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {costEstimate.procedureDescription}
                      </p>
                      <p className="text-xs text-gray-500">
                        CPT {costEstimate.procedureCode} • Provider: {costEstimate.providerName}
                      </p>
                    </div>
                    <NetworkBadge status={costEstimate.networkStatus} />
                  </div>

                  <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      {
                        label: 'Estimated Total Cost',
                        value: costEstimate.estimatedTotalCost,
                        note: 'Provider billed amount',
                        highlight: false,
                      },
                      {
                        label: 'Plan Allowed Amount',
                        value: costEstimate.planAllowedAmount,
                        note: 'After network discount',
                        highlight: false,
                      },
                      {
                        label: 'Deductible Applied',
                        value: costEstimate.deductibleApplied,
                        note: `$${costEstimate.deductibleRemaining} remaining`,
                        highlight: false,
                      },
                      {
                        label: 'Coinsurance Amount',
                        value: costEstimate.coinsuranceAmount,
                        note: `${costEstimate.networkStatus === 'IN_NETWORK' ? '20%' : '40%'} after deductible`,
                        highlight: false,
                      },
                      {
                        label: 'Your Estimated Cost',
                        value: costEstimate.estimatedEmployeeCost,
                        note: 'Deductible + coinsurance',
                        highlight: true,
                      },
                      {
                        label: 'Plan Pays',
                        value: costEstimate.estimatedPlanPays,
                        note: 'Estimated plan coverage',
                        highlight: false,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`p-3 rounded-xl ${item.highlight ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'}`}
                      >
                        <p
                          className={`text-xs text-gray-500 ${item.highlight ? 'text-blue-600 font-medium' : ''}`}
                        >
                          {item.label}
                        </p>
                        <p
                          className={`text-xl font-bold mt-1 ${item.highlight ? 'text-blue-700' : 'text-gray-900'}`}
                        >
                          {fmtCurrency(item.value)}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.note}</p>
                      </div>
                    ))}
                  </div>

                  <div className="px-4 pb-4">
                    <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <Info className="w-3.5 h-3.5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-yellow-700">{costEstimate.disclaimer}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Formulary Lookup Section ──────────────────────────────────── */}
          {activeSection === 'formulary' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Drug Formulary Lookup</h3>
                <p className="text-xs text-gray-500">
                  Search your plan&apos;s drug formulary for tier, copay, and coverage information.
                </p>
              </div>

              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Pill className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={drugSearch}
                    onChange={(e) => setDrugSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFormularySearch()}
                    placeholder="Search drug name (e.g., Metformin, Ozempic, Humira)..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleFormularySearch}
                  disabled={formularyLoading || !drugSearch.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  {formularyLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Search
                </button>
              </div>

              {/* Tier Legend */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-500 font-medium">Tiers:</span>
                {(['TIER_1', 'TIER_2', 'TIER_3', 'TIER_4', 'TIER_5'] as FormularyTier[]).map(
                  (tier) => (
                    <span
                      key={tier}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIER_STYLES[tier].bg}`}
                    >
                      {tier.replace('_', ' ')} —{' '}
                      {tier === 'TIER_1'
                        ? 'Generic'
                        : tier === 'TIER_2'
                          ? 'Preferred Brand'
                          : tier === 'TIER_3'
                            ? 'Non-Preferred Brand'
                            : tier === 'TIER_4'
                              ? 'Specialty'
                              : 'High-Cost Specialty'}
                    </span>
                  )
                )}
              </div>

              {formularyLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <span className="ml-2 text-sm text-gray-500">Searching formulary...</span>
                </div>
              )}

              {formularyResults.length > 0 && !formularyLoading && (
                <div className="space-y-3">
                  {formularyResults.map((drug, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-gray-900">{drug.drugName}</p>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIER_STYLES[drug.tier].bg}`}
                            >
                              {drug.tierLabel}
                            </span>
                            {drug.isGeneric && (
                              <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200">
                                Generic
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{drug.genericName}</p>
                          <p className="text-xs text-gray-400">{drug.therapeuticClass}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-3">
                          {drug.requiresPriorAuthorization && (
                            <span className="flex items-center gap-1 text-xs text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                              <AlertTriangle className="w-3 h-3" />
                              Prior Auth Required
                            </span>
                          )}
                          {drug.requiresStepTherapy && (
                            <span className="flex items-center gap-1 text-xs text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-200">
                              <Info className="w-3 h-3" />
                              Step Therapy
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Copay Table */}
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        {[
                          { label: 'Retail 30-day', value: drug.copayRetail30 },
                          { label: 'Retail 90-day', value: drug.copayRetail90 },
                          { label: 'Mail Order 90-day', value: drug.copayMail90 },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="text-center bg-gray-50 rounded-lg py-2 px-3"
                          >
                            <p className="text-xs text-gray-500">{item.label}</p>
                            <p className="text-sm font-bold text-gray-900 mt-0.5">
                              {item.value !== null ? fmtCurrency(item.value) : '—'}
                            </p>
                          </div>
                        ))}
                      </div>

                      {drug.quantityLimits && (
                        <p className="text-xs text-gray-500">
                          <span className="font-medium">Quantity Limit:</span> {drug.quantityLimits}
                        </p>
                      )}

                      {drug.alternatives.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs font-semibold text-gray-500 mb-2">
                            Cost-Saving Alternatives
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {drug.alternatives.map((alt) => (
                              <div
                                key={alt.drugName}
                                className="flex items-center gap-1.5 text-xs bg-green-50 border border-green-200 text-green-700 px-2.5 py-1 rounded-lg"
                              >
                                <span className="font-medium">{alt.drugName}</span>
                                <span
                                  className={`px-1.5 py-0.5 rounded text-xs font-medium ${TIER_STYLES[alt.tier].bg}`}
                                >
                                  {alt.tier.replace('_', ' ')}
                                </span>
                                {alt.estimatedSavings && (
                                  <span className="text-green-600">
                                    Save ~{fmtCurrency(alt.estimatedSavings)}/yr
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {formularyResults.length === 0 && !formularyLoading && drugSearch && (
                <div className="text-center py-8 text-gray-400">
                  <Pill className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No formulary results found for &quot;{drugSearch}&quot;</p>
                  <p className="text-xs mt-1">
                    Try searching by generic name (e.g., atorvastatin, semaglutide)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Telemedicine Section ──────────────────────────────────────── */}
          {activeSection === 'telemedicine' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Telemedicine & Virtual Care
                </h3>
                <p className="text-xs text-gray-500">
                  Virtual care services covered by your health plan — available 24/7 at no extra
                  cost
                </p>
              </div>

              {teleLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teleProviders.map((tp) => (
                    <div
                      key={tp.id}
                      className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{tp.name}</p>
                          <p className="text-xs text-gray-500">Platform: {tp.platform}</p>
                        </div>
                        {tp.isAvailable247 && (
                          <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full border border-green-200">
                            24/7
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Avg. Wait Time</span>
                          <span className="font-medium text-gray-800 flex items-center gap-1">
                            <Clock className="w-3 h-3" />~{tp.averageWaitMinutes} min
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Visit Copay</span>
                          <span
                            className={`font-bold ${tp.visitCopay === 0 ? 'text-green-600' : 'text-gray-800'}`}
                          >
                            {tp.visitCopay === 0 ? 'FREE' : fmtCurrency(tp.visitCopay)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">App Rating</span>
                          <span className="font-medium text-gray-800">{tp.appStoreRating} ⭐</span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-500 mb-1.5">Specialties</p>
                        <div className="flex flex-wrap gap-1">
                          {tp.specialties.map((s) => (
                            <span
                              key={s}
                              className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-500 mb-1.5">Languages</p>
                        <p className="text-xs text-gray-700">{tp.languages.join(', ')}</p>
                      </div>

                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-500 mb-1.5">Features</p>
                        <div className="flex flex-wrap gap-1">
                          {tp.features.slice(0, 3).map((f) => (
                            <span
                              key={f}
                              className="flex items-center gap-0.5 text-xs text-gray-600 bg-gray-50 px-2 py-0.5 rounded"
                            >
                              <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button className="w-full mt-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors">
                        Start Virtual Visit
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
