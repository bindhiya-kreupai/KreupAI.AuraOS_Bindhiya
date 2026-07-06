import { redirect } from 'next/navigation';

// Consolidated with the canonical catalog page (AURA-184). The rich, enrollable
// catalog now lives at /dashboard/learning/catalog; this route redirects there
// to avoid two overlapping course-browsing pages.
export default function CourseCatalogRedirect() {
  redirect('/dashboard/learning/catalog');
}
