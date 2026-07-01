import { redirect } from 'next/navigation';

// AURA-417: Menu feature "Template Catalogue (8 lifecycle groups, versioned)"
// maps to the canonical HR form template catalogue workspace (EPIC-33 · S01 /
// S02), which groups versioned templates across the 8 lifecycle groups.
export default function TemplateCatalogueRedirect() {
  redirect('/dashboard/hr-forms-compliance/templates');
}
