import { redirect } from 'next/navigation';

// AURA-518: Menu feature "Notice / Garden Leave / Buyout Tracking" maps to the
// canonical notice buyout workspace (EPIC-27), which tracks notice period
// compliance, garden leave and buyout amounts against the separation case.
export default function NoticeGardenLeaveBuyoutRedirect() {
  redirect('/dashboard/separation-compliance/notice-buyout');
}
