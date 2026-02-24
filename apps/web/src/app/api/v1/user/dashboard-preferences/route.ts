/**
 * Dashboard Preferences API Routes
 * POST - Save user dashboard layout preferences
 * GET  - Load user dashboard layout preferences
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

// In-memory store as fallback (in production, use database)
const preferencesStore = new Map<string, any>();

/**
 * POST /api/v1/user/dashboard-preferences
 * Save the user's dashboard layout, widget visibility, and preferences
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const body = await request.json();

    if (!body.preferences) {
      return NextResponse.json(
        { success: false, error: 'preferences field is required' },
        { status: 400 }
      );
    }

    // Store preferences keyed by user ID
    const key = `${user.tenantId}:${user.id}`;
    preferencesStore.set(key, {
      preferences: body.preferences,
      updatedAt: new Date().toISOString(),
      updatedBy: user.id,
    });

    return NextResponse.json({
      success: true,
      data: {
        message: 'Dashboard preferences saved successfully',
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save dashboard preferences' },
      { status: 500 }
    );
  }
});

/**
 * GET /api/v1/user/dashboard-preferences
 * Load the user's saved dashboard preferences
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const key = `${user.tenantId}:${user.id}`;
    const stored = preferencesStore.get(key);

    if (!stored) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No saved preferences found, using defaults',
      });
    }

    return NextResponse.json({
      success: true,
      data: stored,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load dashboard preferences' },
      { status: 500 }
    );
  }
});
