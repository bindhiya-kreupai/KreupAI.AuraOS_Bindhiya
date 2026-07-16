import { redirect } from 'next/navigation';

// Legacy scaffold (mock data). The live shift feature is under Attendance.
export default function ShiftsPage() {
  redirect('/dashboard/attendance/shift-management');
}
