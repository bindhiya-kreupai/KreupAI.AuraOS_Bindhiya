/**
 * @api POST /api/v1/payroll/direct-deposit/verify
 * @description Verify bank account for direct deposit using Plaid integration
 */

import { NextRequest, NextResponse } from 'next/server';

interface PlaidVerificationResult {
  id: string;
  employeeId: string;
  status: 'verified' | 'pending_micro_deposits' | 'failed' | 'pending_manual_review';
  bankName: string;
  accountType: 'checking' | 'savings';
  accountNumberLast4: string;
  routingNumber: string;
  verificationMethod: 'instant' | 'micro_deposit' | 'manual';
  verifiedAt: string | null;
  expiresAt: string | null;
  plaidItemId?: string;
  error?: string;
}

interface PlaidLinkRequest {
  publicToken?: string;
  accountId?: string;
  employeeId: string;
  verificationMethod?: 'instant' | 'micro_deposit';
  microDepositAmounts?: [number, number];
}

export async function POST(request: NextRequest) {
  try {
    const body: PlaidLinkRequest = await request.json();
    const { publicToken, accountId, employeeId, verificationMethod, microDepositAmounts } = body;

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'employeeId is required' },
        { status: 400 }
      );
    }

    // Case 1: Verify micro-deposit amounts
    if (microDepositAmounts) {
      if (!Array.isArray(microDepositAmounts) || microDepositAmounts.length !== 2) {
        return NextResponse.json(
          { error: 'Validation Error', message: 'microDepositAmounts must be an array of exactly 2 amounts' },
          { status: 422 }
        );
      }

      // Simulate micro-deposit verification
      const correctAmounts = [0.12, 0.34]; // Mock expected amounts
      const isCorrect = microDepositAmounts[0] === correctAmounts[0] && microDepositAmounts[1] === correctAmounts[1];

      const result: PlaidVerificationResult = {
        id: 'dd-verify-' + Date.now().toString(36),
        employeeId,
        status: isCorrect ? 'verified' : 'failed',
        bankName: 'Chase Bank',
        accountType: 'checking',
        accountNumberLast4: '4567',
        routingNumber: '021000021',
        verificationMethod: 'micro_deposit',
        verifiedAt: isCorrect ? new Date().toISOString() : null,
        expiresAt: null,
        error: isCorrect ? undefined : 'Micro-deposit amounts do not match',
      };

      return NextResponse.json({ data: result }, { status: isCorrect ? 200 : 422 });
    }

    // Case 2: Instant verification via Plaid public token exchange
    if (publicToken) {
      // In production: exchange public_token for access_token via Plaid API
      // const response = await plaidClient.itemPublicTokenExchange({ public_token: publicToken });
      // const accessToken = response.data.access_token;
      // const authResponse = await plaidClient.authGet({ access_token: accessToken });

      const result: PlaidVerificationResult = {
        id: 'dd-verify-' + Date.now().toString(36),
        employeeId,
        status: 'verified',
        bankName: 'Chase Bank',
        accountType: 'checking',
        accountNumberLast4: '4567',
        routingNumber: '021000021',
        verificationMethod: 'instant',
        verifiedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        plaidItemId: 'item_' + Date.now().toString(36),
      };

      return NextResponse.json({
        data: result,
        message: 'Bank account verified successfully via Plaid instant verification.',
      }, { status: 200 });
    }

    // Case 3: Initiate micro-deposit verification
    if (verificationMethod === 'micro_deposit') {
      // In production: initiate micro-deposits via Plaid or direct ACH
      const result: PlaidVerificationResult = {
        id: 'dd-verify-' + Date.now().toString(36),
        employeeId,
        status: 'pending_micro_deposits',
        bankName: body.bankName || 'Unknown Bank',
        accountType: (body as any).accountType || 'checking',
        accountNumberLast4: (body as any).accountNumberLast4 || '****',
        routingNumber: (body as any).routingNumber || '000000000',
        verificationMethod: 'micro_deposit',
        verifiedAt: null,
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      };

      return NextResponse.json({
        data: result,
        message: 'Micro-deposits initiated. Two small deposits will appear in your account within 1-3 business days. Please verify the amounts to complete verification.',
        nextStep: 'POST /api/v1/payroll/direct-deposit/verify with microDepositAmounts',
      }, { status: 202 });
    }

    // Case 4: Generate Plaid Link token for client-side integration
    // In production: const linkToken = await plaidClient.linkTokenCreate({ ... });
    const linkToken = 'link-sandbox-' + Date.now().toString(36);

    return NextResponse.json({
      data: {
        linkToken,
        expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        environment: process.env.PLAID_ENV || 'sandbox',
      },
      message: 'Use this link token with Plaid Link to verify your bank account.',
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
