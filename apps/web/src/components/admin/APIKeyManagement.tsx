"use client";

import React, { useState } from "react";
import {
  Key,
  Plus,
  Ban,
  Copy,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Search,
  Shield,
} from "lucide-react";
import APIKeyForm from "./APIKeyForm";

const API_KEYS = [
  { id: 1, name: "Production API", prefix: "ak_prod_8x", scopes: ["read", "write", "admin"], created: "2025-01-15", lastUsed: "2 min ago", status: "active", requests: 1280 },
  { id: 2, name: "Payroll Service", prefix: "ak_pay_3m", scopes: ["read", "payroll"], created: "2025-02-20", lastUsed: "1 hour ago", status: "active", requests: 645 },
  { id: 3, name: "Mobile App", prefix: "ak_mob_7k", scopes: ["read"], created: "2025-03-01", lastUsed: "5 min ago", status: "active", requests: 320 },
  { id: 4, name: "Legacy Integration", prefix: "ak_leg_2p", scopes: ["read", "write"], created: "2024-06-10", lastUsed: "30 days ago", status: "expired", requests: 0 },
  { id: 5, name: "Analytics Dashboard", prefix: "ak_ana_9r", scopes: ["read", "analytics"], created: "2025-01-28", lastUsed: "10 min ago", status: "active", requests: 95 },
];

interface APIKeyManagementProps {
  onCreateKey?: (key: { name: string; scopes: string[]; expiresIn: string }) => void;
  onRevokeKey?: (keyId: number) => void;
}

export default function APIKeyManagement({ onCreateKey, onRevokeKey }: APIKeyManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const filteredKeys = API_KEYS.filter((k) =>
    k.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = (id: number, prefix: string) => {
    navigator.clipboard?.writeText(prefix + "****");
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const stats = [
    { label: "Total Keys", value: API_KEYS.length, icon: Key, color: "text-celestial-indigo" },
    { label: "Active", value: API_KEYS.filter((k) => k.status === "active").length, icon: CheckCircle2, color: "text-aurora-green" },
    { label: "Expired", value: API_KEYS.filter((k) => k.status === "expired").length, icon: AlertTriangle, color: "text-amber-500" },
    { label: "Requests Today", value: "2,340", icon: Activity, color: "text-blue-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <Key className="w-5 h-5 text-celestial-indigo" />
            API Key Management
          </h2>
          <p className="text-silver-mist text-sm">Manage API keys for external integrations.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Generate New Key
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/30">
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <div className="text-xl font-bold text-ink-black dark:text-pearl">{stat.value}</div>
            <div className="text-xs text-silver-mist">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
        <input
          type="text"
          placeholder="Search keys..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-lg text-sm text-ink-black dark:text-pearl"
        />
      </div>

      {/* Keys List */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/30 overflow-hidden">
        <div className="divide-y divide-cloud dark:divide-nebula-purple/30">
          {filteredKeys.map((key) => (
            <div key={key.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-deep-cosmos/50">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${key.status === "active" ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-gray-100 dark:bg-gray-800"}`}>
                  <Shield className={`w-5 h-5 ${key.status === "active" ? "text-emerald-600" : "text-gray-400"}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink-black dark:text-pearl">{key.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <code className="text-xs text-silver-mist font-mono">{key.prefix}****</code>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${key.status === "active" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>
                      {key.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-silver-mist">
                    <span>Scopes: {key.scopes.join(", ")}</span>
                    <span>Last used: {key.lastUsed}</span>
                    <span>{key.requests} requests</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleCopy(key.id, key.prefix)} className="p-2 hover:bg-gray-100 dark:hover:bg-deep-cosmos rounded-lg">
                  {copiedId === key.id ? <CheckCircle2 className="w-4 h-4 text-aurora-green" /> : <Copy className="w-4 h-4 text-silver-mist" />}
                </button>
                <button onClick={() => onRevokeKey?.(key.id)} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-lg">
                  <Ban className="w-4 h-4 text-rose-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showForm && <APIKeyForm onClose={() => setShowForm(false)} onCreate={onCreateKey} />}
    </div>
  );
}
