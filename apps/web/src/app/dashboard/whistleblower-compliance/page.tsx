import Link from 'next/link';
import { Shield, AlertTriangle, Clock, ArrowRight } from 'lucide-react';

const workspaces = [
  {
    title: 'Anonymous Intake',
    description: 'Submit and manage confidential whistleblower reports.',
    icon: Shield,
    href: '/dashboard/whistleblower-compliance/intake',
  },
  {
    title: 'Retaliation Detection',
    description: 'Monitor and identify potential retaliation against reporters.',
    icon: AlertTriangle,
    href: '/dashboard/whistleblower-compliance/retaliation',
  },
  {
    title: 'Case Cycle SLA',
    description: 'Configure and monitor investigation SLA timelines.',
    icon: Clock,
    href: '/dashboard/whistleblower-compliance/sla',
  },
];

export default function WhistleblowerCompliancePage() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold">Whistleblower Compliance</h1>
        <p className="mt-2 text-muted-foreground">
          Protect employees by enabling confidential reporting, monitoring retaliation risks, and
          ensuring timely investigations.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {workspaces.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-xl border bg-card p-6 shadow-sm transition hover:shadow-md hover:border-primary"
            >
              <div className="flex items-center justify-between">
                <Icon className="h-10 w-10 text-primary" />
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>

              <h2 className="mt-4 text-lg font-semibold">{item.title}</h2>

              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
