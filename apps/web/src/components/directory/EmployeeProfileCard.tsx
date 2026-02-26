/**
 * @module EmployeeProfileCard
 * @description Slide-out employee profile panel — contact info, org chain,
 *              quick actions, employment details, and skills (Sec 17.4)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  Users,
  ChevronRight,
  Briefcase,
  Tag,
  ExternalLink,
} from 'lucide-react';
import { DirectoryService, type DirectoryEmployee } from '@/services/directoryService';

// ── Component ─────────────────────────────────────────────────────────────────

interface EmployeeProfileCardProps {
  employee: DirectoryEmployee;
  onClose: () => void;
  onViewFullProfile?: (employeeId: string) => void;
}

export function EmployeeProfileCard({
  employee,
  onClose,
  onViewFullProfile,
}: EmployeeProfileCardProps) {
  const [reportingChain, setReportingChain] = useState<DirectoryEmployee[]>([]);
  const [directReports, setDirectReports] = useState<DirectoryEmployee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [chain, reports] = await Promise.all([
        DirectoryService.getReportingChain(employee.id),
        DirectoryService.getDirectReports(employee.id),
      ]);
      setReportingChain(chain.slice(1)); // exclude self
      setDirectReports(reports);
      setLoading(false);
    };
    load();
  }, [employee.id]);

  const EMPLOYMENT_TYPE_LABEL: Record<string, string> = {
    full_time: 'Full Time',
    part_time: 'Part Time',
    contract: 'Contract',
    intern: 'Intern',
    consultant: 'Consultant',
  };

  const WORK_LOCATION_LABEL: Record<string, string> = {
    office: 'Office',
    remote: 'Remote',
    hybrid: 'Hybrid',
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40 transition-opacity" onClick={onClose} />

      {/* Slide-out Panel */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-6 pt-8 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl ${employee.avatarColor} flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-lg`}
              >
                {employee.avatarInitials}
              </div>
              <div>
                <h2 className="text-xl font-bold">{employee.fullName}</h2>
                <p className="text-sm text-indigo-200 mt-0.5">{employee.designation}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Building2 className="w-3.5 h-3.5 text-indigo-300" />
                  <span className="text-xs text-indigo-200">{employee.department}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: Mail, label: 'Email', color: 'bg-white/10' },
              { icon: Phone, label: 'Call', color: 'bg-white/10' },
              { icon: Calendar, label: 'Schedule', color: 'bg-white/10' },
              { icon: ExternalLink, label: 'Profile', color: 'bg-white/10' },
            ].map((action) => (
              <button
                key={action.label}
                onClick={
                  action.label === 'Profile' ? () => onViewFullProfile?.(employee.id) : undefined
                }
                className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl ${action.color} hover:bg-white/20 transition-colors`}
              >
                <action.icon className="w-5 h-5 text-white" />
                <span className="text-xs text-white/90">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Contact Info */}
          <section className="p-5 border-b border-gray-50">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
              Contact
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-800">{employee.email}</p>
                </div>
              </div>
              {employee.phone && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="text-sm font-medium text-gray-800">{employee.phone}</p>
                  </div>
                </div>
              )}
              {employee.extension && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Extension</p>
                    <p className="text-sm font-medium text-gray-800">Ext. {employee.extension}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Office Location</p>
                  <p className="text-sm font-medium text-gray-800">{employee.location}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Employment Info */}
          <section className="p-5 border-b border-gray-50">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
              Employment
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Employee ID', value: employee.employeeId },
                { label: 'Join Date', value: new Date(employee.joinDate).toLocaleDateString() },
                {
                  label: 'Type',
                  value: EMPLOYMENT_TYPE_LABEL[employee.employmentType] ?? employee.employmentType,
                },
                {
                  label: 'Work Mode',
                  value: WORK_LOCATION_LABEL[employee.workLocation] ?? employee.workLocation,
                },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Reporting Structure */}
          <section className="p-5 border-b border-gray-50">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
              Reporting
            </h3>
            {employee.managerName && (
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-xs text-gray-500">Reports to:</span>
                <span className="text-sm font-medium text-gray-800">{employee.managerName}</span>
              </div>
            )}
            {directReports.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">{directReports.length} direct reports:</p>
                <div className="flex flex-wrap gap-2">
                  {directReports.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center gap-1.5 bg-gray-50 rounded-full pl-1 pr-3 py-1"
                    >
                      <div
                        className={`w-5 h-5 rounded-full ${r.avatarColor} flex items-center justify-center`}
                      >
                        <span className="text-white text-xs font-semibold">
                          {r.avatarInitials[0]}
                        </span>
                      </div>
                      <span className="text-xs text-gray-700">{r.firstName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!loading && reportingChain.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-50">
                <p className="text-xs text-gray-500 mb-2">Reporting chain:</p>
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-xs text-indigo-600 font-medium">{employee.firstName}</span>
                  {reportingChain.map((r) => (
                    <React.Fragment key={r.id}>
                      <ChevronRight className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-700">{r.firstName}</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Skills */}
          {employee.skills.length > 0 && (
            <section className="p-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {employee.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => onViewFullProfile?.(employee.id)}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <Briefcase className="w-4 h-4" />
            View Full Profile
          </button>
        </div>
      </div>
    </>
  );
}

export default EmployeeProfileCard;
