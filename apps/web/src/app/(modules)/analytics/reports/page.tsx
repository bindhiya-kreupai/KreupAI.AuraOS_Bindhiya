'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FileText, Play, Download, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function CustomReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [executions, setExecutions] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, executions: 0 });
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    category: 'HR',
    dataSource: '',
    chartType: 'TABLE',
  });

  useEffect(() => {
    fetchReports();
    fetchExecutions();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/reports?limit=100');
      if (res.ok) {
        const data = await res.json();
        setReports(data.data || []);
        setStats((prev) => ({ ...prev, total: data.meta?.total || 0 }));
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExecutions = async () => {
    try {
      const res = await fetch('/api/v1/report-executions?limit=50');
      if (res.ok) {
        const data = await res.json();
        setExecutions(data.data || []);
        setStats((prev) => ({ ...prev, executions: data.meta?.total || 0 }));
      }
    } catch (error) {
      console.error('Error fetching executions:', error);
    }
  };

  const handleCreateReport = async () => {
    try {
      const res = await fetch('/api/v1/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          columns: [],
        }),
      });

      if (res.ok) {
        setIsCreateOpen(false);
        setFormData({
          code: '',
          name: '',
          description: '',
          category: 'HR',
          dataSource: '',
          chartType: 'TABLE',
        });
        fetchReports();
      }
    } catch (error) {
      console.error('Error creating report:', error);
    }
  };

  const handleExecuteReport = async (reportId: string) => {
    try {
      const res = await fetch(`/api/v1/reports/${reportId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parameters: {} }),
      });

      if (res.ok) {
        fetchExecutions();
        alert('Report executed successfully');
      }
    } catch (error) {
      console.error('Error executing report:', error);
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      HR: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400',
      PAYROLL: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400',
      LEAVE: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-400',
      ATTENDANCE: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-400',
      COMPLIANCE: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400',
      RECRUITMENT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400',
      PERFORMANCE: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-400',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-400';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Custom Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create, execute, and manage custom analytics reports
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>Create Report</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Custom Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="code">Report Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., EMP_HEADCOUNT"
                />
              </div>
              <div>
                <Label htmlFor="name">Report Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Employee Headcount Report"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="PAYROLL">Payroll</SelectItem>
                      <SelectItem value="LEAVE">Leave</SelectItem>
                      <SelectItem value="ATTENDANCE">Attendance</SelectItem>
                      <SelectItem value="COMPLIANCE">Compliance</SelectItem>
                      <SelectItem value="RECRUITMENT">Recruitment</SelectItem>
                      <SelectItem value="PERFORMANCE">Performance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="chartType">Chart Type</Label>
                  <Select
                    value={formData.chartType}
                    onValueChange={(value) => setFormData({ ...formData, chartType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TABLE">Table</SelectItem>
                      <SelectItem value="BAR">Bar Chart</SelectItem>
                      <SelectItem value="LINE">Line Chart</SelectItem>
                      <SelectItem value="PIE">Pie Chart</SelectItem>
                      <SelectItem value="DONUT">Donut Chart</SelectItem>
                      <SelectItem value="AREA">Area Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="dataSource">Data Source</Label>
                <Input
                  id="dataSource"
                  value={formData.dataSource}
                  onChange={(e) => setFormData({ ...formData, dataSource: e.target.value })}
                  placeholder="e.g., Employee or SQL query"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateReport}>Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Executions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.executions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No reports found. Create your first report.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Code</th>
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Category</th>
                    <th className="text-left py-3 px-4 font-medium">Chart Type</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-mono text-sm">{report.code}</td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{report.name}</div>
                        {report.description && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {report.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor(
                            report.category
                          )}`}
                        >
                          {report.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">{report.chartType}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            report.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-400'
                          }`}
                        >
                          {report.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExecuteReport(report.id)}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Execute
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Executions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Executions</CardTitle>
        </CardHeader>
        <CardContent>
          {executions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No executions yet. Run a report to see results here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Report</th>
                    <th className="text-right py-3 px-4 font-medium">Rows</th>
                    <th className="text-right py-3 px-4 font-medium">Time (ms)</th>
                    <th className="text-left py-3 px-4 font-medium">Executed At</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {executions.map((execution) => (
                    <tr key={execution.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(execution.status)}
                          <span className="text-sm">{execution.status}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{execution.report?.name || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground">
                          {execution.report?.code}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">{execution.rowCount || 0}</td>
                      <td className="py-3 px-4 text-right">{execution.executionTime || 0}</td>
                      <td className="py-3 px-4">
                        {new Date(execution.executedAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3 mr-1" />
                          Export
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

