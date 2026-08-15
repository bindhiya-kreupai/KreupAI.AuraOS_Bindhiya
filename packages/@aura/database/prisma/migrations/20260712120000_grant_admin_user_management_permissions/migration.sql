-- Grant missing permissions to ADMIN role for User Management sub-modules
-- This is an ADDITIVE-ONLY migration: no rows are deleted or modified

-- Step 1: Ensure the required Permission rows exist (INSERT only, no overwrite)
INSERT INTO aura_permission (id, resource, action, description, "createdAt", "updatedAt", "isDeleted")
SELECT gen_random_uuid(), p.resource, p.action, p.description, NOW(), NOW(), false
FROM (VALUES
  ('licenses', 'read', 'View licenses'),
  ('licenses', 'create', 'Assign licenses'),
  ('licenses', 'update', 'Update licenses'),
  ('licenses', 'delete', 'Revoke licenses'),
  ('licenses', 'manage', 'Full license management'),
  ('user_delegation', 'create', 'Delegate user access'),
  ('user_delegation', 'read', 'View delegations'),
  ('user_delegation', 'update', 'Update delegations'),
  ('user_delegation', 'delete', 'Revoke delegations'),
  ('user_delegation', 'manage', 'Full delegation management'),
  ('user_deactivation', 'create', 'Deactivate users'),
  ('user_deactivation', 'read', 'View deactivated users'),
  ('user_deactivation', 'update', 'Restore users'),
  ('user_deactivation', 'manage', 'Full deactivation management'),
  ('password_policies', 'manage', 'Full password policy management'),
  ('mfa_config', 'manage', 'Full MFA configuration management'),
  ('access_control', 'manage', 'Full access control management'),
  ('system_settings', 'read', 'View system settings'),
  ('system_settings', 'update', 'Update system settings'),
  ('system_settings', 'manage', 'Full system settings management')
) AS p(resource, action, description)
WHERE NOT EXISTS (
  SELECT 1 FROM aura_permission WHERE resource = p.resource AND action = p.action AND "isDeleted" = false
);

-- Step 2: Grant these permissions to every ADMIN role (all tenants) — INSERT only, no overwrite
INSERT INTO aura_role_permission (id, "roleId", "permissionId", "grantedAt", "createdAt", "updatedAt", "isDeleted")
SELECT
  gen_random_uuid(),
  r.id,
  perm.id,
  NOW(),
  NOW(),
  NOW(),
  false
FROM aura_role r
JOIN aura_permission perm ON perm.resource IN (
  'licenses', 'user_delegation', 'user_deactivation',
  'password_policies', 'mfa_config', 'access_control', 'system_settings'
)
AND perm."isDeleted" = false
WHERE r.code = 'ADMIN'
AND r."isDeleted" = false
AND NOT EXISTS (
  SELECT 1 FROM aura_role_permission rp
  WHERE rp."roleId" = r.id
  AND rp."permissionId" = perm.id
  AND rp."isDeleted" = false
);
