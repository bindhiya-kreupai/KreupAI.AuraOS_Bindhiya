import { redirect } from 'next/navigation';

export default function CarbonFootprintRedirect() {
  redirect('/dashboard/esg-compliance/carbon-per-employee');
}
