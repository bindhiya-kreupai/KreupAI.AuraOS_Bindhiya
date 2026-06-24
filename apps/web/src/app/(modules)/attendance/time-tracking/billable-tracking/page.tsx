import { redirect } from 'next/navigation';

export default function BillableTrackingPage() {
  redirect('/dashboard/attendance/timesheets');
}
