import { PrismaClient } from '@prisma/client';

export interface IntegrationConfig {
  name: string;
  provider: string;
  requiredFields: string[];
  optionalFields: string[];
  authType: 'oauth2' | 'api_key';
}

export const integrationConfigs: IntegrationConfig[] = [
  {
    name: 'Slack',
    provider: 'slack',
    requiredFields: [
      'client_id',
      'client_secret',
      'signing_secret',
      'bot_token',
      'redirect_uri',
    ],
    optionalFields: [
      'app_level_token',
      'default_channel',
      'notification_channel',
      'bot_name',
      'bot_icon_url',
      'allowed_workspaces',
    ],
    authType: 'oauth2',
  },
  {
    name: 'Microsoft Teams',
    provider: 'microsoft_teams',
    requiredFields: [
      'tenant_id',
      'client_id',
      'client_secret',
      'redirect_uri',
      'bot_id',
    ],
    optionalFields: [
      'default_team_id',
      'notification_channel_id',
      'webhook_url',
      'app_name',
      'allowed_domains',
      'service_url',
    ],
    authType: 'oauth2',
  },
  {
    name: 'Google Workspace',
    provider: 'google_workspace',
    requiredFields: [
      'client_id',
      'client_secret',
      'redirect_uri',
      'service_account_key',
      'admin_email',
      'domain',
    ],
    optionalFields: [
      'scopes',
      'calendar_id',
      'drive_folder_id',
      'group_email_prefix',
      'org_unit_path',
      'delegated_admin_email',
    ],
    authType: 'oauth2',
  },
  {
    name: 'Okta SSO',
    provider: 'okta',
    requiredFields: [
      'domain',
      'client_id',
      'client_secret',
      'issuer',
      'redirect_uri',
    ],
    optionalFields: [
      'api_token',
      'default_group',
      'scim_endpoint',
      'mfa_policy',
      'session_max_lifetime',
      'idp_initiated_login_url',
    ],
    authType: 'oauth2',
  },
  {
    name: 'Azure Active Directory',
    provider: 'azure_ad',
    requiredFields: [
      'tenant_id',
      'client_id',
      'client_secret',
      'redirect_uri',
      'authority',
    ],
    optionalFields: [
      'scim_token',
      'default_group_id',
      'sync_enabled',
      'sync_interval_minutes',
      'conditional_access_policy',
      'mfa_required',
    ],
    authType: 'oauth2',
  },
  {
    name: 'Jira',
    provider: 'jira',
    requiredFields: [
      'site_url',
      'client_id',
      'client_secret',
      'redirect_uri',
    ],
    optionalFields: [
      'default_project_key',
      'issue_type_mapping',
      'webhook_secret',
      'sync_fields',
      'custom_field_mapping',
    ],
    authType: 'oauth2',
  },
  {
    name: 'Salesforce',
    provider: 'salesforce',
    requiredFields: [
      'instance_url',
      'client_id',
      'client_secret',
      'redirect_uri',
      'username',
    ],
    optionalFields: [
      'security_token',
      'api_version',
      'sandbox',
      'sync_objects',
      'field_mapping',
      'webhook_url',
    ],
    authType: 'oauth2',
  },
  {
    name: 'QuickBooks',
    provider: 'quickbooks',
    requiredFields: [
      'client_id',
      'client_secret',
      'redirect_uri',
      'realm_id',
    ],
    optionalFields: [
      'environment',
      'sync_frequency',
      'chart_of_accounts_mapping',
      'department_mapping',
      'class_mapping',
    ],
    authType: 'oauth2',
  },
  {
    name: 'SendGrid',
    provider: 'sendgrid',
    requiredFields: [
      'api_key',
      'from_email',
      'from_name',
    ],
    optionalFields: [
      'reply_to_email',
      'tracking_enabled',
      'ip_pool',
      'unsubscribe_group_id',
      'template_ids',
      'webhook_url',
    ],
    authType: 'api_key',
  },
  {
    name: 'Twilio',
    provider: 'twilio',
    requiredFields: [
      'account_sid',
      'auth_token',
      'from_number',
    ],
    optionalFields: [
      'messaging_service_sid',
      'status_callback_url',
      'fallback_url',
      'max_price',
      'validity_period',
    ],
    authType: 'api_key',
  },
  {
    name: 'Zoom',
    provider: 'zoom',
    requiredFields: [
      'client_id',
      'client_secret',
      'redirect_uri',
      'account_id',
    ],
    optionalFields: [
      'webhook_secret_token',
      'default_meeting_settings',
      'recording_settings',
      'auto_create_meetings',
    ],
    authType: 'oauth2',
  },
  {
    name: 'DocuSign',
    provider: 'docusign',
    requiredFields: [
      'integration_key',
      'secret_key',
      'redirect_uri',
      'account_id',
    ],
    optionalFields: [
      'base_path',
      'environment',
      'default_template_id',
      'webhook_url',
      'brand_id',
    ],
    authType: 'oauth2',
  },
  {
    name: 'Stripe',
    provider: 'stripe',
    requiredFields: [
      'secret_key',
      'publishable_key',
      'webhook_secret',
    ],
    optionalFields: [
      'connect_account_id',
      'default_currency',
      'payment_methods',
      'statement_descriptor',
      'metadata_mapping',
    ],
    authType: 'api_key',
  },
  {
    name: 'AWS S3',
    provider: 'aws_s3',
    requiredFields: [
      'access_key_id',
      'secret_access_key',
      'region',
      'bucket_name',
    ],
    optionalFields: [
      'endpoint_url',
      'path_prefix',
      'encryption',
      'acl',
      'max_file_size_mb',
      'allowed_content_types',
    ],
    authType: 'api_key',
  },
  {
    name: 'BambooHR',
    provider: 'bamboohr',
    requiredFields: [
      'api_key',
      'subdomain',
    ],
    optionalFields: [
      'sync_fields',
      'webhook_url',
      'custom_fields',
      'sync_interval_minutes',
      'import_photos',
    ],
    authType: 'api_key',
  },
];

export async function seed(prisma: PrismaClient): Promise<void> {
  console.log('Seeding integration configs...');

  for (const config of integrationConfigs) {
    await prisma.integrationConfig.upsert({
      where: { provider: config.provider },
      update: {
        name: config.name,
        requiredFields: JSON.stringify(config.requiredFields),
        optionalFields: JSON.stringify(config.optionalFields),
        authType: config.authType,
      },
      create: {
        name: config.name,
        provider: config.provider,
        requiredFields: JSON.stringify(config.requiredFields),
        optionalFields: JSON.stringify(config.optionalFields),
        authType: config.authType,
      },
    });
  }

  console.log(`Seeded ${integrationConfigs.length} integration configs.`);
}
