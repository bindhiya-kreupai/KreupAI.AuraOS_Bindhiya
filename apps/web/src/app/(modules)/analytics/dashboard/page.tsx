'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  Clock,
  Briefcase,
  Activity,
  Search,
  Download,
} from 'lucide-react';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

type View = 'overview' | 'people';

export default function HRAnalyticsDashboardPage() {
  const [view, setView] = useState<View>('overview');
  const [stats, setStats] = useState<any>(null);
  const [_widgets, setWidgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Department,Headcount,Budget,Utilization\n' +
      departmentMetrics
        .map((d) => `${d.name},${d.headcount},${d.budget},${d.utilization}`)
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'department_metrics.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch analytics statistics
      const statsRes = await fetch('/api/v1/analytics/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data);
      }

      // Fetch dashboard widgets
      const widgetsRes = await fetch('/api/v1/dashboards?dashboardId=hr-main&limit=100');
      if (widgetsRes.ok) {
        const widgetsData = await widgetsRes.json();
        setWidgets(widgetsData.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const kpiCards = [
    {
      title: 'Total Employees',
      value: '1,234',
      change: '+12%',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-950',
    },
    {
      title: 'Payroll Cost',
      value: '₹45.2M',
      change: '+8%',
      icon: DollarSign,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-950',
    },
    {
      title: 'Avg Tenure',
      value: '3.2 Years',
      change: '+0.5',
      icon: Clock,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-950',
    },
    {
      title: 'Attrition Rate',
      value: '12.5%',
      change: '-2%',
      icon: TrendingUp,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-950',
    },
    {
      title: 'Leave Utilization',
      value: '78%',
      change: '+5%',
      icon: Calendar,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-100 dark:bg-indigo-950',
    },
    {
      title: 'Avg Performance',
      value: '4.2/5',
      change: '+0.3',
      icon: Award,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-950',
    },
    {
      title: 'Open Positions',
      value: '23',
      change: '+7',
      icon: Briefcase,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-950',
    },
    {
      title: 'Attendance Rate',
      value: '94.5%',
      change: '+1.5%',
      icon: Activity,
      color: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-100 dark:bg-teal-950',
    },
  ];

  const departmentMetrics = [
    { name: 'Engineering', headcount: 450, budget: '₹18.5M', utilization: '92%' },
    { name: 'Sales', headcount: 280, budget: '₹12.3M', utilization: '88%' },
    { name: 'Marketing', headcount: 120, budget: '₹5.2M', utilization: '85%' },
    { name: 'Operations', headcount: 180, budget: '₹6.8M', utilization: '90%' },
    { name: 'Support', headcount: 140, budget: '₹4.5M', utilization: '94%' },
    { name: 'Finance', headcount: 64, budget: '₹2.9M', utilization: '87%' },
  ];

  const filteredMetrics = departmentMetrics.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const trendingInsights = [
    {
      title: 'High Attrition Risk',
      description: '15 employees predicted to leave in next 6 months',
      severity: 'high',
      action: 'Review engagement',
    },
    {
      title: 'Hiring Demand',
      description: 'Engineering department needs 12 more resources by Q2',
      severity: 'medium',
      action: 'Start recruitment',
    },
    {
      title: 'Overtime Alert',
      description: 'Support team averaging 8 hours/week overtime',
      severity: 'medium',
      action: 'Review workload',
    },
    {
      title: 'Performance Excellence',
      description: '85% of employees rated 4+ in last review',
      severity: 'low',
      action: 'Celebrate success',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">HR Analytics Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'people') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="border-b border-slate-200 flex-1">
            <div className="flex gap-0">
              {(['overview', 'people'] as View[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    view === v
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {v === 'overview' ? 'KPI Overview' : 'People Analytics'}
                </button>
              ))}
            </div>
          </div>
        </div>
        <AnalyticsDashboard />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View toggle */}
      <div className="border-b border-slate-200">
        <div className="flex gap-0">
          {(['overview', 'people'] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                view === v
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {v === 'overview' ? 'KPI Overview' : 'People Analytics'}
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">HR Analytics Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Comprehensive workforce insights and metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchDashboardData}>
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {kpi.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                    <Icon className={`h-4 w-4 ${kpi.color}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold">{kpi.value}</div>
                  <div
                    className={`text-sm ${kpi.change.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                  >
                    {kpi.change}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">vs last month</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Department Metrics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Department Metrics</CardTitle>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-background border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Department</th>
                  <th className="text-right py-3 px-4 font-medium">Headcount</th>
                  <th className="text-right py-3 px-4 font-medium">Budget</th>
                  <th className="text-right py-3 px-4 font-medium">Utilization</th>
                </tr>
              </thead>
              <tbody>
                {filteredMetrics.map((dept, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{dept.name}</td>
                    <td className="py-3 px-4 text-right">{dept.headcount}</td>
                    <td className="py-3 px-4 text-right">{dept.budget}</td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          parseInt(dept.utilization) >= 90
                            ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400'
                            : parseInt(dept.utilization) >= 85
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400'
                        }`}
                      >
                        {dept.utilization}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Trending Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Trending Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trendingInsights.map((insight, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-lg border hover:bg-muted/50"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    insight.severity === 'high'
                      ? 'bg-red-500'
                      : insight.severity === 'medium'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  }`}
                ></div>
                <div className="flex-1">
                  <h4 className="font-semibold">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                </div>
                <Button variant="outline" size="sm">
                  {insight.action}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.reports?.total || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.reports?.active || 0} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.predictions || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">From {stats.models || 0} models</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">AI Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversations || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.messages || 0} messages</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
