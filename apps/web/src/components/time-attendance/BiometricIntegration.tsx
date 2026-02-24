"use client";

import React, { useState } from "react";
import {
  Fingerprint,
  ScanFace,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  Plus,
} from "lucide-react";

interface BiometricDevice {
  id: string;
  name: string;
  type: "fingerprint" | "face";
  location: string;
  status: "connected" | "disconnected" | "syncing";
  lastSync: string;
  enrolledCount: number;
  firmwareVersion: string;
}

interface EnrollmentStatus {
  totalEmployees: number;
  fingerprintEnrolled: number;
  faceEnrolled: number;
  pendingEnrollment: number;
}

const mockDevices: BiometricDevice[] = [
  {
    id: "bio-001",
    name: "FP Scanner - Main Entrance",
    type: "fingerprint",
    location: "Building A, Ground Floor",
    status: "connected",
    lastSync: "2026-01-23T09:10:00Z",
    enrolledCount: 245,
    firmwareVersion: "3.2.1",
  },
  {
    id: "bio-002",
    name: "Face Recognition - Lobby",
    type: "face",
    location: "Building A, Reception",
    status: "connected",
    lastSync: "2026-01-23T09:08:00Z",
    enrolledCount: 230,
    firmwareVersion: "4.1.0",
  },
  {
    id: "bio-003",
    name: "FP Scanner - Server Room",
    type: "fingerprint",
    location: "Building B, Floor 2",
    status: "disconnected",
    lastSync: "2026-01-22T18:45:00Z",
    enrolledCount: 45,
    firmwareVersion: "3.1.8",
  },
  {
    id: "bio-004",
    name: "Face Recognition - Cafeteria",
    type: "face",
    location: "Building A, Floor 1",
    status: "syncing",
    lastSync: "2026-01-23T09:05:00Z",
    enrolledCount: 210,
    firmwareVersion: "4.0.9",
  },
];

const mockEnrollment: EnrollmentStatus = {
  totalEmployees: 280,
  fingerprintEnrolled: 245,
  faceEnrolled: 230,
  pendingEnrollment: 35,
};

export default function BiometricIntegration() {
  const [devices] = useState<BiometricDevice[]>(mockDevices);
  const [enrollment] = useState<EnrollmentStatus>(mockEnrollment);

  const getStatusColor = (status: BiometricDevice["status"]) => {
    switch (status) {
      case "connected":
        return "text-aurora-green";
      case "disconnected":
        return "text-coral-alert";
      case "syncing":
        return "text-sunset-amber";
    }
  };

  const getStatusIcon = (status: BiometricDevice["status"]) => {
    switch (status) {
      case "connected":
        return <Wifi className="w-4 h-4" />;
      case "disconnected":
        return <WifiOff className="w-4 h-4" />;
      case "syncing":
        return <RefreshCw className="w-4 h-4 animate-spin" />;
    }
  };

  const getStatusLabel = (status: BiometricDevice["status"]) => {
    switch (status) {
      case "connected":
        return "Connected";
      case "disconnected":
        return "Disconnected";
      case "syncing":
        return "Syncing...";
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-celestial-indigo/10 rounded-lg">
            <Fingerprint className="w-5 h-5 text-celestial-indigo" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">
              Biometric Integration
            </h2>
            <p className="text-sm text-silver-mist">
              Device management and enrollment status
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm bg-celestial-indigo text-white rounded-lg hover:bg-celestial-indigo/90 transition-colors">
          <Plus className="w-4 h-4" />
          Add Device
        </button>
      </div>

      {/* Enrollment Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-3 rounded-lg border border-cloud dark:border-nebula-purple/50">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist">Total Employees</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">
            {enrollment.totalEmployees}
          </p>
        </div>
        <div className="p-3 rounded-lg border border-cloud dark:border-nebula-purple/50">
          <div className="flex items-center gap-2 mb-1">
            <Fingerprint className="w-4 h-4 text-aurora-green" />
            <span className="text-xs text-silver-mist">Fingerprint</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">
            {enrollment.fingerprintEnrolled}
          </p>
          <p className="text-xs text-aurora-green">
            {((enrollment.fingerprintEnrolled / enrollment.totalEmployees) * 100).toFixed(0)}% enrolled
          </p>
        </div>
        <div className="p-3 rounded-lg border border-cloud dark:border-nebula-purple/50">
          <div className="flex items-center gap-2 mb-1">
            <ScanFace className="w-4 h-4 text-aurora-green" />
            <span className="text-xs text-silver-mist">Face Recognition</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">
            {enrollment.faceEnrolled}
          </p>
          <p className="text-xs text-aurora-green">
            {((enrollment.faceEnrolled / enrollment.totalEmployees) * 100).toFixed(0)}% enrolled
          </p>
        </div>
        <div className="p-3 rounded-lg border border-cloud dark:border-nebula-purple/50">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-sunset-amber" />
            <span className="text-xs text-silver-mist">Pending</span>
          </div>
          <p className="text-xl font-bold text-sunset-amber">
            {enrollment.pendingEnrollment}
          </p>
          <p className="text-xs text-silver-mist">Need enrollment</p>
        </div>
      </div>

      {/* Devices List */}
      <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-3">
        Connected Devices
      </h3>
      <div className="space-y-3">
        {devices.map((device) => (
          <div
            key={device.id}
            className="p-4 rounded-lg border border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo/30 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-celestial-indigo/10 rounded-lg mt-0.5">
                  {device.type === "fingerprint" ? (
                    <Fingerprint className="w-5 h-5 text-celestial-indigo" />
                  ) : (
                    <ScanFace className="w-5 h-5 text-celestial-indigo" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-ink-black dark:text-pearl">
                    {device.name}
                  </h4>
                  <p className="text-xs text-silver-mist mt-0.5">
                    {device.location}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-silver-mist">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Last sync: {formatTime(device.lastSync)}
                    </span>
                    <span>&middot;</span>
                    <span>{device.enrolledCount} enrolled</span>
                    <span>&middot;</span>
                    <span>v{device.firmwareVersion}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-1.5 text-xs ${getStatusColor(device.status)}`}>
                  {getStatusIcon(device.status)}
                  <span>{getStatusLabel(device.status)}</span>
                </div>
                <button className="p-1.5 text-silver-mist hover:text-celestial-indigo rounded transition-colors">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enrollment Button */}
      <div className="mt-6 flex items-center justify-between p-4 bg-celestial-indigo/5 rounded-lg border border-celestial-indigo/20">
        <div>
          <p className="text-sm font-medium text-ink-black dark:text-pearl">
            Enroll New Employees
          </p>
          <p className="text-xs text-silver-mist mt-0.5">
            {enrollment.pendingEnrollment} employees pending biometric enrollment
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo text-white text-sm rounded-lg hover:bg-celestial-indigo/90 transition-colors">
          <CheckCircle2 className="w-4 h-4" />
          Start Enrollment
        </button>
      </div>
    </div>
  );
}
