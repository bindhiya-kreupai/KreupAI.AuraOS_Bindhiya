'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Briefcase, MapPin, Building2, ArrowRight, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrentUser } from '@/lib/auth/AuthProvider';
import { MobilityOpportunityService, MobilityApplicationService } from '../services';
import type { MobilityOpportunity, MobilityApplication } from '../types';

function formatPosted(date?: Date | string): string {
  if (!date) return '';
  const d = new Date(date);
  const days = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Posted today';
  if (days < 7) return `Posted ${days}d ago`;
  return `Posted ${Math.floor(days / 7)}w ago`;
}

export default function InternalMobilityPage() {
  const { user, loading: authLoading } = useCurrentUser();
  const [opportunities, setOpportunities] = useState<MobilityOpportunity[]>([]);
  const [applications, setApplications] = useState<MobilityApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplications, setShowApplications] = useState(false);
  const [detail, setDetail] = useState<MobilityOpportunity | null>(null);
  const [applying, setApplying] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [opps, apps] = await Promise.all([
        MobilityOpportunityService.getOpenOpportunities(),
        user?.employeeId
          ? MobilityApplicationService.getApplicationsByEmployeeId(user.employeeId)
          : Promise.resolve([]),
      ]);
      setOpportunities(Array.isArray(opps) ? opps : []);
      setApplications(Array.isArray(apps) ? apps : []);
    } catch (error) {
      console.error('Failed to load mobility data', error);
      toast.error('Failed to load internal opportunities');
    } finally {
      setLoading(false);
    }
  }, [user?.employeeId]);

  useEffect(() => {
    if (!authLoading) void load();
  }, [authLoading, load]);

  const recommended = useMemo(() => opportunities.slice(0, 3), [opportunities]);
  const appliedIds = useMemo(
    () => new Set(applications.map((a) => a.opportunityId)),
    [applications]
  );

  const handleApply = useCallback(
    async (opp: MobilityOpportunity) => {
      if (!user?.employeeId) {
        toast.error('Unable to determine your employee profile');
        return;
      }
      if (appliedIds.has(opp.opportunityId)) {
        toast.info('You have already applied to this role');
        return;
      }
      setApplying(true);
      try {
        await MobilityApplicationService.createApplication({
          opportunityId: opp.opportunityId,
          opportunityTitle: opp.jobTitle,
          employeeId: user.employeeId,
          motivation: `Interested in the ${opp.jobTitle} role in ${opp.department}.`,
          relevantExperience: [],
          relevantSkills: [],
          applicationStatus: 'submitted',
        });
        toast.success('Application submitted');
        setDetail(null);
        await load();
      } catch (error) {
        console.error('Failed to submit application', error);
        toast.error('Failed to submit application');
      } finally {
        setApplying(false);
      }
    },
    [appliedIds, user?.employeeId, load]
  );

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-500" />
            Internal Mobility
          </h1>
          <p className="text-slate-500 text-sm">Explore open roles within the organization.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowApplications(true)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:border-indigo-400"
          >
            My Applications ({applications.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Recommended */}
          {recommended.length > 0 && (
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shrink-0">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5" /> Recommended for You
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {recommended.map((job) => (
                  <button
                    key={job.opportunityId}
                    onClick={() => setDetail(job)}
                    className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/20 transition-colors cursor-pointer group text-left"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-emerald-400/20 text-emerald-200 text-xs font-bold px-2 py-0.5 rounded">
                        {job.opportunityType}
                      </span>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </div>
                    <div className="font-bold text-lg leading-tight mb-1">{job.jobTitle}</div>
                    <div className="text-sm text-indigo-100 opacity-80">
                      {job.department} • {job.location}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Job Board */}
          {opportunities.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
              <Briefcase className="w-10 h-10 text-slate-300" />
              <p className="text-slate-500">No open internal opportunities right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto pb-20">
              {opportunities.map((job) => (
                <button
                  key={job.opportunityId}
                  onClick={() => setDetail(job)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-indigo-500 transition-colors cursor-pointer group text-left"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-indigo-600 transition-colors">
                        {job.jobTitle}
                      </h3>
                      <p className="text-slate-500">{job.department}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <Briefcase className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-slate-500 mb-6">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" /> {job.opportunityType}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs font-bold text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <span>{formatPosted(job.postedDate)}</span>
                    <span className="uppercase tracking-wider">
                      {appliedIds.has(job.opportunityId) ? 'Applied' : 'View Details'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {detail && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setDetail(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">{detail.jobTitle}</h3>
                <p className="text-sm text-slate-500">
                  {detail.department} · {detail.location}
                </p>
              </div>
              <button
                onClick={() => setDetail(null)}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{detail.description}</p>
            {detail.responsibilities?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-bold uppercase text-slate-400 mb-2">
                  Responsibilities
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
                  {detail.responsibilities.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDetail(null)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
              <button
                onClick={() => handleApply(detail)}
                disabled={applying || appliedIds.has(detail.opportunityId)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {applying && <Loader2 className="w-4 h-4 animate-spin" />}
                {appliedIds.has(detail.opportunityId) ? 'Already Applied' : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* My Applications Modal */}
      {showApplications && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setShowApplications(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">My Applications</h3>
              <button
                onClick={() => setShowApplications(false)}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {applications.length === 0 ? (
              <p className="text-sm text-slate-500">You have no active applications.</p>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div
                    key={app.applicationId}
                    className="border border-slate-200 dark:border-slate-800 rounded-xl p-4"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold">{app.opportunityTitle}</h4>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20">
                        {app.applicationStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Applied{' '}
                      {app.applicationDate
                        ? new Date(app.applicationDate).toLocaleDateString()
                        : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
