'use client';

import React, { useState, useEffect } from 'react';
import { FileText, XCircle, Clock, Download, Send } from 'lucide-react';
import { TimesheetService, type DashboardTimesheet } from '../services';

function getWeekDates(baseDate = new Date()) {
  const date = new Date(baseDate);
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);

  return Array.from({ length: 7 }, (_, index) => {
    const current = new Date(monday);
    current.setDate(monday.getDate() + index);
    return current;
  });
}

const WEEK_DATES = getWeekDates();
const WEEK_DAYS = WEEK_DATES.map((date) =>
  date.toLocaleDateString([], { weekday: 'short', day: '2-digit' })
);

interface TimesheetEntry {
  project: string;
  task: string;
  hours: number[];
  total: number;
}

interface TimesheetSummary {
  status: string;
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
}

export default function TimesheetsPage() {
  const [timesheetData, setTimesheetData] = useState<TimesheetEntry[]>([]);
  const [summary, setSummary] = useState<TimesheetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTimesheet, setActiveTimesheet] = useState<DashboardTimesheet | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    kind: 'success' | 'error';
    text: string;
  } | null>(null);

  const addLineItem = () => {
    setTimesheetData((rows) => [
      ...rows,
      {
        project: 'New project',
        task: 'New task',
        hours: WEEK_DATES.map(() => 0),
        total: 0,
      },
    ]);
  };

  const removeLineItem = (index: number) => {
    setTimesheetData((rows) => rows.filter((_, i) => i !== index));
  };

  const updateLineMeta = (index: number, field: 'project' | 'task', value: string) => {
    setTimesheetData((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const exportPdf = () => {
    if (typeof window !== 'undefined') window.print();
  };

  useEffect(() => {
    fetchTimesheets();
  }, []);

  const fetchTimesheets = async () => {
    try {
      const records = await TimesheetService.getTimesheets();
      const currentWeekEnd = new Date(WEEK_DATES[6]).toISOString().split('T')[0];
      const current =
        records.find((record) => record.weekEnding === currentWeekEnd) || records[0] || null;
      setActiveTimesheet(current);

      const hoursByDate = new Map(
        (current?.entries || []).map((entry) => [entry.date, entry.hours])
      );
      const entries: TimesheetEntry[] = [
        {
          project: 'Attendance Timesheet',
          task: 'Daily Work',
          hours: WEEK_DATES.map((date) => hoursByDate.get(date.toISOString().split('T')[0]) || 0),
          total: current?.totalHours || 0,
        },
      ];

      setTimesheetData(entries);
      const totalHours = entries.reduce((sum, e) => sum + e.total, 0);
      const billableHours = entries.reduce((sum, e) => sum + e.total * 0.875, 0);
      setSummary({
        status: current?.status || 'DRAFT',
        totalHours,
        billableHours: Math.round(billableHours * 10) / 10,
        nonBillableHours: Math.round((totalHours - billableHours) * 10) / 10,
      });
    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const totalsByDay = WEEK_DATES.map((date, dayIndex) => ({
        date: date.toISOString().split('T')[0],
        hours: timesheetData.reduce((sum, row) => sum + (row.hours[dayIndex] || 0), 0),
      }));

      await TimesheetService.submitTimesheet({
        employeeId: 'current-user',
        weekEnding: WEEK_DATES[6].toISOString().split('T')[0],
        entries: totalsByDay.map((entry) => ({
          date: entry.date,
          hours: entry.hours,
          status: entry.hours > 0 ? 'PRESENT' : 'ABSENT',
          checkIn: null,
          checkOut: null,
        })),
      });
      await fetchTimesheets();
      setStatusMessage({ kind: 'success', text: 'Timesheet submitted for approval.' });
    } catch (error: any) {
      console.error('Error:', error);
      setStatusMessage({ kind: 'error', text: error?.message || 'Could not submit timesheet.' });
    } finally {
      setLoading(false);
    }
  };

  const updateHours = (rowIndex: number, dayIndex: number, value: string) => {
    const nextValue = value === '' ? 0 : Number(value);
    setTimesheetData((previous) =>
      previous.map((row, currentIndex) => {
        if (currentIndex !== rowIndex) {
          return row;
        }

        const nextHours = row.hours.map((hours, currentDayIndex) =>
          currentDayIndex === dayIndex ? nextValue : hours
        );

        return {
          ...row,
          hours: nextHours,
          total: Math.round(nextHours.reduce((sum, hours) => sum + hours, 0) * 10) / 10,
        };
      })
    );
  };

  useEffect(() => {
    const totalHours = timesheetData.reduce((sum, row) => sum + row.total, 0);
    const billableHours = Math.round(totalHours * 0.875 * 10) / 10;
    setSummary((previous) => ({
      status: previous?.status || activeTimesheet?.status || 'DRAFT',
      totalHours,
      billableHours,
      nonBillableHours: Math.round((totalHours - billableHours) * 10) / 10,
    }));
  }, [activeTimesheet?.status, timesheetData]);

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-500" />
            My Timesheet
          </h1>
          <p className="text-silver-mist text-sm mt-1">Log your work hours across projects.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportPdf}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4" /> Export PDF
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> Submit for Approval
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`rounded-lg border px-4 py-2 text-sm ${
            statusMessage.kind === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-200'
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {/* Status Bar */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex justify-between items-center text-amber-800 text-sm">
        <div className="flex items-center gap-2 font-bold">
          <Clock className="w-4 h-4" /> Status: {summary?.status || 'DRAFT'}
        </div>
        <div>
          Week Ending: <strong>{WEEK_DATES[6].toLocaleDateString()}</strong>
        </div>
      </div>

      {/* Timesheet Grid */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th className="p-4 text-left min-w-[250px] font-bold text-slate-600 dark:text-slate-300">
                Project / Task
              </th>
              {WEEK_DAYS.map((day, i) => (
                <th
                  key={i}
                  className="p-4 text-center min-w-[80px] font-bold text-slate-600 dark:text-slate-300"
                >
                  {day}
                </th>
              ))}
              <th className="p-4 text-center min-w-[80px] font-bold text-indigo-600">Total</th>
              <th className="p-4 text-center w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cloud dark:divide-nebula-purple/20">
            {loading ? (
              <tr>
                <td colSpan={10} className="p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
                </td>
              </tr>
            ) : timesheetData.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-8 text-center text-slate-400">
                  No timesheet entries
                </td>
              </tr>
            ) : (
              timesheetData.map((row, i) => (
                <tr
                  key={i}
                  className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                >
                  <td className="p-4">
                    <input
                      value={row.project}
                      onChange={(e) => updateLineMeta(i, 'project', e.target.value)}
                      className="w-full font-bold text-ink-black dark:text-pearl bg-transparent border-0 focus:ring-1 focus:ring-indigo-300 rounded px-1"
                    />
                    <input
                      value={row.task}
                      onChange={(e) => updateLineMeta(i, 'task', e.target.value)}
                      className="w-full text-xs text-silver-mist bg-transparent border-0 focus:ring-1 focus:ring-indigo-300 rounded px-1"
                    />
                  </td>
                  {row.hours.map((h, dayIdx) => (
                    <td key={dayIdx} className="p-2 text-center">
                      <input
                        type="number"
                        value={h === 0 ? '' : h}
                        onChange={(event) => updateHours(i, dayIdx, event.target.value)}
                        placeholder="-"
                        className="w-12 py-1 text-center border border-slate-200 dark:border-slate-700 rounded bg-transparent focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-300"
                      />
                    </td>
                  ))}
                  <td className="p-4 text-center font-bold text-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10">
                    {row.total}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => removeLineItem(i)}
                      className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove row"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
            {/* Total Row */}
            {!loading && timesheetData.length > 0 && (
              <tr className="bg-slate-100 dark:bg-slate-800 font-bold">
                <td className="p-4 text-right text-slate-600 dark:text-slate-300">Daily Total</td>
                {WEEK_DAYS.map((_, dayIdx) => {
                  const dayTotal = timesheetData.reduce(
                    (sum, row) => sum + (row.hours[dayIdx] || 0),
                    0
                  );
                  return (
                    <td
                      key={dayIdx}
                      className={`p-4 text-center ${dayTotal === 0 ? 'text-slate-400' : ''}`}
                    >
                      {dayTotal.toFixed(1)}
                    </td>
                  );
                })}
                <td className="p-4 text-center text-indigo-600 text-lg">
                  {timesheetData.reduce((sum, row) => sum + row.total, 0).toFixed(1)}
                </td>
                <td></td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="p-4 border-t border-cloud dark:border-nebula-purple/20">
          <button
            onClick={addLineItem}
            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            + Add Line Item
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-3 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-slate-600">Billable ({summary?.billableHours || 0}h)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-300"></div>
          <span className="text-slate-600">Non-Billable ({summary?.nonBillableHours || 0}h)</span>
        </div>
      </div>
    </div>
  );
}
