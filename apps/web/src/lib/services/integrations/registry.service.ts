/**
 * Integration Registry Service
 * Phase 4: Enterprise Expansion - Integration Marketplace
 */

import {
  Integration,
  IntegrationCategory,
  MarketplaceCategory,
  MarketplaceListing,
} from './types';

/**
 * Predefined integrations catalog
 */
const INTEGRATION_CATALOG: Integration[] = [
  // ERP Systems
  {
    id: 'int_sap_hcm',
    name: 'SAP SuccessFactors',
    nameAr: 'SAP SuccessFactors',
    description: 'Enterprise HR management integration with SAP SuccessFactors',
    descriptionAr: 'تكامل إدارة الموارد البشرية للمؤسسات مع SAP SuccessFactors',
    category: 'ERP',
    vendor: 'SAP',
    logoUrl: '/integrations/sap-successfactors.svg',
    websiteUrl: 'https://www.sap.com/products/human-resources-hcm.html',
    documentationUrl: 'https://help.sap.com/docs/SAP_SUCCESSFACTORS_HXM_SUITE',
    features: [
      {
        id: 'sf_employee_sync',
        name: 'Employee Master Sync',
        nameAr: 'مزامنة بيانات الموظفين',
        description: 'Sync employee master data bidirectionally',
        descriptionAr: 'مزامنة البيانات الأساسية للموظفين ثنائية الاتجاه',
        category: 'Data Sync',
        isPremium: false,
      },
      {
        id: 'sf_org_structure',
        name: 'Organization Structure',
        nameAr: 'الهيكل التنظيمي',
        description: 'Import organization hierarchy',
        descriptionAr: 'استيراد التسلسل الهرمي للمؤسسة',
        category: 'Data Sync',
        isPremium: false,
      },
      {
        id: 'sf_payroll',
        name: 'Payroll Integration',
        nameAr: 'تكامل الرواتب',
        description: 'Send payroll data to SAP',
        descriptionAr: 'إرسال بيانات الرواتب إلى SAP',
        category: 'Payroll',
        isPremium: true,
      },
    ],
    supportedEntities: [
      {
        localEntity: 'Employee',
        remoteEntity: 'PerPerson',
        direction: 'BIDIRECTIONAL',
        fieldMappings: [
          { localField: 'employeeId', remoteField: 'personId', dataType: 'STRING', required: true },
          { localField: 'firstName', remoteField: 'firstName', dataType: 'STRING', required: true },
          { localField: 'lastName', remoteField: 'lastName', dataType: 'STRING', required: true },
          { localField: 'email', remoteField: 'email', dataType: 'STRING', required: true },
          { localField: 'hireDate', remoteField: 'startDate', dataType: 'DATE', required: true },
        ],
      },
    ],
    supportedActions: [
      {
        id: 'sync_employees',
        name: 'Sync Employees',
        nameAr: 'مزامنة الموظفين',
        description: 'Synchronize employee data',
        type: 'SYNC',
        entity: 'Employee',
        direction: 'BIDIRECTIONAL',
        endpoint: '/odata/v2/PerPerson',
        method: 'GET',
        rateLimit: { requests: 100, period: 'MINUTE' },
      },
    ],
    authType: 'OAUTH2',
    authConfig: {
      type: 'OAUTH2',
      oauth2: {
        authorizationUrl: 'https://api.sap.com/oauth/authorize',
        tokenUrl: 'https://api.sap.com/oauth/token',
        scopes: [
          { scope: 'read', description: 'Read access to employee data' },
          { scope: 'write', description: 'Write access to employee data' },
        ],
        grantTypes: ['authorization_code', 'client_credentials'],
      },
    },
    configSchema: {
      properties: [
        {
          id: 'companyId',
          label: 'Company ID',
          labelAr: 'معرف الشركة',
          type: 'TEXT',
          required: true,
          section: 'connection',
        },
        {
          id: 'apiUrl',
          label: 'API Base URL',
          labelAr: 'رابط API الأساسي',
          type: 'URL',
          required: true,
          section: 'connection',
        },
      ],
      sections: [
        { id: 'connection', title: 'Connection Settings', titleAr: 'إعدادات الاتصال', order: 1 },
      ],
    },
    supportedCountries: ['SA', 'AE', 'BH', 'QA', 'OM', 'KW', 'IN'],
    isSystem: true,
    isPremium: true,
    status: 'ACTIVE',
    version: '2.0.0',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-06-01'),
  },

  // Accounting
  {
    id: 'int_quickbooks',
    name: 'QuickBooks Online',
    nameAr: 'QuickBooks Online',
    description: 'Sync payroll data with QuickBooks accounting',
    descriptionAr: 'مزامنة بيانات الرواتب مع محاسبة QuickBooks',
    category: 'ACCOUNTING',
    vendor: 'Intuit',
    logoUrl: '/integrations/quickbooks.svg',
    websiteUrl: 'https://quickbooks.intuit.com',
    documentationUrl: 'https://developer.intuit.com/app/developer/qbo/docs',
    features: [
      {
        id: 'qb_payroll_export',
        name: 'Payroll Export',
        nameAr: 'تصدير الرواتب',
        description: 'Export payroll journal entries',
        descriptionAr: 'تصدير قيود الرواتب',
        category: 'Payroll',
        isPremium: false,
      },
      {
        id: 'qb_vendor_payments',
        name: 'Vendor Payments',
        nameAr: 'مدفوعات الموردين',
        description: 'Create vendor payment records',
        descriptionAr: 'إنشاء سجلات مدفوعات الموردين',
        category: 'Payments',
        isPremium: false,
      },
    ],
    supportedEntities: [
      {
        localEntity: 'PayrollRun',
        remoteEntity: 'JournalEntry',
        direction: 'OUTBOUND',
        fieldMappings: [
          { localField: 'totalGross', remoteField: 'totalAmt', dataType: 'NUMBER', required: true },
          { localField: 'payDate', remoteField: 'txnDate', dataType: 'DATE', required: true },
        ],
      },
    ],
    supportedActions: [
      {
        id: 'export_payroll',
        name: 'Export Payroll',
        nameAr: 'تصدير الرواتب',
        description: 'Export payroll as journal entry',
        type: 'PUSH',
        entity: 'PayrollRun',
        direction: 'OUTBOUND',
        endpoint: '/v3/company/{companyId}/journalentry',
        method: 'POST',
      },
    ],
    authType: 'OAUTH2',
    authConfig: {
      type: 'OAUTH2',
      oauth2: {
        authorizationUrl: 'https://appcenter.intuit.com/connect/oauth2',
        tokenUrl: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
        refreshUrl: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
        scopes: [
          { scope: 'com.intuit.quickbooks.accounting', description: 'Access QuickBooks accounting data' },
        ],
        grantTypes: ['authorization_code', 'refresh_token'],
      },
    },
    configSchema: {
      properties: [
        {
          id: 'realmId',
          label: 'Company ID (Realm ID)',
          labelAr: 'معرف الشركة',
          type: 'TEXT',
          required: true,
          section: 'connection',
        },
      ],
      sections: [
        { id: 'connection', title: 'Connection Settings', titleAr: 'إعدادات الاتصال', order: 1 },
      ],
    },
    supportedCountries: ['SA', 'AE', 'IN', 'US', 'UK'],
    isSystem: true,
    isPremium: false,
    status: 'ACTIVE',
    version: '1.5.0',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-06-01'),
  },

  // ATS
  {
    id: 'int_greenhouse',
    name: 'Greenhouse',
    nameAr: 'Greenhouse',
    description: 'Applicant tracking system integration',
    descriptionAr: 'تكامل نظام تتبع المتقدمين',
    category: 'ATS',
    vendor: 'Greenhouse Software',
    logoUrl: '/integrations/greenhouse.svg',
    websiteUrl: 'https://www.greenhouse.io',
    documentationUrl: 'https://developers.greenhouse.io/harvest.html',
    features: [
      {
        id: 'gh_candidate_sync',
        name: 'Candidate Sync',
        nameAr: 'مزامنة المرشحين',
        description: 'Import candidates and applications',
        descriptionAr: 'استيراد المرشحين والطلبات',
        category: 'Recruitment',
        isPremium: false,
      },
      {
        id: 'gh_offer_sync',
        name: 'Offer Management',
        nameAr: 'إدارة العروض',
        description: 'Sync offer letters and acceptances',
        descriptionAr: 'مزامنة خطابات العروض والقبول',
        category: 'Recruitment',
        isPremium: false,
      },
      {
        id: 'gh_onboarding',
        name: 'Onboarding Trigger',
        nameAr: 'تفعيل الإعداد',
        description: 'Auto-create employee on offer acceptance',
        descriptionAr: 'إنشاء موظف تلقائياً عند قبول العرض',
        category: 'Onboarding',
        isPremium: true,
      },
    ],
    supportedEntities: [
      {
        localEntity: 'Candidate',
        remoteEntity: 'Candidate',
        direction: 'INBOUND',
        fieldMappings: [
          { localField: 'firstName', remoteField: 'first_name', dataType: 'STRING', required: true },
          { localField: 'lastName', remoteField: 'last_name', dataType: 'STRING', required: true },
          { localField: 'email', remoteField: 'email_addresses[0].value', dataType: 'STRING', required: true },
        ],
      },
    ],
    supportedActions: [
      {
        id: 'pull_candidates',
        name: 'Pull Candidates',
        nameAr: 'سحب المرشحين',
        description: 'Import candidates from Greenhouse',
        type: 'PULL',
        entity: 'Candidate',
        direction: 'INBOUND',
        endpoint: '/v1/candidates',
        method: 'GET',
        triggers: [
          { type: 'SCHEDULE', config: { cron: '0 * * * *' } },
          { type: 'WEBHOOK', config: { event: 'candidate.hired' } },
        ],
      },
    ],
    authType: 'API_KEY',
    authConfig: {
      type: 'API_KEY',
      apiKey: {
        headerName: 'Authorization',
        prefix: 'Basic',
        location: 'HEADER',
      },
    },
    configSchema: {
      properties: [
        {
          id: 'apiKey',
          label: 'API Key',
          labelAr: 'مفتاح API',
          type: 'PASSWORD',
          required: true,
          section: 'authentication',
        },
      ],
      sections: [
        { id: 'authentication', title: 'Authentication', titleAr: 'المصادقة', order: 1 },
      ],
    },
    isSystem: true,
    isPremium: false,
    status: 'ACTIVE',
    version: '1.2.0',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-06-01'),
  },

  // Banking
  {
    id: 'int_wps_bank',
    name: 'WPS Bank Transfer',
    nameAr: 'تحويل بنكي WPS',
    description: 'UAE WPS-compliant salary transfer',
    descriptionAr: 'تحويل الرواتب المتوافق مع نظام حماية الأجور',
    category: 'BANKING',
    vendor: 'UAE Central Bank',
    logoUrl: '/integrations/uae-wps.svg',
    features: [
      {
        id: 'wps_sif_generation',
        name: 'SIF File Generation',
        nameAr: 'إنشاء ملف SIF',
        description: 'Generate WPS-compliant SIF files',
        descriptionAr: 'إنشاء ملفات SIF المتوافقة مع WPS',
        category: 'Payroll',
        isPremium: false,
      },
      {
        id: 'wps_bank_submit',
        name: 'Direct Bank Submission',
        nameAr: 'الإرسال المباشر للبنك',
        description: 'Submit salary files directly to bank',
        descriptionAr: 'إرسال ملفات الرواتب مباشرة للبنك',
        category: 'Payments',
        isPremium: true,
      },
    ],
    supportedEntities: [
      {
        localEntity: 'PayrollRun',
        remoteEntity: 'SIFFile',
        direction: 'OUTBOUND',
        fieldMappings: [
          { localField: 'employeeId', remoteField: 'employeeNumber', dataType: 'STRING', required: true },
          { localField: 'bankRoutingCode', remoteField: 'routingCode', dataType: 'STRING', required: true },
          { localField: 'bankAccountNumber', remoteField: 'accountNumber', dataType: 'STRING', required: true },
          { localField: 'netPay', remoteField: 'amount', dataType: 'NUMBER', required: true },
        ],
      },
    ],
    supportedActions: [
      {
        id: 'generate_sif',
        name: 'Generate SIF',
        nameAr: 'إنشاء SIF',
        description: 'Generate SIF file for WPS',
        type: 'PUSH',
        entity: 'PayrollRun',
        direction: 'OUTBOUND',
      },
    ],
    authType: 'CERTIFICATE',
    authConfig: {
      type: 'CERTIFICATE',
      certificate: {
        type: 'PFX',
        requiresPassword: true,
      },
    },
    configSchema: {
      properties: [
        {
          id: 'bankCode',
          label: 'Bank Code',
          labelAr: 'رمز البنك',
          type: 'TEXT',
          required: true,
          section: 'bank',
        },
        {
          id: 'companyMolId',
          label: 'MOL Establishment ID',
          labelAr: 'رقم المنشأة في وزارة العمل',
          type: 'TEXT',
          required: true,
          section: 'company',
        },
      ],
      sections: [
        { id: 'bank', title: 'Bank Details', titleAr: 'تفاصيل البنك', order: 1 },
        { id: 'company', title: 'Company Details', titleAr: 'تفاصيل الشركة', order: 2 },
      ],
    },
    supportedCountries: ['AE'],
    isSystem: true,
    isPremium: false,
    status: 'ACTIVE',
    version: '1.0.0',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-06-01'),
  },

  // Government - Saudi
  {
    id: 'int_gosi_portal',
    name: 'GOSI Portal',
    nameAr: 'بوابة التأمينات الاجتماعية',
    description: 'Saudi GOSI contribution submission',
    descriptionAr: 'تقديم اشتراكات التأمينات الاجتماعية السعودية',
    category: 'GOVERNMENT',
    vendor: 'GOSI',
    logoUrl: '/integrations/gosi.svg',
    websiteUrl: 'https://www.gosi.gov.sa',
    features: [
      {
        id: 'gosi_contribution',
        name: 'Contribution Submission',
        nameAr: 'تقديم الاشتراكات',
        description: 'Submit monthly GOSI contributions',
        descriptionAr: 'تقديم اشتراكات التأمينات الشهرية',
        category: 'Compliance',
        isPremium: false,
      },
      {
        id: 'gosi_employee_reg',
        name: 'Employee Registration',
        nameAr: 'تسجيل الموظفين',
        description: 'Register new employees with GOSI',
        descriptionAr: 'تسجيل الموظفين الجدد في التأمينات',
        category: 'Compliance',
        isPremium: false,
      },
    ],
    supportedEntities: [
      {
        localEntity: 'GOSIContribution',
        remoteEntity: 'Contribution',
        direction: 'OUTBOUND',
        fieldMappings: [
          { localField: 'employeeNationalId', remoteField: 'nationalId', dataType: 'STRING', required: true },
          { localField: 'basicSalary', remoteField: 'wage', dataType: 'NUMBER', required: true },
          { localField: 'employeeContribution', remoteField: 'employeeShare', dataType: 'NUMBER', required: true },
          { localField: 'employerContribution', remoteField: 'employerShare', dataType: 'NUMBER', required: true },
        ],
      },
    ],
    supportedActions: [
      {
        id: 'submit_contributions',
        name: 'Submit Contributions',
        nameAr: 'تقديم الاشتراكات',
        description: 'Submit monthly GOSI contributions',
        type: 'PUSH',
        entity: 'GOSIContribution',
        direction: 'OUTBOUND',
      },
    ],
    authType: 'CERTIFICATE',
    authConfig: {
      type: 'CERTIFICATE',
      certificate: {
        type: 'PEM',
        requiresPassword: true,
      },
    },
    configSchema: {
      properties: [
        {
          id: 'establishmentId',
          label: 'Establishment ID',
          labelAr: 'رقم المنشأة',
          type: 'TEXT',
          required: true,
          section: 'registration',
        },
      ],
      sections: [
        { id: 'registration', title: 'GOSI Registration', titleAr: 'تسجيل التأمينات', order: 1 },
      ],
    },
    supportedCountries: ['SA'],
    isSystem: true,
    isPremium: false,
    status: 'ACTIVE',
    version: '1.0.0',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-06-01'),
  },

  // Communication
  {
    id: 'int_slack',
    name: 'Slack',
    nameAr: 'Slack',
    description: 'HR notifications and announcements via Slack',
    descriptionAr: 'إشعارات وإعلانات الموارد البشرية عبر Slack',
    category: 'COMMUNICATION',
    vendor: 'Salesforce',
    logoUrl: '/integrations/slack.svg',
    websiteUrl: 'https://slack.com',
    documentationUrl: 'https://api.slack.com/docs',
    features: [
      {
        id: 'slack_notifications',
        name: 'HR Notifications',
        nameAr: 'إشعارات الموارد البشرية',
        description: 'Send leave, attendance, and payroll notifications',
        descriptionAr: 'إرسال إشعارات الإجازات والحضور والرواتب',
        category: 'Notifications',
        isPremium: false,
      },
      {
        id: 'slack_approvals',
        name: 'Quick Approvals',
        nameAr: 'الموافقات السريعة',
        description: 'Approve requests directly from Slack',
        descriptionAr: 'الموافقة على الطلبات مباشرة من Slack',
        category: 'Workflows',
        isPremium: true,
      },
    ],
    supportedEntities: [],
    supportedActions: [
      {
        id: 'send_notification',
        name: 'Send Notification',
        nameAr: 'إرسال إشعار',
        description: 'Send message to Slack channel',
        type: 'PUSH',
        entity: 'Notification',
        direction: 'OUTBOUND',
        endpoint: '/api/chat.postMessage',
        method: 'POST',
      },
    ],
    authType: 'OAUTH2',
    authConfig: {
      type: 'OAUTH2',
      oauth2: {
        authorizationUrl: 'https://slack.com/oauth/v2/authorize',
        tokenUrl: 'https://slack.com/api/oauth.v2.access',
        scopes: [
          { scope: 'chat:write', description: 'Send messages' },
          { scope: 'channels:read', description: 'Read channel list' },
        ],
        grantTypes: ['authorization_code'],
      },
    },
    configSchema: {
      properties: [
        {
          id: 'defaultChannel',
          label: 'Default Channel',
          labelAr: 'القناة الافتراضية',
          type: 'TEXT',
          required: false,
          section: 'settings',
        },
      ],
      sections: [
        { id: 'settings', title: 'Settings', titleAr: 'الإعدادات', order: 1 },
      ],
    },
    isSystem: true,
    isPremium: false,
    status: 'ACTIVE',
    version: '1.0.0',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-06-01'),
  },

  // SSO
  {
    id: 'int_azure_ad',
    name: 'Microsoft Azure AD',
    nameAr: 'Microsoft Azure AD',
    description: 'Single sign-on with Azure Active Directory',
    descriptionAr: 'تسجيل الدخول الموحد مع Azure Active Directory',
    category: 'SSO',
    vendor: 'Microsoft',
    logoUrl: '/integrations/azure-ad.svg',
    websiteUrl: 'https://azure.microsoft.com/en-us/services/active-directory/',
    documentationUrl: 'https://docs.microsoft.com/en-us/azure/active-directory/',
    features: [
      {
        id: 'azure_sso',
        name: 'Single Sign-On',
        nameAr: 'تسجيل الدخول الموحد',
        description: 'SAML/OIDC-based SSO',
        descriptionAr: 'تسجيل الدخول الموحد عبر SAML/OIDC',
        category: 'Authentication',
        isPremium: false,
      },
      {
        id: 'azure_scim',
        name: 'SCIM Provisioning',
        nameAr: 'التزويد عبر SCIM',
        description: 'Automatic user provisioning',
        descriptionAr: 'التزويد التلقائي للمستخدمين',
        category: 'Provisioning',
        isPremium: true,
      },
    ],
    supportedEntities: [
      {
        localEntity: 'User',
        remoteEntity: 'User',
        direction: 'BIDIRECTIONAL',
        fieldMappings: [
          { localField: 'email', remoteField: 'userPrincipalName', dataType: 'STRING', required: true },
          { localField: 'firstName', remoteField: 'givenName', dataType: 'STRING', required: true },
          { localField: 'lastName', remoteField: 'surname', dataType: 'STRING', required: true },
        ],
      },
    ],
    supportedActions: [
      {
        id: 'scim_sync',
        name: 'SCIM User Sync',
        nameAr: 'مزامنة المستخدمين SCIM',
        description: 'Sync users via SCIM protocol',
        type: 'SYNC',
        entity: 'User',
        direction: 'BIDIRECTIONAL',
      },
    ],
    authType: 'OAUTH2',
    authConfig: {
      type: 'OAUTH2',
      oauth2: {
        authorizationUrl: 'https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/authorize',
        tokenUrl: 'https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token',
        scopes: [
          { scope: 'openid', description: 'OpenID Connect' },
          { scope: 'profile', description: 'User profile' },
          { scope: 'email', description: 'Email address' },
        ],
        grantTypes: ['authorization_code'],
        pkceRequired: true,
      },
    },
    configSchema: {
      properties: [
        {
          id: 'tenantId',
          label: 'Azure Tenant ID',
          labelAr: 'معرف المستأجر Azure',
          type: 'TEXT',
          required: true,
          section: 'connection',
        },
        {
          id: 'clientId',
          label: 'Client ID',
          labelAr: 'معرف العميل',
          type: 'TEXT',
          required: true,
          section: 'connection',
        },
      ],
      sections: [
        { id: 'connection', title: 'Azure AD Configuration', titleAr: 'إعدادات Azure AD', order: 1 },
      ],
    },
    isSystem: true,
    isPremium: false,
    status: 'ACTIVE',
    version: '2.0.0',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-06-01'),
  },
];

