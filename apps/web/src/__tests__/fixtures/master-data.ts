/**
 * Master Data Test Fixtures
 */

export const mockCountries = [
  {
    id: 'country-us',
    name: 'United States',
    code: 'US',
    isActive: true,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  },
  {
    id: 'country-uk',
    name: 'United Kingdom',
    code: 'GB',
    isActive: true,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  },
  {
    id: 'country-ca',
    name: 'Canada',
    code: 'CA',
    isActive: true,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  },
  {
    id: 'country-de',
    name: 'Germany',
    code: 'DE',
    isActive: true,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  },
  {
    id: 'country-fr',
    name: 'France',
    code: 'FR',
    isActive: true,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  },
];

export const mockStates = [
  {
    id: 'state-ca',
    name: 'California',
    code: 'CA',
    countryId: 'country-us',
    isActive: true,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  },
  {
    id: 'state-ny',
    name: 'New York',
    code: 'NY',
    countryId: 'country-us',
    isActive: true,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  },
  {
    id: 'state-tx',
    name: 'Texas',
    code: 'TX',
    countryId: 'country-us',
    isActive: true,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  },
  {
    id: 'state-on',
    name: 'Ontario',
    code: 'ON',
    countryId: 'country-ca',
    isActive: true,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  },
  {
    id: 'state-bc',
    name: 'British Columbia',
    code: 'BC',
    countryId: 'country-ca',
    isActive: true,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  },
];

export const mockCities = [
  {
    id: 'city-la',
    name: 'Los Angeles',
    stateId: 'state-ca',
    isActive: true,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  },
  {
    id: 'city-sf',
    name: 'San Francisco',
    stateId: 'state-ca',
    isActive: true,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  },
  {
    id: 'city-nyc',
    name: 'New York City',
    stateId: 'state-ny',
    isActive: true,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  },
  {
    id: 'city-houston',
    name: 'Houston',
    stateId: 'state-tx',
    isActive: true,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  },
  {
    id: 'city-toronto',
    name: 'Toronto',
    stateId: 'state-on',
    isActive: true,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  },
];

export const mockCurrencies = [
  {
    id: 'curr-usd',
    name: 'US Dollar',
    code: 'USD',
    symbol: '$',
    isActive: true,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  },
  {
    id: 'curr-eur',
    name: 'Euro',
    code: 'EUR',
    symbol: '€',
    isActive: true,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  },
  {
    id: 'curr-gbp',
    name: 'British Pound',
    code: 'GBP',
    symbol: '£',
    isActive: true,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  },
  {
    id: 'curr-cad',
    name: 'Canadian Dollar',
    code: 'CAD',
    symbol: 'C$',
    isActive: true,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  },
];

export const mockLanguages = [
  {
    id: 'lang-en',
    name: 'English',
    code: 'en',
    isActive: true,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  },
  {
    id: 'lang-es',
    name: 'Spanish',
    code: 'es',
    isActive: true,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  },
  {
    id: 'lang-fr',
    name: 'French',
    code: 'fr',
    isActive: true,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  },
  {
    id: 'lang-de',
    name: 'German',
    code: 'de',
    isActive: true,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  },
];

export const mockMasterData = {
  countries: mockCountries,
  states: mockStates,
  cities: mockCities,
  currencies: mockCurrencies,
  languages: mockLanguages,
};
