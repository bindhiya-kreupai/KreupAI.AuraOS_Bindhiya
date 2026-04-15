import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

/**
 * POST /api/v1/integrations/docusign/webhook
 * DocuSign Connect webhook — no JWT auth (called by DocuSign servers)
 * Security: HMAC signature verification
 */
export async function POST(request: NextRequest) {
  const body = await request.text();

  // Verify HMAC signature from DocuSign
  const signature = request.headers.get('x-docusign-signature-1');
  if (!signature) {
    logger.warn('DocuSign webhook received without signature');
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
  }

  // TODO: Implement proper HMAC-SHA256 verification
  // const DOCUSIGN_CONNECT_KEY = process.env.DOCUSIGN_CONNECT_KEY;
  // if (!DOCUSIGN_CONNECT_KEY) {
  //   throw new Error('DOCUSIGN_CONNECT_KEY not configured');
  // }
  // const isValid = verifyDocuSignSignature(body, signature, DOCUSIGN_CONNECT_KEY);
  // if (!isValid) {
  //   logger.warn('DocuSign webhook signature verification failed');
  //   return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
  // }

  let payload: any;
  try {
    payload = JSON.parse(body);
  } catch {
    // DocuSign may send XML - handle both formats
    return NextResponse.json({ error: 'Invalid payload format' }, { status: 400 });
  }

  const event = payload.event || payload.Status;
  const envelopeId = payload.envelopeId || payload.EnvelopeStatus?.EnvelopeID;

  logger.info({ event, envelopeId }, 'DocuSign webhook received');

  switch (event) {
    case 'envelope-sent':
      logger.info({ envelopeId }, 'Envelope sent for signing');
      break;
    case 'envelope-delivered':
      logger.info({ envelopeId }, 'Envelope delivered to recipient');
      break;
    case 'envelope-completed':
      logger.info({ envelopeId }, 'Envelope completed - all signatures collected');
      // TODO: update offer status, notify HR, trigger onboarding workflow
      break;
    case 'envelope-declined':
      logger.warn({ envelopeId }, 'Envelope declined by recipient');
      // TODO: notify recruiter, update candidate status
      break;
    case 'envelope-voided':
      logger.warn({ envelopeId }, 'Envelope voided');
      break;
    case 'recipient-sent':
    case 'recipient-delivered':
    case 'recipient-completed':
    case 'recipient-declined':
      logger.info({ event, envelopeId }, 'Recipient event');
      break;
    default:
      logger.warn({ event, envelopeId }, 'Unknown DocuSign event');
  }

  // Always return 200 to acknowledge receipt
  return NextResponse.json({ received: true, envelopeId, event });
}