/**
 * Marketplace categories
 */
const MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
  {
    id: 'ERP',
    name: 'ERP Systems',
    nameAr: 'أنظمة تخطيط موارد المؤسسات',
    description: 'Enterprise resource planning integrations',
    descriptionAr: 'تكامل أنظمة تخطيط موارد المؤسسات',
    icon: 'building',
    integrationCount: INTEGRATION_CATALOG.filter(i => i.category === 'ERP').length,
  },
  {
    id: 'ACCOUNTING',
    name: 'Accounting',
    nameAr: 'المحاسبة',
    description: 'Accounting and finance software',
    descriptionAr: 'برامج المحاسبة والمالية',
    icon: 'calculator',
    integrationCount: INTEGRATION_CATALOG.filter(i => i.category === 'ACCOUNTING').length,
  },
  {
    id: 'ATS',
    name: 'Applicant Tracking',
    nameAr: 'تتبع المتقدمين',
    description: 'Recruitment and applicant tracking systems',
    descriptionAr: 'أنظمة التوظيف وتتبع المتقدمين',
    icon: 'users',
    integrationCount: INTEGRATION_CATALOG.filter(i => i.category === 'ATS').length,
  },
  {
    id: 'BANKING',
    name: 'Banking & Payments',
    nameAr: 'البنوك والمدفوعات',
    description: 'Bank transfers and payment processing',
    descriptionAr: 'التحويلات البنكية ومعالجة المدفوعات',
    icon: 'credit-card',
    integrationCount: INTEGRATION_CATALOG.filter(i => i.category === 'BANKING').length,
  },
  {
    id: 'GOVERNMENT',
    name: 'Government Portals',
    nameAr: 'البوابات الحكومية',
    description: 'Government and regulatory integrations',
    descriptionAr: 'التكامل مع الجهات الحكومية والتنظيمية',
    icon: 'landmark',
    integrationCount: INTEGRATION_CATALOG.filter(i => i.category === 'GOVERNMENT').length,
  },
  {
    id: 'COMMUNICATION',
    name: 'Communication',
    nameAr: 'التواصل',
    description: 'Messaging and notification platforms',
    descriptionAr: 'منصات المراسلة والإشعارات',
    icon: 'message-circle',
    integrationCount: INTEGRATION_CATALOG.filter(i => i.category === 'COMMUNICATION').length,
  },
  {
    id: 'SSO',
    name: 'Single Sign-On',
    nameAr: 'تسجيل الدخول الموحد',
    description: 'Identity and access management',
    descriptionAr: 'إدارة الهوية والوصول',
    icon: 'key',
    integrationCount: INTEGRATION_CATALOG.filter(i => i.category === 'SSO').length,
  },
];

