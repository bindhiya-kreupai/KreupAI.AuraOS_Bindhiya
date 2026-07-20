'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Globe,
  Shield,
  Building2,
  FileText,
  Users,
  Calculator,
  Scale,
  ArrowRight,
  Loader2,
  CheckCircle,
  AlertCircle,
  XCircle,
} from 'lucide-react';

interface ServiceStatus {
  name: string;
  nameAr: string;
  icon: React.ElementType;
  href: string;
  endpoint: string;
  status: 'loading' | 'online' | 'error';
  details?: string;
  color: string;
}

export default function PayrollComplianceOverviewPage() {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'WPS (UAE)',
      nameAr: 'حماية الأجور',
      icon: Shield,
      href: '/dashboard/payroll-compliance/wps',
      endpoint: '/api/compliance/wps',
      status: 'loading',
      color: 'emerald',
    },
    {
      name: 'GOSI (KSA)',
      nameAr: 'التأمينات الاجتماعية',
      icon: Building2,
      href: '/dashboard/payroll-compliance/gosi',
      endpoint: '/api/compliance/gosi',
      status: 'loading',
      color: 'blue',
    },
    {
      name: 'Mudad (KSA)',
      nameAr: 'مدد',
      icon: FileText,
      href: '/dashboard/payroll-compliance/mudad',
      endpoint: '/api/compliance/mudad',
      status: 'loading',
      color: 'purple',
    },
    {
      name: 'Nitaqat (KSA)',
      nameAr: 'نطاقات',
      icon: Users,
      href: '/dashboard/payroll-compliance/nitaqat',
      endpoint: '/api/compliance/nitaqat',
      status: 'loading',
      color: 'green',
    },
    {
      name: 'EOSB Calculator',
      nameAr: 'حاسبة نهاية الخدمة',
      icon: Calculator,
      href: '/dashboard/payroll-compliance/eosb',
      endpoint: '/api/compliance/eosb',
      status: 'loading',
      color: 'amber',
    },
    {
      name: 'Labour Law',
      nameAr: 'قانون العمل',
      icon: Scale,
      href: '/dashboard/payroll-compliance/labour-law',
      endpoint: '/api/compliance/labour-law',
      status: 'loading',
      color: 'indigo',
    },
    {
      name: 'Bahrain SIO',
      nameAr: 'تأمينات البحرين',
      icon: Building2,
      href: '/dashboard/payroll-compliance/bahrain-sio',
      endpoint: '/api/compliance/bahrain-sio',
      status: 'loading',
      color: 'red',
    },
    {
      name: 'Qatar WPS',
      nameAr: 'حماية أجور قطر',
      icon: Shield,
      href: '/dashboard/payroll-compliance/qatar-wps',
      endpoint: '/api/compliance/qatar-wps',
      status: 'loading',
      color: 'purple',
    },
    {
      name: 'Oman SPF',
      nameAr: 'صندوق حماية عمان',
      icon: Building2,
      href: '/dashboard/payroll-compliance/oman-spf',
      endpoint: '/api/compliance/oman-spf',
      status: 'loading',
      color: 'rose',
    },
    {
      name: 'Kuwait PIFSS',
      nameAr: 'تأمينات الكويت',
      icon: Building2,
      href: '/dashboard/payroll-compliance/kuwait-pifss',
      endpoint: '/api/compliance/kuwait-pifss',
      status: 'loading',
      color: 'cyan',
    },
  ]);

  // Check all service endpoints on mount
  useEffect(() => {
    const checkServices = async () => {
      const updatedServices = await Promise.all(
        services.map(async (service) => {
          try {
            const res = await fetch(service.endpoint);
            const data = await res.json();
            if (res.ok && data.success) {
              return { ...service, status: 'online' as const, details: 'Service available' };
            } else {
              return {
                ...service,
                status: 'error' as const,
                details: data.error || 'Service error',
              };
            }
          } catch {
            return { ...service, status: 'error' as const, details: 'Connection failed' };
          }
        })
      );
      setServices(updatedServices);
    };
    checkServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onlineCount = services.filter((s) => s.status === 'online').length;
  const errorCount = services.filter((s) => s.status === 'error').length;
  const loadingCount = services.filter((s) => s.status === 'loading').length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return (
          <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs rounded-full font-medium">
            Online
          </span>
        );
      case 'error':
        return (
          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-full font-medium">
            Error
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs rounded-full font-medium">
            Checking...
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
          <Globe className="w-7 h-7 text-indigo-500" />
          Compliance Overview
          <span className="text-sm font-normal text-slate-500 mr-2">|</span>
          <span className="text-lg font-semibold text-slate-600 dark:text-slate-400" dir="rtl">
            نظرة عامة على الامتثال
          </span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Service health and status for all compliance modules
          <span className="mx-2">*</span>
          <span dir="rtl">صحة وحالة جميع وحدات الامتثال</span>
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white">
          <div className="text-4xl font-bold">{onlineCount}</div>
          <div className="text-sm opacity-90 mt-1">Services Online</div>
          <div className="text-xs opacity-75 mt-1" dir="rtl">
            الخدمات المتاحة
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-5 text-white">
          <div className="text-4xl font-bold">{errorCount}</div>
          <div className="text-sm opacity-90 mt-1">Services With Errors</div>
          <div className="text-xs opacity-75 mt-1" dir="rtl">
            خدمات بها أخطاء
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
          <div className="text-4xl font-bold">{loadingCount > 0 ? '...' : services.length}</div>
          <div className="text-sm opacity-90 mt-1">
            {loadingCount > 0 ? 'Checking Services' : 'Total Services'}
          </div>
          <div className="text-xs opacity-75 mt-1" dir="rtl">
            {loadingCount > 0 ? 'جاري الفحص' : 'إجمالي الخدمات'}
          </div>
        </div>
      </div>

      {/* Service Status Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
          Service Status | <span dir="rtl">حالة الخدمات</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.endpoint}
                href={service.href}
                className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all group"
              >
                <div
                  className={`w-10 h-10 bg-${service.color}-100 dark:bg-${service.color}-900/30 rounded-xl flex items-center justify-center flex-shrink-0`}
                >
                  <Icon
                    className={`w-5 h-5 text-${service.color}-600 dark:text-${service.color}-400`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                      {service.name}
                    </span>
                    {getStatusBadge(service.status)}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5" dir="rtl">
                    {service.nameAr}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {getStatusIcon(service.status)}
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
          Quick Actions | <span dir="rtl">إجراءات سريعة</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link
            href="/dashboard/payroll-compliance/eosb/end-of-service-benefits-calculator"
            className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
          >
            <Calculator className="w-5 h-5 text-amber-600 dark:text-amber-400 mb-2" />
            <div className="font-medium text-slate-900 dark:text-slate-100">Calculate EOSB</div>
            <div className="text-xs text-slate-500" dir="rtl">
              احسب مكافأة نهاية الخدمة
            </div>
          </Link>
          <Link
            href="/dashboard/payroll-compliance/wps"
            className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
          >
            <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-2" />
            <div className="font-medium text-slate-900 dark:text-slate-100">Generate WPS SIF</div>
            <div className="text-xs text-slate-500" dir="rtl">
              إنشاء ملف SIF
            </div>
          </Link>
          <Link
            href="/dashboard/payroll-compliance/labour-law"
            className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
          >
            <Scale className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-2" />
            <div className="font-medium text-slate-900 dark:text-slate-100">View Labour Laws</div>
            <div className="text-xs text-slate-500" dir="rtl">
              عرض قوانين العمل
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
