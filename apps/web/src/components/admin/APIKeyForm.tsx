"use client";

import React, { useState } from "react";
import { Key, X, CheckCircle2 } from "lucide-react";

const AVAILABLE_SCOPES = ["read", "write", "admin", "payroll", "analytics", "recruitment", "performance"];
const EXPIRY_OPTIONS = ["30 days", "90 days", "1 year", "Never"];

interface APIKeyFormProps {
  onClose: () => void;
  onCreate?: (key: { name: string; scopes: string[]; expiresIn: string }) => void;
}

export default function APIKeyForm({ onClose, onCreate }: APIKeyFormProps) {
  const [name, setName] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<string[]>(["read"]);
  const [expiresIn, setExpiresIn] = useState("90 days");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const toggleScope = (scope: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  const handleGenerate = () => {
    const key = `ak_${name.toLowerCase().replace(/\s+/g, "_").slice(0, 4)}_${Math.random().toString(36).slice(2, 10)}`;
    setGeneratedKey(key);
    onCreate?.({ name, scopes: selectedScopes, expiresIn });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/30 w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <Key className="w-5 h-5 text-celestial-indigo" />
            Generate API Key
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-deep-cosmos rounded">
            <X className="w-5 h-5 text-silver-mist" />
          </button>
        </div>

        {!generatedKey ? (
          <>
            <div>
              <label className="text-sm font-medium text-ink-black dark:text-pearl block mb-1">Key Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Production API"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/30 rounded-lg text-sm text-ink-black dark:text-pearl"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-ink-black dark:text-pearl block mb-2">Scopes</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_SCOPES.map((scope) => (
                  <button
                    key={scope}
                    onClick={() => toggleScope(scope)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedScopes.includes(scope)
                        ? "bg-celestial-indigo text-white"
                        : "bg-gray-100 dark:bg-deep-cosmos text-silver-mist"
                    }`}
                  >
                    {scope}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-ink-black dark:text-pearl block mb-1">Expires In</label>
              <select
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/30 rounded-lg text-sm text-ink-black dark:text-pearl"
              >
                {EXPIRY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!name.trim()}
              className="w-full px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              Generate Key
            </button>
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-aurora-green">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Key Generated Successfully</span>
            </div>
            <div className="bg-gray-50 dark:bg-deep-cosmos p-3 rounded-lg">
              <p className="text-xs text-silver-mist mb-1">Copy this key now. It won&apos;t be shown again.</p>
              <code className="text-sm font-mono text-ink-black dark:text-pearl break-all">{generatedKey}</code>
            </div>
            <button onClick={onClose} className="w-full px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