/**
 * Integration Registry Service
 */
export class IntegrationRegistryService {
  /**
   * Get all available integrations
   */
  static async getIntegrations(
    category?: IntegrationCategory,
    search?: string
  ): Promise<Integration[]> {
    let integrations = [...INTEGRATION_CATALOG];

    if (category) {
      integrations = integrations.filter(i => i.category === category);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      integrations = integrations.filter(
        i =>
          i.name.toLowerCase().includes(searchLower) ||
          i.nameAr.includes(search) ||
          i.description.toLowerCase().includes(searchLower) ||
          i.vendor.toLowerCase().includes(searchLower)
      );
    }

    return integrations;
  }

  /**
   * Get integration by ID
   */
  static async getIntegrationById(id: string): Promise<Integration | null> {
    return INTEGRATION_CATALOG.find(i => i.id === id) || null;
  }

  /**
   * Get marketplace categories
   */
  static async getCategories(): Promise<MarketplaceCategory[]> {
    return MARKETPLACE_CATEGORIES;
  }

  /**
   * Get marketplace listings
   */
  static async getMarketplaceListings(
    tenantId: string,
    category?: IntegrationCategory,
    search?: string
  ): Promise<MarketplaceListing[]> {
    const integrations = await this.getIntegrations(category, search);

    // In production, check tenant's installed integrations
    return integrations.map(integration => ({
      integration,
      rating: 4.0 + Math.random(),
      reviewCount: Math.floor(Math.random() * 100) + 10,
      installCount: Math.floor(Math.random() * 1000) + 100,
      isInstalled: false, // Check from database
      isPremium: integration.isPremium,
      pricing: integration.isPremium
        ? {
            type: 'PAID' as const,
            monthlyPrice: 99,
            yearlyPrice: 999,
            currency: 'USD',
          }
        : { type: 'FREE' as const },
    }));
  }

  /**
   * Get integrations by country
   */
  static async getIntegrationsByCountry(
    countryCode: string
  ): Promise<Integration[]> {
    return INTEGRATION_CATALOG.filter(
      i => !i.supportedCountries || i.supportedCountries.includes(countryCode)
    );
  }

  /**
   * Get popular integrations
   */
  static async getPopularIntegrations(limit: number = 6): Promise<Integration[]> {
    // In production, sort by install count
    return INTEGRATION_CATALOG.slice(0, limit);
  }

  /**
   * Get new integrations
   */
  static async getNewIntegrations(limit: number = 3): Promise<Integration[]> {
    return [...INTEGRATION_CATALOG]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}
