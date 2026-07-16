import { redirect } from 'next/navigation';

// Section landing route: forward to the projects resource-booking sub-module.
export default function ProjectsPage() {
  redirect('/dashboard/projects/resource-booking');
}
