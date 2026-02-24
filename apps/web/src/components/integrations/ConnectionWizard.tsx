"use client";

import React, { useState } from "react";
import { X, CheckCircle2, ArrowRight, Loader2, Shield } from "lucide-react";
import type { Integration } from "./IntegrationMarketplace";

interface ConnectionWizardProps {
  integration: Integration;
  onClose: () => void;
  onConnect?: (config: Record<string, string>) => void;
}

export default function ConnectionWizard({ integration, onClose, onConnect }: ConnectionWizardProps) {
  const [step, setStep] = useState<"auth" | "configure" | "test" | "done">("auth");
  const [apiKey, setApiKey] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [testing, setTesting] = useState(false);

  const handleAuth = () => {
    setStep("configure");
  };

  const handleConfigure = () => {
    setStep("test");
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      setStep("done");
      onConnect?.({ apiKey, webhookUrl });
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/30 w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-ink-black dark:text-pearl">
            Connect {integration.name}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-deep-cosmos rounded">
            <X className="w-5 h-5 text-silver-mist" />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2">
          {["auth", "configure", "test", "done"].map((s, i) => (
            <React.Fragment key={s}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === s ? "bg-celestial-indigo text-white" :
                ["auth", "configure", "test", "done"].indexOf(step) > i ? "bg-aurora-green text-white" :
                "bg-gray-100 dark:bg-deep-cosmos text-silver-mist"
              }`}>
                {["auth", "configure", "test", "done"].indexOf(step) > i ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
              </div>
              {i < 3 && <div className={`flex-1 h-0.5 ${["auth", "configure", "test", "done"].indexOf(step) > i ? "bg-aurora-green" : "bg-gray-200 dark:bg-gray-700"}`} />}
            </React.Fragment>
          ))}
        </div>

        {step === "auth" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Shield className="w-5 h-5 text-blue-500" />
              <p className="text-xs text-blue-700 dark:text-blue-300">You will be redirected to {integration.name} to authorize access.</p>
            </div>
            <div>
              <label className="text-sm font-medium text-ink-black dark:text-pearl block mb-1">API Key (Optional)</label>
              <input type="text" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Enter API key..." className="w-full px-3 py-2 bg-gray-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/30 rounded-lg text-sm text-ink-black dark:text-pearl" />
            </div>
            <button onClick={handleAuth} className="w-full px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2">
              Authorize <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === "configure" && (
          <div className="space-y-4">
            <p className="text-sm text-silver-mist">Configure sync settings for {integration.name}.</p>
            <div>
              <label className="text-sm font-medium text-ink-black dark:text-pearl block mb-1">Webhook URL</label>
              <input type="text" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 bg-gray-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/30 rounded-lg text-sm text-ink-black dark:text-pearl" />
            </div>
            <div>
              <label className="text-sm font-medium text-ink-black dark:text-pearl block mb-1">Sync Frequency</label>
              <select className="w-full px-3 py-2 bg-gray-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/30 rounded-lg text-sm text-ink-black dark:text-pearl">
                <option>Real-time</option>
                <option>Every 5 minutes</option>
                <option>Every 15 minutes</option>
                <option>Hourly</option>
              </select>
            </div>
            <button onClick={handleConfigure} className="w-full px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2">
              Test Connection <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === "test" && (
          <div className="py-8 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-celestial-indigo mx-auto animate-spin" />
            <p className="text-sm text-ink-black dark:text-pearl font-medium">Testing connection...</p>
            <p className="text-xs text-silver-mist">Verifying credentials and connectivity</p>
          </div>
        )}

        {step === "done" && (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-aurora-green mx-auto" />
            <p className="text-lg font-bold text-ink-black dark:text-pearl">Connected!</p>
            <p className="text-sm text-silver-mist">{integration.name} is now connected and syncing.</p>
            <button onClick={onClose} className="px-6 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
