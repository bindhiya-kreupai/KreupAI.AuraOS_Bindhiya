/**
 * @module CurrenciesPage
 * @description Currencies master data management page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

'use client';

import { EmptyPage } from '@/components/ui';

export default function CurrenciesPage() {
  return (
    <EmptyPage
      module="Currencies"
      icon="currency"
      features={[
        'Add Currency',
        'Edit Currency',
        'Delete Currency',
        'View All Currencies',
        'Search Currencies',
        'Set Exchange Rates',
        'Currency Conversion',
      ]}
    />
  );
}

