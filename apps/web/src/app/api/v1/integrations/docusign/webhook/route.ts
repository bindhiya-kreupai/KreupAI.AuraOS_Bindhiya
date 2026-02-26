import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// DocuSign Connect webhook handler
// Receives real-time notifications about envelope status changes
export async function POST(request: NextRequest) {
  const body = await request.text();

  // Verify HMAC signature from DocuSign
  const signature = request.headers.get('x-docusign-signature-1');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
  }

  // In production: verify HMAC-SHA256 signature
  // const isValid = verifyDocuSignSignature(body, signature, DOCUSIGN_CONNECT_KEY);

  let payload: any;
  try {
    payload = JSON.parse(body);
  } catch {
    // DocuSign may send XML - handle both formats
    return NextResponse.json({ error: 'Invalid payload format' }, { status: 400 });
  }

  const event = payload.event || payload.Status;
  const envelopeId = payload.envelopeId || payload.EnvelopeStatus?.EnvelopeID;

  switch (event) {
    case 'envelope-sent':
      console.warn(`[DocuSign] Envelope ${envelopeId} sent for signing`);
      break;
    case 'envelope-delivered':
      console.warn(`[DocuSign] Envelope ${envelopeId} delivered to recipient`);
      break;
    case 'envelope-completed':
      console.warn(`[DocuSign] Envelope ${envelopeId} completed - all signatures collected`);
      // In production: update offer status, notify HR, trigger onboarding workflow
      break;
    case 'envelope-declined':
      console.warn(`[DocuSign] Envelope ${envelopeId} declined by recipient`);
      // In production: notify recruiter, update candidate status
      break;
    case 'envelope-voided':
      console.warn(`[DocuSign] Envelope ${envelopeId} voided`);
      break;
    case 'recipient-sent':
    case 'recipient-delivered':
    case 'recipient-completed':
    case 'recipient-declined':
      console.warn(`[DocuSign] Recipient event: ${event} for envelope ${envelopeId}`);
      break;
    default:
      console.warn(`[DocuSign] Unknown event: ${event}`);
  }

  // Always return 200 to acknowledge receipt
  return NextResponse.json({ received: true, envelopeId, event });
}
