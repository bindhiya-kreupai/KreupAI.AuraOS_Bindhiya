import { redirect } from 'next/navigation';

// Legacy scaffold (mock data). The live time-tracking feature is Attendance timesheets.
export default function TimeTrackingPage() {
  redirect('/dashboard/attendance/timesheets');
}
