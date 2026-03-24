'use client';

import React, { useState, useEffect } from 'react';
import { Palmtree, Globe, Plus, Loader2, X } from 'lucide-react';
import { HolidayService } from '../services';
import type { Holiday, HolidayType } from '../types';

const EMPTY_FORM = {
  name: '',
  date: '',
  type: 'public_holiday' as HolidayType,
  description: '',
  isOptional: false,
};

export default function HolidayManagementPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const result = await HolidayService.getHolidays(new Date().getFullYear());
      setHolidays(result);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHoliday = () => {
    setForm({ ...EMPTY_FORM });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.date) return;
    try {
      setSaving(true);
      await HolidayService.createHoliday(form as any);
      setShowModal(false);
      await fetchHolidays();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Palmtree className="w-6 h-6 text-indigo-500" />
            Holiday Management
          </h1>
          <p className="text-slate-500 text-sm">
            Set up annual holiday calendars for different locations.
          </p>
        </div>
        <button
          onClick={handleAddHoliday}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Holiday
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-bold text-lg mb-4">Locations</h3>
          <div className="space-y-2">
            {['New York HQ', 'London Office', 'Singapore Branch', 'Remote - US', 'Remote - EU'].map(
              (loc, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl cursor-pointer flex justify-between items-center ${
                    i === 0
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 font-bold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4" /> {loc}
                  </span>
                  {i === 0 && (
                    <span className="text-xs bg-white/50 px-2 py-0.5 rounded">Selected</span>
                  )}
                </div>
              )
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-bold text-lg mb-4">{new Date().getFullYear()} Holidays</h3>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-slate-500 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading holidays...
              </div>
            ) : holidays.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No holidays configured for this year.
              </div>
            ) : (
              holidays.map((h, i) => {
                const holidayDate = new Date(h.date);
                const monthDay = holidayDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: '2-digit',
                });
                const dayOfWeek = holidayDate.toLocaleDateString('en-US', { weekday: 'long' });
                const [month, day] = monthDay.split(' ');

                return (
                  <div
                    key={h.id || i}
                    className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-lg flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                        <span className="text-xs text-slate-500 uppercase font-bold">{month}</span>
                        <span className="text-lg font-bold text-slate-800 dark:text-slate-200">
                          {day}
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-lg">{h.name}</div>
                        <div className="text-sm text-slate-500">{dayOfWeek}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {h.isOptional && (
                        <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/20 rounded-full text-xs font-bold text-amber-600">
                          Optional
                        </span>
                      )}
                      <span className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300">
                        {h.type}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold">Add Holiday</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Holiday Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. New Year's Day"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as HolidayType }))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="public_holiday">Public Holiday</option>
                  <option value="festival">Festival</option>
                  <option value="national_day">National Day</option>
                  <option value="company_event">Company Event</option>
                  <option value="optional">Optional</option>
                  <option value="restricted">Restricted</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Optional description"
                />
              </div>
              <label className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isOptional}
                  onChange={(e) => setForm((p) => ({ ...p, isOptional: e.target.checked }))}
                  className="accent-indigo-600"
                />
                <span className="text-sm font-bold">Optional Holiday (Floating)</span>
              </label>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving || !form.name.trim() || !form.date}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Add Holiday'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
