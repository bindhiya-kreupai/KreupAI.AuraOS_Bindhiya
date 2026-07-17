'use client';

import React, { useState } from 'react';
import { Plane, Users, Globe, Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import { useCabinCrew, useFlightAssignments } from '@/app/dashboard/aviation/hooks/queries';
import {
  useDeleteCrewMember,
  useDeleteFlightAssignment,
} from '@/app/dashboard/aviation/hooks/mutations';
import { CrewMemberForm } from './components/CrewMemberForm';
import { FlightAssignmentForm } from './components/FlightAssignmentForm';
import type { CrewMemberProfile, FlightAssignment } from '../types';

export default function CabinCrewPage() {
  const { data: crewMembers = [], isLoading: loadingCrew, error: errorCrew } = useCabinCrew();
  const {
    data: flightAssignments = [],
    isLoading: loadingFlights,
    error: errorFlights,
  } = useFlightAssignments();

  const deleteCrewMutation = useDeleteCrewMember();
  const deleteFlightMutation = useDeleteFlightAssignment();

  const [crewModalOpen, setCrewModalOpen] = useState(false);
  const [editingCrew, setEditingCrew] = useState<CrewMemberProfile | null>(null);

  const [flightModalOpen, setFlightModalOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState<FlightAssignment | null>(null);

  const loading = loadingCrew || loadingFlights;
  const error = errorCrew ? errorCrew.message : errorFlights ? errorFlights.message : null;

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-6rem)] items-center justify-center text-rose-500 font-bold">
        Error: {error}
      </div>
    );
  }

  const standbyCrew = crewMembers.filter((m) => m.dutyStatus === 'standby');

  return (
    <>
      <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-500" />
              Cabin Crew
            </h1>
            <p className="text-slate-500 text-sm">Manage crew rosters and flight assignments.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditingCrew(null);
                setCrewModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <Plus className="w-4 h-4" /> Add Crew
            </button>
            <button
              onClick={() => {
                setEditingFlight(null);
                setFlightModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" /> Add Flight
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-lg mb-4">Active Flights (Today)</h3>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {flightAssignments.map((flight, i) => (
                <div
                  key={flight.assignmentId || i}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center font-bold text-indigo-600 shadow-sm">
                      <Plane className="w-6 h-6 transform -rotate-45" />
                    </div>
                    <div>
                      <div className="font-bold">{flight.flightNumber}</div>
                      <div className="text-xs text-slate-500 font-mono">
                        {flight.departure?.airportCode} - {flight.arrival?.airportCode}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <div className="hidden md:block">
                      <div className="text-xs font-bold text-slate-400 uppercase">Director</div>
                      <div className="font-bold text-sm">
                        {flight.crewComplement?.cabinDirector}
                      </div>
                    </div>
                    <div className="hidden md:block">
                      <div className="text-xs font-bold text-slate-400 uppercase">Comp.</div>
                      <div className="font-bold text-sm">
                        {flight.crewComplement?.totalCrew} Crew
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold w-20 text-center ${
                        flight.status === 'in_flight'
                          ? 'bg-emerald-100 text-emerald-600'
                          : flight.status === 'cancelled'
                            ? 'bg-rose-100 text-rose-600'
                            : flight.status === 'boarding'
                              ? 'bg-indigo-100 text-indigo-600'
                              : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {flight.status.charAt(0).toUpperCase() +
                        flight.status.slice(1).replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingFlight(flight);
                          setFlightModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-500 rounded bg-white dark:bg-slate-700 shadow-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete flight?'))
                            deleteFlightMutation.mutate(flight.assignmentId);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded bg-white dark:bg-slate-700 shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {flightAssignments.length === 0 && (
                <div className="text-center py-20 text-slate-400 font-bold">
                  No active flights recorded.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Crew Roster</h3>
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {crewMembers.map((crew, i) => (
                  <div
                    key={crew.crewId || i}
                    className="flex justify-between items-center text-sm p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                        {crew.crewType?.substring(0, 2).toUpperCase() || 'CC'}
                      </div>
                      <span className="font-bold">
                        {crew.personalInfo?.firstName} {crew.personalInfo?.lastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          crew.dutyStatus === 'available'
                            ? 'bg-emerald-100 text-emerald-600'
                            : crew.dutyStatus === 'standby'
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {crew.dutyStatus}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingCrew(crew);
                            setCrewModalOpen(true);
                          }}
                          className="text-slate-400 hover:text-indigo-500"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete crew?')) deleteCrewMutation.mutate(crew.crewId);
                          }}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {crewMembers.length === 0 && (
                  <div className="text-xs text-slate-400 py-4 text-center italic">
                    No crew members found.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-xl">
              <div className="flex items-center gap-2 mb-2 opacity-80">
                <Globe className="w-5 h-5" />
                <span className="text-sm font-bold uppercase">Network Status</span>
              </div>
              <h3 className="text-3xl font-bold mb-1">98.2%</h3>
              <p className="text-indigo-100 text-sm mb-4">
                Crew assignment coverage for next 48 hours.
              </p>
            </div>
          </div>
        </div>
      </div>

      <CrewMemberForm
        open={crewModalOpen}
        onClose={() => setCrewModalOpen(false)}
        initialData={editingCrew}
      />
      <FlightAssignmentForm
        open={flightModalOpen}
        onClose={() => setFlightModalOpen(false)}
        initialData={editingFlight}
      />
    </>
  );
}
