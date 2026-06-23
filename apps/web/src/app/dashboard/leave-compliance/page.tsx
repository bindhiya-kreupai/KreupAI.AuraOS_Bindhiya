'use client';

import { useEffect, useState } from 'react';

interface Dashboard {
  period: string;
  requestsTotal: number;
  requestsApproved: number;
  requestsPending: number;
  encashmentsCount: number;
  carryForwardsCount: number;
  openMisuseFlags: number;
  missingMedicalEvidenceCount: number;
  unpaidLeaveDays: number;
}

const periodNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function LeaveHome() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [period, setPeriod] = useState(periodNow());

  async function load() {
    const r = await fetch(`/api/v1/leave-compliance/dashboard?period=${period}`);
    const p = await r.json();
    if (p.success) setData(p.data);
  }
  useEffect(() => {
    load();
  }, [period]);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">EPIC-20 · GCC Leave Compliance</p>
            <h1 className="text-2xl font-semibold">Leave Compliance Dashboard</h1>
          </div>
          <input
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </header>

        {data ? (
          <section className="grid grid-cols-2 gap-4 md:grid-cols-8">
            <Tile label="Requests" value={data.requestsTotal} />
            <Tile label="Approved" value={data.requestsApproved} colour="emerald" />
            <Tile label="Pending" value={data.requestsPending} colour="amber" />
            <Tile label="Encashments" value={data.encashmentsCount} />
            <Tile label="Carry-Forwards" value={data.carryForwardsCount} />
            <Tile label="Misuse Open" value={data.openMisuseFlags} colour="rose" />
            <Tile label="Missing Medical" value={data.missingMedicalEvidenceCount} colour="rose" />
            <Tile label="Unpaid Days" value={data.unpaidLeaveDays} colour="amber" />
          </section>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-700">
            Layered over the existing LeaveType / LeavePolicy / LeaveRequest / LeaveBalance /
            LeaveAccrual / LeaveCarryForward / LeaveEncashment models. Country × leave-code
            entitlement rule (annual days, accrual basis, carry-forward, encashable days,
            medical-evidence requirement, min service, notice period) seeded for UAE / KSA / BH / QA
            / OM / KW across ANNUAL / SICK / MATERNITY / PATERNITY / HAJJ. Misuse detection flags
            FREQUENT_MONDAY / FREQUENT_FRIDAY / EXCESSIVE_CONSECUTIVE / CARRY_OVER_BREACH /
            MEDICAL_FORGERY. Medical evidence register classifies as RESTRICTED with retentionUntil,
            fraud-flag toggle, and verification audit. Monthly certificate refuses to sign while
            open misuse flags or missing medical evidence remain.
          </p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Workspaces</h2>
          <ul className="mt-2 grid gap-2 text-sm md:grid-cols-2">
            <li>
              <a
                href="/dashboard/leave-compliance/entitlements"
                className="text-blue-700 hover:underline"
              >
                Country Entitlement Rules (S02 / S03–S07)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/leave-compliance/misuse-flags"
                className="text-blue-700 hover:underline"
              >
                Misuse &amp; Abuse Register (S17)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/leave-compliance/medical-evidence"
                className="text-blue-700 hover:underline"
              >
                Medical Evidence Vault (S04 / S18)
              </a>
            </li>
            <li>
              <a
                href="/dashboard/leave-compliance/certificate"
                className="text-blue-700 hover:underline"
              >
                Monthly Certificate (S20 / S22)
              </a>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}

function Tile({ label, value, colour }: { label: string; value: number; colour?: string }) {
  const cls =
    colour === 'emerald'
      ? 'text-emerald-700'
      : colour === 'rose'
        ? 'text-rose-700'
        : colour === 'amber'
          ? 'text-amber-700'
          : 'text-slate-900';
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className={`text-3xl font-semibold ${cls}`}>{value}</p>
    </div>
  );
}
