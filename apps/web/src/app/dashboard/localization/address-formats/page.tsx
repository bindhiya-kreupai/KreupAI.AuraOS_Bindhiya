'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Eye, Loader2 } from 'lucide-react';

interface Country {
  id: string;
  isoCode: string;
  name: string;
  currency: string;
}

interface AddressFormat {
  fields: string[];
  format: string;
  sample: Record<string, string>;
}

/**
 * Address input/display templates keyed by ISO code. Config-driven — the country
 * list is loaded from the real /api/master-data/countries endpoint.
 */
const ADDRESS_FORMAT_CONFIG: Record<string, AddressFormat> = {
  US: {
    fields: ['Street Address', 'Apt/Suite', 'City', 'State', 'Zip Code'],
    format: '{address}\n{city}, {state} {zip}',
    sample: { address: '123 Main St', city: 'Anytown', state: 'NY', zip: '10001' },
  },
  GB: {
    fields: ['Address Line 1', 'Address Line 2', 'Town/City', 'County', 'Postcode'],
    format: '{address1}\n{town}\n{postcode}',
    sample: { address1: '10 Downing St', town: 'London', postcode: 'SW1A 2AA' },
  },
  AE: {
    fields: ['Building/Villa', 'Street', 'Area', 'Emirate', 'PO Box'],
    format: '{building}, {street}\n{area}, {emirate}\nP.O. Box {pobox}',
    sample: {
      building: 'Villa 12',
      street: 'Al Wasl Rd',
      area: 'Jumeirah',
      emirate: 'Dubai',
      pobox: '12345',
    },
  },
  SA: {
    fields: ['Building No', 'Street', 'District', 'City', 'Postal Code', 'Additional No'],
    format: '{building} {street}\n{district}, {city} {postal}',
    sample: {
      building: '3847',
      street: 'King Fahd Rd',
      district: 'Al Olaya',
      city: 'Riyadh',
      postal: '12211',
    },
  },
  IN: {
    fields: ['House No/Building', 'Street/Area', 'City', 'State', 'Pincode'],
    format: '{house}, {street}\n{city} - {pincode}, {state}',
    sample: {
      house: '#42, Sunshine Apts',
      street: 'MG Road',
      city: 'Bengaluru',
      pincode: '560001',
      state: 'Karnataka',
    },
  },
};

const DEFAULT_FORMAT: AddressFormat = {
  fields: ['Address Line 1', 'City', 'Region', 'Postal Code'],
  format: '{address1}\n{city}, {region} {postal}',
  sample: { address1: '1 Example St', city: 'Capital', region: 'Region', postal: '00000' },
};

function renderPreview(fmt: AddressFormat): string {
  return fmt.format.replace(/\{(\w+)\}/g, (_, key) => fmt.sample[key] ?? `{${key}}`);
}

export default function AddressFormatsPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCountries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/master-data/countries?limit=100');
      if (!response.ok) {
        throw new Error('Failed to load countries');
      }
      const result = await response.json();
      setCountries(result.data ?? []);
    } catch (err) {
      console.error('Failed to fetch countries:', err);
      setError('Unable to load countries. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  return (
    <div className="space-y-4 pb-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="w-6 h-6 text-indigo-500" />
            Address Formats
          </h1>
          <p className="text-slate-500 text-sm">
            Configure address input fields and display formats per country.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading countries...
        </div>
      ) : countries.length === 0 ? (
        <div className="py-16 text-center text-slate-500">
          No countries configured. Add countries under Master Data.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {countries.map((country) => {
            const fmt = ADDRESS_FORMAT_CONFIG[country.isoCode] ?? DEFAULT_FORMAT;
            return (
              <div
                key={country.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg">{country.name}</h3>
                  <span className="text-xs font-mono text-slate-400 uppercase">
                    {country.isoCode}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <div className="text-xs font-bold text-slate-400 uppercase mb-2">
                      Input Fields
                    </div>
                    <ul className="space-y-1">
                      {fmt.fields.map((field) => (
                        <li key={field} className="text-sm flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> {field}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                    <div className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Preview
                    </div>
                    <div className="text-sm font-mono text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                      {renderPreview(fmt)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
