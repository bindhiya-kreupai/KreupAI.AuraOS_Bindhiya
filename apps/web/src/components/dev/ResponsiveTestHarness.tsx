/**
 * @module ResponsiveTestHarness
 * @description Developer tool for responsive testing — device frame selector,
 *              live component preview at different viewports, orientation toggle,
 *              touch event simulator, network condition dropdown,
 *              performance metrics display, accessibility score (Sec 15.5)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Monitor,
  Smartphone,
  Tablet,
  RotateCcw,
  Wifi,
  WifiOff,
  Activity,
  CheckCircle,
  Play,
  RefreshCw,
  Cpu,
  Code,
} from 'lucide-react';
import {
  VIEWPORT_PRESETS,
  NETWORK_CONFIGS,
  checkAccessibility,
  simulateSwipe,
  simulateTap,
  type ViewportPreset,
  type NetworkCondition,
  type AccessibilityResult,
} from '@/utils/mobile-test-utils';

// ── Types ─────────────────────────────────────────────────────────────────────

interface PerformanceMetrics {
  renderTimeMs: number;
  domNodes: number;
  memoryMb: number | null;
  fps: number;
}

// ── Device Frame Icons ────────────────────────────────────────────────────────

const DEVICE_ICONS: Record<ViewportPreset, React.ElementType> = {
  iphone_se: Smartphone,
  iphone_14: Smartphone,
  ipad: Tablet,
  android_phone: Smartphone,
  android_tablet: Tablet,
  desktop: Monitor,
};

const _DEVICE_COLORS: Record<ViewportPreset, string> = {
  iphone_se: 'text-slate-700',
  iphone_14: 'text-blue-600',
  ipad: 'text-indigo-600',
  android_phone: 'text-emerald-600',
  android_tablet: 'text-teal-600',
  desktop: 'text-purple-600',
};

const NETWORK_COLORS: Record<NetworkCondition, string> = {
  online: 'text-emerald-600 bg-emerald-50',
  '4g': 'text-blue-600 bg-blue-50',
  '3g': 'text-amber-600 bg-amber-50',
  '2g': 'text-orange-600 bg-orange-50',
  slow_2g: 'text-red-500 bg-red-50',
  offline: 'text-slate-500 bg-slate-100',
};

// ── Section Component ─────────────────────────────────────────────────────────

function _Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
        <Icon className="w-4 h-4 text-slate-500" />
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          {title}
        </span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// ── Accessibility Score Badge ─────────────────────────────────────────────────

function A11yScore({ result }: { result: AccessibilityResult | null }) {
  if (!result) return <span className="text-slate-400 text-sm">Not audited</span>;
  const color =
    result.score >= 90
      ? 'text-emerald-600'
      : result.score >= 70
        ? 'text-amber-600'
        : 'text-red-600';
  const bg =
    result.score >= 90
      ? 'bg-emerald-50 border-emerald-200'
      : result.score >= 70
        ? 'bg-amber-50 border-amber-200'
        : 'bg-red-50 border-red-200';
  return (
    <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${bg}`}>
      <CheckCircle className={`w-4 h-4 ${color}`} />
      <div>
        <p className={`text-lg font-bold ${color}`}>{result.score}/100</p>
        <p className="text-xs text-slate-500">
          {result.issues.length} issues, {result.passedChecks.length} passed
        </p>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ResponsiveTestHarness() {
  const [selectedDevice, setSelectedDevice] = useState<ViewportPreset>('iphone_14');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [networkCondition, setNetworkCondition] = useState<NetworkCondition>('online');
  const [a11yResult, setA11yResult] = useState<AccessibilityResult | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [touchLog, setTouchLog] = useState<string[]>([]);
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [activePanel, setActivePanel] = useState<'touch' | 'network' | 'a11y' | 'perf'>('touch');
  const previewRef = useRef<HTMLDivElement>(null);
  const _frameRef = useRef<HTMLIFrameElement>(null);

  const dims = VIEWPORT_PRESETS[selectedDevice];
  const previewWidth = orientation === 'portrait' ? dims.width : dims.height;
  const previewHeight = orientation === 'portrait' ? dims.height : dims.width;

  // Scale the preview to fit in the harness panel
  const maxPreviewWidth = 320;
  const scale = Math.min(1, maxPreviewWidth / previewWidth);
  const scaledWidth = Math.round(previewWidth * scale);
  const scaledHeight = Math.round(previewHeight * scale);

  const logTouch = useCallback((msg: string) => {
    setTouchLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 20));
  }, []);

  const handleSimulateSwipe = (dir: 'left' | 'right' | 'up' | 'down') => {
    logTouch(`Swipe ${dir} (100px)`);
    if (previewRef.current) {
      simulateSwipe(previewRef.current, dir, 100);
    }
  };

  const handleSimulateTap = () => {
    logTouch('Tap at center');
    if (previewRef.current) {
      simulateTap(previewRef.current);
    }
  };

  const handleRunA11y = async () => {
    setIsRunningAudit(true);
    await new Promise((r) => setTimeout(r, 600));
    const result = checkAccessibility(previewRef.current);
    setA11yResult(result);
    setIsRunningAudit(false);
  };

  const handleMeasurePerformance = () => {
    const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
    // Force a reflow to measure
    if (previewRef.current) {
      void previewRef.current.offsetHeight;
    }
    const end = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const renderTime = end - start;
    const domNodes = typeof document !== 'undefined' ? document.querySelectorAll('*').length : 0;
    const memMb =
      typeof performance !== 'undefined' && 'memory' in performance
        ? parseFloat(
            (
              (performance as unknown as { memory: { usedJSHeapSize: number } }).memory
                .usedJSHeapSize / 1_048_576
            ).toFixed(1)
          )
        : null;

    setMetrics({
      renderTimeMs: parseFloat(renderTime.toFixed(2)),
      domNodes,
      memoryMb: memMb,
      fps: Math.min(60, Math.round(1000 / Math.max(renderTime, 0.1))),
    });
  };

  const networkConfig = NETWORK_CONFIGS[networkCondition];

  return (
    <div className="flex flex-col h-full bg-slate-50 font-mono text-sm">
      {/* Top Bar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-slate-900 text-slate-100 border-b border-slate-700 overflow-x-auto">
        <div className="flex items-center gap-1.5 mr-2">
          <Code className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-xs text-indigo-300">Responsive Harness</span>
        </div>
        {/* Device Selector */}
        {(Object.keys(VIEWPORT_PRESETS) as ViewportPreset[]).map((vp) => {
          const Icon = DEVICE_ICONS[vp];
          const isSelected = selectedDevice === vp;
          return (
            <button
              key={vp}
              onClick={() => setSelectedDevice(vp)}
              title={VIEWPORT_PRESETS[vp].label}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all whitespace-nowrap ${isSelected ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {VIEWPORT_PRESETS[vp].label}
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setOrientation((o) => (o === 'portrait' ? 'landscape' : 'portrait'))}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title="Toggle orientation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {orientation === 'portrait' ? 'Portrait' : 'Landscape'}
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Preview Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-100 overflow-auto">
          {/* Viewport Info */}
          <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold">{VIEWPORT_PRESETS[selectedDevice].label}</span>
            <span>·</span>
            <span>
              {previewWidth} × {previewHeight}
            </span>
            {scale < 1 && (
              <span className="text-slate-400">(scaled {Math.round(scale * 100)}%)</span>
            )}
            <span>·</span>
            <span>{orientation}</span>
          </div>

          {/* Device Frame */}
          <div
            className="relative bg-white shadow-2xl"
            style={{
              width: scaledWidth,
              height: scaledHeight,
              borderRadius:
                selectedDevice.includes('iphone') || selectedDevice.includes('android_phone')
                  ? 24
                  : 12,
              border: '3px solid #1e293b',
              overflow: 'hidden',
            }}
          >
            {/* Notch / Camera (for phones) */}
            {(selectedDevice === 'iphone_14' || selectedDevice === 'iphone_se') && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-900 rounded-b-2xl z-10" />
            )}
            {/* Preview Content */}
            <div
              ref={previewRef}
              className="w-full h-full overflow-auto bg-white"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                width: previewWidth,
                height: previewHeight,
              }}
            >
              {/* Placeholder content for the preview frame */}
              <div className="p-4 space-y-4">
                <div className="h-8 bg-indigo-600 rounded-lg" />
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-slate-200 rounded-lg" />
                  ))}
                </div>
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 bg-slate-100 rounded-lg" />
                  ))}
                </div>
                <div className="h-40 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs">
                  <span>Component Preview Area</span>
                </div>
                <button
                  className="w-full py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium"
                  aria-label="Primary action"
                >
                  Action Button
                </button>
              </div>
            </div>
          </div>

          {/* Network Badge */}
          <div
            className={`mt-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${NETWORK_COLORS[networkCondition]}`}
          >
            {networkCondition === 'offline' ? (
              <WifiOff className="w-3 h-3" />
            ) : (
              <Wifi className="w-3 h-3" />
            )}
            {networkCondition.replace('_', ' ').toUpperCase()}
            {networkCondition !== 'offline' && (
              <span className="text-slate-400 ml-1">{networkConfig.latencyMs}ms</span>
            )}
          </div>
        </div>

        {/* Control Panel */}
        <div className="w-72 flex flex-col border-l border-slate-200 bg-white overflow-y-auto">
          {/* Panel Tabs */}
          <div className="grid grid-cols-4 border-b border-slate-200">
            {(['touch', 'network', 'a11y', 'perf'] as const).map((panel) => (
              <button
                key={panel}
                onClick={() => setActivePanel(panel)}
                className={`py-2.5 text-xs font-medium capitalize transition-colors ${activePanel === panel ? 'text-indigo-700 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {panel === 'a11y' ? 'A11y' : panel === 'perf' ? 'Perf' : panel}
              </button>
            ))}
          </div>

          {/* Touch Simulator */}
          {activePanel === 'touch' && (
            <div className="p-4 space-y-4">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                Touch Event Simulator
              </p>

              {/* D-pad for swipe */}
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => handleSimulateSwipe('up')}
                  className="w-10 h-10 bg-slate-100 hover:bg-indigo-100 rounded-lg flex items-center justify-center text-slate-600 font-bold transition-colors"
                >
                  ↑
                </button>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleSimulateSwipe('left')}
                    className="w-10 h-10 bg-slate-100 hover:bg-indigo-100 rounded-lg flex items-center justify-center text-slate-600 font-bold transition-colors"
                  >
                    ←
                  </button>
                  <button
                    onClick={handleSimulateTap}
                    className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center justify-center text-white font-bold transition-colors text-xs"
                  >
                    TAP
                  </button>
                  <button
                    onClick={() => handleSimulateSwipe('right')}
                    className="w-10 h-10 bg-slate-100 hover:bg-indigo-100 rounded-lg flex items-center justify-center text-slate-600 font-bold transition-colors"
                  >
                    →
                  </button>
                </div>
                <button
                  onClick={() => handleSimulateSwipe('down')}
                  className="w-10 h-10 bg-slate-100 hover:bg-indigo-100 rounded-lg flex items-center justify-center text-slate-600 font-bold transition-colors"
                >
                  ↓
                </button>
              </div>

              {/* Event Log */}
              <div>
                <p className="text-xs text-slate-400 mb-2">Event Log</p>
                <div className="bg-slate-900 rounded-lg p-2 h-32 overflow-y-auto">
                  {touchLog.length === 0 ? (
                    <p className="text-slate-600 text-xs">No events yet...</p>
                  ) : (
                    touchLog.map((log, i) => (
                      <p key={i} className="text-green-400 text-xs">
                        {log}
                      </p>
                    ))
                  )}
                </div>
              </div>
              <button
                onClick={() => setTouchLog([])}
                className="w-full text-xs text-slate-500 hover:text-slate-700 transition-colors"
              >
                Clear log
              </button>
            </div>
          )}

          {/* Network Panel */}
          {activePanel === 'network' && (
            <div className="p-4 space-y-4">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                Network Condition
              </p>
              <div className="space-y-2">
                {(Object.keys(NETWORK_CONFIGS) as NetworkCondition[]).map((nc) => {
                  const cfg = NETWORK_CONFIGS[nc];
                  const isSelected = networkCondition === nc;
                  return (
                    <button
                      key={nc}
                      onClick={() => setNetworkCondition(nc)}
                      className={`w-full text-left px-3 py-2 rounded-lg border transition-all ${isSelected ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <div className="flex justify-between items-center">
                        <span
                          className={`text-xs font-semibold ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}
                        >
                          {nc === 'offline' ? 'Offline' : nc.replace('_', ' ').toUpperCase()}
                        </span>
                        {isSelected && <span className="text-indigo-400 text-xs">✓</span>}
                      </div>
                      {nc !== 'offline' && (
                        <div className="text-xs text-slate-400 mt-0.5">
                          ↓
                          {cfg.downloadKbps >= 1000
                            ? `${cfg.downloadKbps / 1000}Mbps`
                            : `${cfg.downloadKbps}Kbps`}{' '}
                          · {cfg.latencyMs}ms
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Accessibility Panel */}
          {activePanel === 'a11y' && (
            <div className="p-4 space-y-4">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                Accessibility Audit
              </p>
              <A11yScore result={a11yResult} />
              <button
                onClick={handleRunA11y}
                disabled={isRunningAudit}
                className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {isRunningAudit ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Running Audit...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    Run Audit
                  </>
                )}
              </button>
              {a11yResult && (
                <div className="space-y-2">
                  {a11yResult.issues.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-red-600 mb-1">
                        Issues ({a11yResult.issues.length})
                      </p>
                      {a11yResult.issues.map((issue, i) => (
                        <div
                          key={i}
                          className={`rounded-lg p-2 mb-1 text-xs ${issue.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}
                        >
                          <p className="font-semibold">{issue.rule}</p>
                          <p>{issue.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {a11yResult.passedChecks.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-emerald-600 mb-1">
                        Passed ({a11yResult.passedChecks.length})
                      </p>
                      {a11yResult.passedChecks.map((check, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-1.5 text-xs text-emerald-700 mb-0.5"
                        >
                          <CheckCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                          {check}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Performance Panel */}
          {activePanel === 'perf' && (
            <div className="p-4 space-y-4">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                Performance Metrics
              </p>
              <button
                onClick={handleMeasurePerformance}
                className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Activity className="w-3.5 h-3.5" />
                Measure Now
              </button>
              {metrics ? (
                <div className="space-y-3">
                  {[
                    {
                      label: 'Render Time',
                      value: `${metrics.renderTimeMs}ms`,
                      sub: metrics.renderTimeMs < 16 ? '< 16ms (60fps)' : '> 16ms (drop)',
                      ok: metrics.renderTimeMs < 16,
                    },
                    {
                      label: 'Est. FPS',
                      value: `${metrics.fps}fps`,
                      sub: metrics.fps >= 60 ? 'Smooth' : metrics.fps >= 30 ? 'Acceptable' : 'Slow',
                      ok: metrics.fps >= 60,
                    },
                    {
                      label: 'DOM Nodes',
                      value: String(metrics.domNodes),
                      sub: metrics.domNodes > 1500 ? 'High (> 1500)' : 'Optimal',
                      ok: metrics.domNodes <= 1500,
                    },
                    {
                      label: 'Memory',
                      value: metrics.memoryMb ? `${metrics.memoryMb}MB` : 'N/A',
                      sub: metrics.memoryMb
                        ? metrics.memoryMb > 50
                          ? 'High'
                          : 'Normal'
                        : 'Unavailable',
                      ok: !metrics.memoryMb || metrics.memoryMb <= 50,
                    },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"
                    >
                      <div>
                        <p className="text-xs text-slate-500">{m.label}</p>
                        <p className="text-xs text-slate-400">{m.sub}</p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-bold ${m.ok ? 'text-emerald-600' : 'text-red-600'}`}
                        >
                          {m.value}
                        </p>
                        <span className={`text-xs ${m.ok ? 'text-emerald-500' : 'text-red-500'}`}>
                          {m.ok ? '✓' : '⚠'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-lg p-4 text-center">
                  <Cpu className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">
                    Click &quot;Measure Now&quot; to capture metrics
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Viewport Info Footer */}
          <div className="mt-auto border-t border-slate-200 p-4 bg-slate-50">
            <p className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-wide">
              Viewport
            </p>
            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Device</span>
                <span className="font-medium">{VIEWPORT_PRESETS[selectedDevice].label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Resolution</span>
                <span className="font-medium">
                  {previewWidth} × {previewHeight}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">DPR</span>
                <span className="font-medium">{dims.devicePixelRatio}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Scale</span>
                <span className="font-medium">{Math.round(scale * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
