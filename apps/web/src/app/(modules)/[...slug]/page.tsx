/**
 * @module CatchAllModulePage
 * @description Catch-all page for unimplemented module routes
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

'use client';

import { useParams } from 'next/navigation';
import { ModulePage } from '@/components/ui';
import { superAdminMenu } from '@aura/config';
import type { MenuIconName } from '@aura/types';

// Convert slug to module code
function slugToCode(slug: string): string {
  return slug.toUpperCase().replace(/-/g, '_');
}

// Convert slug to readable name
function slugToName(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function CatchAllModulePage() {
  const params = useParams();
  const slugArray = params.slug as string[];

  if (!slugArray || slugArray.length === 0) {
    return (
      <ModulePage
        moduleCode="UNKNOWN"
        moduleName="Unknown Module"
        isImplemented={false}
      />
    );
  }

  const moduleSlug = slugArray[0];
  const featureSlug = slugArray[1];
  const moduleCode = slugToCode(moduleSlug);

  // Find module in menu
  const moduleData = superAdminMenu.items.find((m) => m.code === moduleCode);

  if (!moduleData) {
    // Module not found, still show coming soon
    return (
      <ModulePage
        moduleCode={moduleCode}
        moduleName={slugToName(moduleSlug)}
        featureName={featureSlug ? slugToName(featureSlug) : undefined}
        isImplemented={false}
      />
    );
  }

  // Find feature if specified
  let featureName: string | undefined;
  if (featureSlug) {
    featureName = moduleData.features.find(
      (f) =>
        f
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') === featureSlug
    );

    if (!featureName) {
      featureName = slugToName(featureSlug);
    }
  }

  return (
    <ModulePage
      moduleCode={moduleData.code}
      moduleName={moduleData.label}
      moduleIcon={moduleData.icon as MenuIconName}
      featureName={featureName}
      featureCount={moduleData.features.length}
      isImplemented={false}
    />
  );
}
