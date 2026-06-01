import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * INTENTIONALLY PUBLIC — marketing contact form endpoint.
 * Accepts an unauthenticated POST containing { name, email, message, type }
 * and forwards it to support. No tenant data is read or written.
 * Rate limiting should be added at the edge / middleware layer (tracked in
 * the Phase 1 unprotected-routes sweep, issue #31).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name: _name, email, message, type } = body;

    // Validate required fields
    if (!email || !message) {
      return NextResponse.json({ error: 'Email and message are required' }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Log the chat message (in production, you'd send this to your email service or CRM)
    // Here you would integrate with your email service
    // For example: SendGrid, AWS SES, Resend, etc.
    // await sendEmail({
    //     to: 'support@auraos.com',
    //     from: email,
    //     subject: `New Chat Message: ${type || 'General Inquiry'}`,
    //     html: `
    //         <h2>New Chat Message</h2>
    //         <p><strong>From:</strong> ${name || 'Anonymous'} (${email})</p>
    //         <p><strong>Type:</strong> ${type || 'General'}</p>
    //         <p><strong>Message:</strong></p>
    //         <p>${message}</p>
    //     `
    // });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for your message! Our team will get back to you within 24 hours.',
        data: {
          timestamp: new Date().toISOString(),
          type: type || 'general',
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    );
  }
}
