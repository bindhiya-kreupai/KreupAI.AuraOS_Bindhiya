'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ESignaturePortal } from '@/components/recruitment/ESignaturePortal';
import type { SignatureEnvelope, SignatureStatus } from '@/components/recruitment/ESignaturePortal';
import { APIClient } from '@/lib/api-client';

interface OfferRecord {
  id: string;
  status: string;
  documentUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  expiryDate?: string | null;
  sentDate?: string | null;
  acceptedDate?: string | null;
  approvedDate?: string | null;
  application?: {
    candidate?: { firstName?: string; lastName?: string; email?: string };
    jobPosting?: { title?: string };
  };
}

const STATUS_MAP: Record<string, SignatureStatus> = {
  draft: 'draft',
  approved: 'sent',
  sent: 'sent',
  viewed: 'viewed',
  accepted: 'signed',
  signed: 'signed',
  declined: 'declined',
  expired: 'expired',
  voided: 'voided',
};

function toEnvelope(offer: OfferRecord): SignatureEnvelope {
  const cand = offer.application?.candidate;
  const candidateName = `${cand?.firstName ?? ''} ${cand?.lastName ?? ''}`.trim() || 'Candidate';
  const status = STATUS_MAP[offer.status.toLowerCase()] ?? 'draft';
  const createdAt = offer.createdAt ?? new Date().toISOString();
  const updatedAt = offer.updatedAt ?? createdAt;
  return {
    id: offer.id,
    envelopeId: offer.id.slice(0, 8).toUpperCase(),
    documentName: `Offer Letter — ${candidateName}`,
    candidateName,
    jobTitle: offer.application?.jobPosting?.title ?? 'Position',
    status,
    provider: 'aura_sign',
    signers: [
      {
        id: `${offer.id}-candidate`,
        name: candidateName,
        email: cand?.email ?? '',
        role: 'candidate',
        order: 1,
        status,
        signedAt: offer.acceptedDate ?? undefined,
      },
    ],
    auditTrail: [
      {
        id: `${offer.id}-created`,
        timestamp: createdAt,
        action: 'created',
        actor: 'System',
        details: 'Offer created',
      },
      ...(offer.sentDate
        ? [
            {
              id: `${offer.id}-sent`,
              timestamp: offer.sentDate,
              action: 'sent',
              actor: 'HR',
              details: 'Offer sent for signature',
            },
          ]
        : []),
    ],
    createdAt,
    updatedAt,
    expiresAt: offer.expiryDate ?? updatedAt,
    completedAt: offer.acceptedDate ?? undefined,
    documentUrl: offer.documentUrl ?? undefined,
  };
}

export default function ESignaturePage() {
  const [envelopes, setEnvelopes] = useState<SignatureEnvelope[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await APIClient.get<{ data?: OfferRecord[] }>('/v1/recruitment/offers', {
        limit: 100,
      });
      setEnvelopes((res.data ?? []).map(toEnvelope));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load offers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const runAction = useCallback(
    async (offerId: string, action: 'send' | 'decline', reason?: string) => {
      setError(null);
      try {
        await APIClient.post('/v1/recruitment/offers/e-sign', {
          offerId,
          action,
          ...(reason ? { reason } : {}),
        });
        await loadData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Action failed');
      }
    },
    [loadData]
  );

  const handleSend = useCallback((id: string) => void runAction(id, 'send'), [runAction]);
  const handleVoid = useCallback(
    (id: string) => void runAction(id, 'decline', 'Voided by HR'),
    [runAction]
  );
  const handleResend = useCallback((id: string) => void runAction(id, 'send'), [runAction]);
  const handleDownload = useCallback(
    (id: string) => {
      const env = envelopes.find((e) => e.id === id);
      if (env?.documentUrl) {
        window.open(env.documentUrl, '_blank', 'noopener,noreferrer');
      } else {
        setError('No signed document is available to download for this offer yet.');
      }
    },
    [envelopes]
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {error && (
        <div
          className="mb-4 rounded-lg border border-coral-alert/40 bg-coral-alert/10 px-3 py-2 text-[11px] font-medium text-coral-alert"
          role="alert"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-celestial-indigo" />
        </div>
      ) : (
        <ESignaturePortal
          envelopes={envelopes}
          onSendEnvelope={handleSend}
          onVoidEnvelope={handleVoid}
          onResendEnvelope={handleResend}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
}
