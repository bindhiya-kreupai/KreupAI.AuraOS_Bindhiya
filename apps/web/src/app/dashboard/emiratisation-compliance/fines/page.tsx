'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FinesRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/emiratisation-compliance?tab=fines');
  }, [router]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        <p className="text-sm font-semibold text-slate-600">
          Redirecting to Compliance Command Center…
        </p>
      </div>
    </div>
  );
}
