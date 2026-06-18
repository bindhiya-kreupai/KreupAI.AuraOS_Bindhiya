import { redirect } from 'next/navigation';

export default function BillableTrackingPage() {
  redirect('/attendance/timesheets');
}
