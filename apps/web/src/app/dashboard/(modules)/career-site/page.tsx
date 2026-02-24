'use client';

import React from 'react';
import { CareerSiteBuilder } from '@/components/career-site/CareerSiteBuilder';

export default function CareerSitePage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <CareerSiteBuilder
        companyName="AURA Technologies"
        companyTagline="Build the Future of Work"
      />
    </div>
  );
}
