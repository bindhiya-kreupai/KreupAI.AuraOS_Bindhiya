import dynamicImport from 'next/dynamic';
import React from 'react';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

const GroundOpsClient = dynamicImport(() => import('./client'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
    </div>
  ),
});

export default function GroundOpsPage() {
  return <GroundOpsClient />;
}

