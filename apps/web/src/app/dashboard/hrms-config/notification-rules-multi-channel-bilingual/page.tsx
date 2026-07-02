import { redirect } from 'next/navigation';

/**
 * Menu feature "Notification Rules (multi-channel, bilingual)" canonicalizes to
 * the existing, fully API-backed Notification Rules workspace (EPIC-34 · S22),
 * which supports multiple channels and bilingual (EN/AR) template text.
 */
export default function NotificationRulesMultiChannelRedirectPage() {
  redirect('/dashboard/hrms-config/notification-rules');
}
