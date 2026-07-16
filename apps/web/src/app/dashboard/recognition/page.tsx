import { redirect } from 'next/navigation';

// Legacy scaffold (mock data). The live recognition feature is under Engagement.
export default function RecognitionPage() {
  redirect('/dashboard/engagement/recognition-wall');
}
