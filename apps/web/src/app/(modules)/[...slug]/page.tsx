/**
 * @module CatchAllModulePage
 * @description Catch-all page for unimplemented module routes
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

'use client';

import { useParams } from 'next/navigation';
import { EmptyPage } from '@/components/ui';

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
      <EmptyPage
        variant="coming-soon"
        title="Module Coming Soon"
        description="This module is currently under development."
      />
    );
  }

  const moduleSlug = slugArray[0];
  const featureSlug = slugArray[1];
  const moduleName = slugToName(moduleSlug);
  const featureName = featureSlug ? slugToName(featureSlug) : undefined;

  return (
    <EmptyPage
      variant="coming-soon"
      title={`${featureName || moduleName} Coming Soon`}
      description={`The ${featureName || moduleName} feature is currently under development. Our team is working hard to bring you this functionality.`}
    />
  );
}

