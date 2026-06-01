'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Users, Filter } from 'lucide-react';

export default function LeaveCalendarPage() {
  const [leaveData, setLeaveData] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeaveCalendar();
  }, [currentMonth]);

  const fetchLeaveCalendar = async () => {
    try {
      setLoading(true);
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const response = await fetch(
        `/api/v1/leave-calendar?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      const result = await response.json();
      if (result.success) {
        setLeaveData(result.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch leave calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: any[] = [];

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: null, leaves: [] });
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];

      const leavesOnDate = leaveData.filter((leave) => {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        return date >= start && date <= end;
      });

      days.push({ date, leaves: leavesOnDate });
    }

    return days;
  };

  const days = getDaysInMonth();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <CalendarIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Leave Calendar</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Team leave overview</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Total Leaves</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{leaveData.length}</p>
            </div>
            <CalendarIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-300">Approved</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {leaveData.filter((l) => l.status === 'APPROVED').length}
              </p>
            </div>
            <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-300">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                {leaveData.filter((l) => l.status === 'PENDING').length}
              </p>
            </div>
            <CalendarIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-300">Employees on Leave</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {new Set(leaveData.map((l) => l.employeeId)).size}
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={previousMonth}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Previous
          </button>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={nextMonth}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Next
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Week Day Headers */}
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center font-semibold text-gray-700 dark:text-gray-300 py-2"
            >
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {days.map((day, index) => (
            <div
              key={index}
              className={`min-h-[100px] border border-gray-200 dark:border-gray-700 rounded-lg p-2 ${
                day.date ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
              }`}
            >
              {day.date && (
                <>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {day.date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {day.leaves.slice(0, 3).map((leave: any, i: number) => (
                      <div
                        key={i}
                        className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded truncate"
                        title={`${leave.employeeId} - ${leave.reason}`}
                      >
                        {leave.employeeId}
                      </div>
                    ))}
                    {day.leaves.length > 3 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        +{day.leaves.length - 3} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Leaves List */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Upcoming Leaves
        </h3>
        <div className="space-y-3">
          {leaveData
            .filter((leave) => new Date(leave.startDate) >= new Date())
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
            .slice(0, 10)
            .map((leave) => (
              <div
                key={leave.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {leave.employeeId}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(leave.startDate).toLocaleDateString()} -{' '}
                    {new Date(leave.endDate).toLocaleDateString()} ({leave.totalDays} days)
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    leave.status === 'APPROVED'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}
                >
                  {leave.status}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

