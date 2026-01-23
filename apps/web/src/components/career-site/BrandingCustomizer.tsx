"use client";

import React from "react";
import { Palette, Type, Upload, FileImage } from "lucide-react";
import type { CareerSiteBranding } from "./CareerSiteBuilder";

interface BrandingCustomizerProps {
  branding: CareerSiteBranding;
  onChange: (branding: CareerSiteBranding) => void;
}

export default function BrandingCustomizer({ branding, onChange }: BrandingCustomizerProps) {
  const update = (field: keyof CareerSiteBranding, value: string) => {
    onChange({ ...branding, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colors */}
        <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/30">
          <h3 className="text-lg font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-celestial-indigo" />
            Brand Colors
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg border border-cloud dark:border-nebula-purple/30" style={{ backgroundColor: branding.primaryColor }} />
                <div>
                  <p className="text-sm font-medium text-ink-black dark:text-pearl">Primary Color</p>
                  <p className="text-xs text-silver-mist font-mono">{branding.primaryColor}</p>
                </div>
              </div>
              <input type="color" value={branding.primaryColor} onChange={(e) => update("primaryColor", e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
            </div>
          </div>
        </div>

        {/* Hero Text */}
        <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/30">
          <h3 className="text-lg font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
            <Type className="w-5 h-5 text-celestial-indigo" />
            Hero Section
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-ink-black dark:text-pearl block mb-1">Title</label>
              <input type="text" value={branding.heroTitle} onChange={(e) => update("heroTitle", e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/30 rounded-lg text-sm text-ink-black dark:text-pearl" />
            </div>
            <div>
              <label className="text-sm font-medium text-ink-black dark:text-pearl block mb-1">Subtitle</label>
              <textarea value={branding.heroSubtitle} onChange={(e) => update("heroSubtitle", e.target.value)} rows={3} className="w-full px-3 py-2 bg-gray-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/30 rounded-lg text-sm text-ink-black dark:text-pearl resize-none" />
            </div>
          </div>
        </div>

        {/* Logo */}
        <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/30">
          <h3 className="text-lg font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
            <FileImage className="w-5 h-5 text-celestial-indigo" />
            Logo
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gray-100 dark:bg-deep-cosmos rounded-xl border-2 border-dashed border-cloud dark:border-nebula-purple/30 flex items-center justify-center">
              <FileImage className="w-8 h-8 text-silver-mist" />
            </div>
            <div>
              <p className="text-xs text-silver-mist">Recommended: 200x50px, PNG or SVG</p>
              <button className="mt-2 px-3 py-1.5 bg-gray-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/30 rounded-lg text-xs font-medium flex items-center gap-1.5 text-ink-black dark:text-pearl">
                <Upload className="w-3.5 h-3.5" />
                Upload Logo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
