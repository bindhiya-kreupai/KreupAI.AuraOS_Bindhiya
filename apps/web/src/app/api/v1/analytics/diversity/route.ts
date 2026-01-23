import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const diversityData = {
    generatedAt: '2026-01-23T00:00:00Z',
    totalEmployees: 1247,
    gender: {
      distribution: [
        { category: 'Male', count: 648, percentage: 52.0 },
        { category: 'Female', count: 536, percentage: 43.0 },
        { category: 'Non-binary', count: 45, percentage: 3.6 },
        { category: 'Prefer not to say', count: 18, percentage: 1.4 },
      ],
      leadershipRepresentation: {
        male: 54.0,
        female: 40.0,
        nonBinary: 4.0,
        other: 2.0,
      },
      trend: [
        { year: 2023, female: 38.5, nonBinary: 2.1 },
        { year: 2024, female: 40.8, nonBinary: 2.9 },
        { year: 2025, female: 43.0, nonBinary: 3.6 },
      ],
    },
    ethnicity: {
      distribution: [
        { category: 'White', count: 486, percentage: 39.0 },
        { category: 'Asian', count: 312, percentage: 25.0 },
        { category: 'Hispanic/Latino', count: 174, percentage: 14.0 },
        { category: 'Black/African American', count: 137, percentage: 11.0 },
        { category: 'Two or More Races', count: 62, percentage: 5.0 },
        { category: 'Other', count: 38, percentage: 3.0 },
        { category: 'Prefer not to say', count: 38, percentage: 3.0 },
      ],
      leadershipRepresentation: {
        white: 42.0,
        asian: 24.0,
        hispanicLatino: 12.0,
        blackAfricanAmerican: 14.0,
        other: 8.0,
      },
    },
    age: {
      distribution: [
        { range: '18-25', count: 125, percentage: 10.0 },
        { range: '26-35', count: 449, percentage: 36.0 },
        { range: '36-45', count: 374, percentage: 30.0 },
        { range: '46-55', count: 199, percentage: 16.0 },
        { range: '56+', count: 100, percentage: 8.0 },
      ],
      averageAge: 36.4,
      medianAge: 34,
    },
    payEquity: {
      genderPayGap: 3.2,
      ethnicityPayGap: 4.1,
      trend: 'narrowing',
      lastAudit: '2025-12-01T00:00:00Z',
    },
    deiInitiatives: [
      { name: 'Women in Leadership Program', participants: 45, status: 'active' },
      { name: 'Inclusive Hiring Training', participants: 128, status: 'active' },
      { name: 'ERG Support Fund', groups: 8, budget: 240000, status: 'active' },
      { name: 'Unconscious Bias Workshop', participants: 890, status: 'completed' },
    ],
    deiScore: {
      overall: 78,
      representation: 82,
      inclusion: 75,
      belonging: 76,
      industryBenchmark: 72,
    },
  };

  return NextResponse.json({ success: true, data: diversityData });
}
