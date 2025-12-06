/**
 * @module SystemSettingsSeed
 * @description Seed data for System Settings (Globe, Loc, Features, Theme)
 * @project AURA HCM Platform
 */

export const systemSettingsSeed = [
    // General
    { key: 'app_name', value: 'AuraOS HCM', group: 'General', description: 'Application Name' },
    { key: 'support_email', value: 'support@kreupai.com', group: 'General', description: 'Support Contact Email' },
    { key: 'portal_url', value: 'https://portal.auraos.io', group: 'General', description: 'Employee Portal URL' },
    { key: 'ACTIVE_REGIONS', value: 'AE,SA,QA,BH,OM,IN', group: 'General', description: 'Active Regions for Master Data' },

    // Localization
    { key: 'default_language', value: 'en', group: 'Localization', description: 'Default System Language' },
    { key: 'default_currency', value: 'AED', group: 'Localization', description: 'Default Reporting Currency' },
    { key: 'date_format', value: 'DD/MM/YYYY', group: 'Localization', description: 'Standard Date Format' },
    { key: 'timezone', value: 'Asia/Dubai', group: 'Localization', description: 'Default Timezone' },

    // Features
    { key: 'enable_ai_features', value: 'true', group: 'Features', description: 'Enable AI Insights & Chat' },
    { key: 'enable_mfa', value: 'false', group: 'Features', description: 'Enforce MFA for all users' },
    { key: 'enable_sso', value: 'false', group: 'Features', description: 'Enable Single Sign-On' },
    { key: 'maintenance_mode', value: 'false', group: 'Features', description: 'System Maintenance Mode' },

    // Theme & Branding
    { key: 'primary_color', value: '#0F172A', group: 'Theme', description: 'Primary Brand Color' },
    { key: 'secondary_color', value: '#3B82F6', group: 'Theme', description: 'Secondary Brand Color' },
    { key: 'logo_url', value: '/assets/logo.png', group: 'Theme', description: 'Company Logo URL' },
];
