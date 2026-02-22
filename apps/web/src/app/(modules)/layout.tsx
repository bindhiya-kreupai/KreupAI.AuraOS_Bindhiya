/**
 * @module ModulesLayout
 * @description Layout for all production modules with sidebar navigation
 * @project AURA HCM Platform
 */

import { AppLayout } from '@/components/layouts/app-layout';

export default function ModulesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}

