"use client";

import React, { useState } from "react";
import {
  MapPin,
  Circle,
  Navigation,
  CheckCircle2,
  XCircle,
  Settings,
  Plus,
  Trash2,
} from "lucide-react";

interface GeofenceZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isActive: boolean;
}

interface LocationStatus {
  latitude: number;
  longitude: number;
  accuracy: number;
  isInsideGeofence: boolean;
  nearestZone: string;
  distanceToEdge: number;
  timestamp: string;
}

const mockZones: GeofenceZone[] = [
  {
    id: "gz-001",
    name: "Main Office - HQ",
    latitude: 12.9716,
    longitude: 77.5946,
    radiusMeters: 200,
    isActive: true,
  },
  {
    id: "gz-002",
    name: "Warehouse District",
    latitude: 12.9352,
    longitude: 77.6245,
    radiusMeters: 500,
    isActive: true,
  },
  {
    id: "gz-003",
    name: "Client Site - Tower B",
    latitude: 12.9698,
    longitude: 77.7499,
    radiusMeters: 150,
    isActive: false,
  },
];

const mockLocationStatus: LocationStatus = {
  latitude: 12.9718,
  longitude: 77.5944,
  accuracy: 5,
  isInsideGeofence: true,
  nearestZone: "Main Office - HQ",
  distanceToEdge: 45,
  timestamp: "2026-01-23T09:15:32Z",
};

export default function GeofencingGPS() {
  const [zones, setZones] = useState<GeofenceZone[]>(mockZones);
  const [locationStatus] = useState<LocationStatus>(mockLocationStatus);
  const [selectedZone, setSelectedZone] = useState<string>(mockZones[0].id);

  const activeZone = zones.find((z) => z.id === selectedZone);

  const toggleZone = (id: string) => {
    setZones((prev) =>
      prev.map((z) => (z.id === id ? { ...z, isActive: !z.isActive } : z))
    );
  };

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-celestial-indigo/10 rounded-lg">
            <MapPin className="w-5 h-5 text-celestial-indigo" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">
              Geofencing &amp; GPS
            </h2>
            <p className="text-sm text-silver-mist">
              Location-based attendance validation
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm bg-celestial-indigo text-white rounded-lg hover:bg-celestial-indigo/90 transition-colors">
          <Plus className="w-4 h-4" />
          Add Zone
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Placeholder */}
        <div className="lg:col-span-2">
          <div className="relative bg-gray-100 dark:bg-stellar-blue/50 rounded-xl border border-cloud dark:border-nebula-purple/50 h-80 overflow-hidden">
            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-20">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={`h-${i}`}
                  className="absolute w-full border-t border-gray-300 dark:border-nebula-purple/30"
                  style={{ top: `${(i + 1) * 5}%` }}
                />
              ))}
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={`v-${i}`}
                  className="absolute h-full border-l border-gray-300 dark:border-nebula-purple/30"
                  style={{ left: `${(i + 1) * 5}%` }}
                />
              ))}
            </div>

            {/* Geofence Radius Circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="w-48 h-48 rounded-full border-2 border-dashed border-celestial-indigo/60 bg-celestial-indigo/10 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full border border-celestial-indigo/40 bg-celestial-indigo/5" />
                </div>
                {/* Current Location Dot */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    <div className="w-4 h-4 bg-aurora-green rounded-full border-2 border-white shadow-lg" />
                    <div className="absolute inset-0 w-4 h-4 bg-aurora-green rounded-full animate-ping opacity-30" />
                  </div>
                </div>
                {/* Radius Label */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-celestial-indigo bg-white dark:bg-stellar-blue px-2 py-0.5 rounded-full border border-cloud dark:border-nebula-purple/50">
                  {activeZone?.radiusMeters || 200}m radius
                </div>
              </div>
            </div>

            {/* Map Label */}
            <div className="absolute bottom-3 left-3 bg-white dark:bg-stellar-blue px-3 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/50 text-xs text-silver-mist">
              <Navigation className="w-3 h-3 inline mr-1" />
              Interactive map placeholder
            </div>
          </div>

          {/* Validation Status */}
          <div className="mt-4 flex items-center gap-4">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                locationStatus.isInsideGeofence
                  ? "bg-aurora-green/10 border-aurora-green/30 text-aurora-green"
                  : "bg-coral-alert/10 border-coral-alert/30 text-coral-alert"
              }`}
            >
              {locationStatus.isInsideGeofence ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {locationStatus.isInsideGeofence
                  ? "Inside Geofence"
                  : "Outside Geofence"}
              </span>
            </div>
            <div className="text-sm text-silver-mist">
              <span className="font-medium text-ink-black dark:text-pearl">
                {locationStatus.nearestZone}
              </span>
              {" "}&middot; {locationStatus.distanceToEdge}m from edge &middot;
              Accuracy: {locationStatus.accuracy}m
            </div>
          </div>
        </div>

        {/* Zones List */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-3">
            Configured Zones
          </h3>
          {zones.map((zone) => (
            <div
              key={zone.id}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedZone === zone.id
                  ? "border-celestial-indigo bg-celestial-indigo/5"
                  : "border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo/30"
              }`}
              onClick={() => setSelectedZone(zone.id)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-ink-black dark:text-pearl">
                  {zone.name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleZone(zone.id);
                  }}
                  className={`w-8 h-5 rounded-full transition-colors relative ${
                    zone.isActive ? "bg-aurora-green" : "bg-gray-300 dark:bg-nebula-purple/50"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                      zone.isActive ? "left-3.5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-silver-mist">
                <Circle className="w-3 h-3" />
                <span>{zone.radiusMeters}m radius</span>
                <span>&middot;</span>
                <span>
                  {zone.latitude.toFixed(4)}, {zone.longitude.toFixed(4)}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button className="text-xs text-celestial-indigo hover:underline flex items-center gap-1">
                  <Settings className="w-3 h-3" />
                  Configure
                </button>
                <button className="text-xs text-coral-alert hover:underline flex items-center gap-1">
                  <Trash2 className="w-3 h-3" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
