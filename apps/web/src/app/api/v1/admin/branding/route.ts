import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  const { user, permissions } = context;
  if (!permissions.includes('admin/branding:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing admin/branding:read permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  const _tenantId = user.tenantId;

  const brandingConfig = {
    companyName: 'KreupAI Technologies',
    tagline: 'Empowering People, Driving Growth',
    logo: {
      primary: '/branding/logo-primary.svg',
      secondary: '/branding/logo-secondary.svg',
      favicon: '/branding/favicon.ico',
      darkMode: '/branding/logo-dark.svg',
    },
    colors: {
      primary: '#2563eb',
      primaryDark: '#1d4ed8',
      primaryLight: '#60a5fa',
      secondary: '#7c3aed',
      accent: '#06b6d4',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#ffffff',
      backgroundDark: '#0f172a',
      text: '#1e293b',
      textLight: '#64748b',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      headingFont: 'Inter, system-ui, sans-serif',
      baseFontSize: '16px',
      headingWeight: 600,
      bodyWeight: 400,
    },
    layout: {
      sidebarPosition: 'left',
      sidebarCollapsible: true,
      headerStyle: 'fixed',
      borderRadius: '8px',
      density: 'comfortable',
    },
    emailTemplates: {
      headerLogo: '/branding/email-header.png',
      footerText: '2026 KreupAI Technologies. All rights reserved.',
      primaryColor: '#2563eb',
      font: 'Arial, sans-serif',
    },
    loginPage: {
      backgroundImage: '/branding/login-bg.jpg',
      showTagline: true,
      customMessage: 'Welcome to AuraOS - Your People Platform',
      ssoButtonStyle: 'outlined',
    },
    customCss: '',
    lastUpdated: '2025-12-10T14:00:00Z',
    updatedBy: 'admin-001',
  };

  return NextResponse.json({ success: true, data: brandingConfig });
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  const { user, permissions } = context;
  if (!permissions.includes('admin/branding:update')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing admin/branding:update permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  const _tenantId = user.tenantId;

  const body = await request.json();

  const updatedBranding = {
    ...body,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'admin-001',
    changeHistory: [
      {
        field: 'colors.primary',
        oldValue: '#2563eb',
        newValue: body.colors?.primary || '#2563eb',
        changedAt: new Date().toISOString(),
        changedBy: 'admin-001',
      },
    ],
    previewUrl: '/admin/branding/preview?version=draft',
    publishStatus: 'draft',
    message: 'Changes saved as draft. Publish to apply to all users.',
  };

  return NextResponse.json({
    success: true,
    data: updatedBranding,
    message: 'Branding configuration updated successfully',
  });
});
