/**
 * @module TaxDocumentsPage
 * @description Tax Documents Viewer — W-2, 1099, Form 16 document management with PDF preview
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback } from 'react';
import { FileText, Info, Shield } from 'lucide-react';
import { TaxYearSelector } from '@/components/tax/TaxYearSelector';
import { TaxDocumentsList } from '@/components/tax/TaxDocumentsList';
import { TaxDocumentViewer } from '@/components/tax/TaxDocumentViewer';
import type { TaxRegion } from '@/components/tax/TaxYearSelector';
import type { TaxDocument } from '@/components/tax/TaxDocumentsList';

export default function TaxDocumentsPage() {
  const currentYear = new Date().getFullYear();
  const [region, setRegion] = useState<TaxRegion>('us');
  const [selectedYear, setSelectedYear] = useState(
    region === 'india' ? `${currentYear - 1}-${String(currentYear).slice(-2)}` : String(currentYear)
  );
  const [selectedDocument, setSelectedDocument] = useState<TaxDocument | null>(null);

  const handleRegionChange = useCallback((newRegion: TaxRegion) => {
    setRegion(newRegion);
    setSelectedDocument(null);
    const yr = new Date().getFullYear();
    if (newRegion === 'india') {
      const fy = new Date().getMonth() >= 3 ? yr : yr - 1;
      setSelectedYear(`${fy}-${String(fy + 1).slice(-2)}`);
    } else {
      setSelectedYear(String(yr));
    }
  }, []);

  const handleYearChange = useCallback((year: string) => {
    setSelectedYear(year);
    setSelectedDocument(null);
  }, []);

  const handleSelectDocument = useCallback((doc: TaxDocument) => {
    setSelectedDocument(doc);
  }, []);

  const handleDownload = useCallback((doc: TaxDocument) => {
    const link = document.createElement('a');
    link.href = doc.fileUrl;
    link.download = `${doc.formType}_${doc.taxYear}_${doc.issuer.replace(/\s+/g, '_')}.pdf`;
    link.click();
  }, []);

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <FileText className="w-5 h-5 text-celestial-indigo" />
            Tax Documents
          </h1>
          <p className="text-sm text-silver-mist mt-0.5">
            View and download your W-2, 1099, Form 16, and other tax documents.
          </p>
        </div>
        <TaxYearSelector
          selectedYear={selectedYear}
          onYearChange={handleYearChange}
          region={region}
          onRegionChange={handleRegionChange}
        />
      </div>

      {/* Info Banner */}
      <div className="bg-celestial-indigo/5 dark:bg-celestial-indigo/10 rounded-xl p-3 flex items-start gap-3">
        <Info className="w-4 h-4 text-celestial-indigo mt-0.5 shrink-0" />
        <div>
          <p className="text-xs text-ink-black dark:text-pearl font-medium">
            {region === 'us'
              ? `Tax Year ${selectedYear} Documents`
              : `Financial Year ${selectedYear} Documents`}
          </p>
          <p className="text-[10px] text-silver-mist mt-0.5">
            {region === 'us'
              ? 'W-2 forms are typically available by January 31. 1099 forms may arrive through mid-February.'
              : 'Form 16 is typically issued by June 15. Form 26AS is available on the TRACES portal.'}
          </p>
        </div>
      </div>

      {/* Main Content - List + Preview */}
      <div className="flex gap-4 min-h-[calc(100vh-18rem)]">
        {/* Document List */}
        <div className={`${selectedDocument ? 'w-1/2 xl:w-2/5' : 'w-full'} transition-all`}>
          <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 p-4">
            <TaxDocumentsList
              selectedYear={selectedYear}
              region={region}
              onSelectDocument={handleSelectDocument}
              onDownload={handleDownload}
              selectedDocumentId={selectedDocument?.id}
            />
          </div>
        </div>

        {/* Document Viewer */}
        {selectedDocument && (
          <div className="w-1/2 xl:w-3/5">
            <TaxDocumentViewer
              document={selectedDocument}
              onClose={() => setSelectedDocument(null)}
              onDownload={handleDownload}
            />
          </div>
        )}
      </div>

      {/* Security Footer */}
      <div className="flex items-center gap-2 px-1">
        <Shield className="w-3.5 h-3.5 text-silver-mist/40" />
        <p className="text-[10px] text-silver-mist/60">
          Tax documents are encrypted and stored securely. Access is restricted to you and
          authorized personnel only.
        </p>
      </div>
    </div>
  );
}
