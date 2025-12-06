/**
 * @module SystemPoliciesSeed
 * @description Seed data for Password Policy, MFA, Licenses, Access Control, and SSO
 * @project AURA HCM Platform
 */

export const passwordPolicySeed = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    expiryDays: 90,
    historyCount: 5,
    lockoutAttempts: 3,
};

export const mfaConfigSeed = {
    enabled: false,
    enforceForAdmins: true,
    enforceForAll: false,
    methods: { authenticatorApp: true, sms: false, email: true },
    gracePeriodDays: 7,
};

export const licenseSeed = {
    name: 'Aura Core HR Enterprise',
    total: 1000,
    used: 5,
    type: 'Per User',
    status: 'Active',
};

export const accessControlSeed = [
    {
        name: 'Office Network',
        type: 'IP_RANGE',
        value: '192.168.0.0/24',
        status: 'Active'
    },
    {
        name: 'Work Hours',
        type: 'TIME_WINDOW',
        value: '09:00-18:00',
        status: 'Active'
    }
];

export const ssoConfigSeed = {
    enabled: false,
    provider: 'Microsoft Entra ID (SAML)',
    issuerUrl: 'https://login.microsoftonline.com/common/v2.0',
    ssoUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    certificate: '-----BEGIN CERTIFICATE-----\nMIIDMIID...\n-----END CERTIFICATE-----',
};
