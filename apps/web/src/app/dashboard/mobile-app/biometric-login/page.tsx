"use client";

import React, { useState, useEffect } from 'react';
import {
    Fingerprint,
    ScanFace,
    ShieldAlert,
    Smartphone,
    ToggleLeft,
    ToggleRight,
    Lock,
    KeyRound,
    UserCheck,
    History
} from 'lucide-react';
import { BiometricService } from '../services';

export default function BiometricLoginPage() {
    const [faceId, setFaceId] = useState(true);
    const [touchId, setTouchId] = useState(true);
    const [fallbackPin, setFallbackPin] = useState(true);
    const [sessionTimeout, setSessionTimeout] = useState('30');
    const [config, setConfig] = useState<any>(null);
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [configData, enrollmentsData] = await Promise.all([
                BiometricService.getConfig(),
                BiometricService.getAllEnrollments()
            ]);
            if (configData) setConfig(configData);
            if (enrollmentsData.length > 0) setEnrollments(enrollmentsData);
        } catch (error) {
            console.error('Error fetching biometric data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Fingerprint className="w-6 h-6 text-indigo-500" />
                        Biometric Login
                    </h1>
                    <p className="text-slate-500 text-sm">Configure authentication methods and security policies for mobile access.</p>
                </div>
                <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Settings */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Authentication Methods */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-indigo-500" /> Authentication Methods
                        </h2>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                        <ScanFace className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                    </div>
                                    <div>
                                        <div className="font-bold">Face ID / Face Unlock</div>
                                        <div className="text-sm text-slate-500">Allow users to log in using facial recognition.</div>
                                    </div>
                                </div>
                                <button onClick={() => setFaceId(!faceId)} className="text-indigo-600 transition-colors">
                                    {faceId ? <ToggleRight className="w-10 h-10 fill-indigo-100" /> : <ToggleLeft className="w-10 h-10 text-slate-300" />}
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                        <Fingerprint className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                    </div>
                                    <div>
                                        <div className="font-bold">Touch ID / Fingerprint</div>
                                        <div className="text-sm text-slate-500">Enable fingerprint scanning for quick access.</div>
                                    </div>
                                </div>
                                <button onClick={() => setTouchId(!touchId)} className="text-indigo-600 transition-colors">
                                    {touchId ? <ToggleRight className="w-10 h-10 fill-indigo-100" /> : <ToggleLeft className="w-10 h-10 text-slate-300" />}
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                        <KeyRound className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                    </div>
                                    <div>
                                        <div className="font-bold">Fallback PIN</div>
                                        <div className="text-sm text-slate-500">Require a 6-digit PIN if biometrics fail.</div>
                                    </div>
                                </div>
                                <button onClick={() => setFallbackPin(!fallbackPin)} className="text-indigo-600 transition-colors">
                                    {fallbackPin ? <ToggleRight className="w-10 h-10 fill-indigo-100" /> : <ToggleLeft className="w-10 h-10 text-slate-300" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Session Security */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-amber-500" /> Session Security
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Session Timeout (Inactivity)</label>
                                <select
                                    value={sessionTimeout}
                                    onChange={(e) => setSessionTimeout(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                >
                                    <option value="5">5 Minutes</option>
                                    <option value="15">15 Minutes</option>
                                    <option value="30">30 Minutes</option>
                                    <option value="60">1 Hour</option>
                                    <option value="never">Never (Not Recommended)</option>
                                </select>
                                <p className="text-xs text-slate-500 mt-2">Force re-authentication after this period.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Maximum Login Attempts</label>
                                <select className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm">
                                    <option>3 Attempts</option>
                                    <option>5 Attempts</option>
                                    <option>10 Attempts</option>
                                </select>
                                <p className="text-xs text-slate-500 mt-2">Lock account after failed attempts.</p>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                            <input type="checkbox" id="screenshot" className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" defaultChecked />
                            <label htmlFor="screenshot" className="text-sm font-medium">Block Screenshots (Android Only)</label>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800">
                        <h3 className="font-bold text-indigo-900 dark:text-indigo-200 mb-2">Security Status</h3>
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-lg mb-4">
                            <UserCheck className="w-5 h-5" /> Strong Protection
                        </div>
                        <p className="text-sm text-indigo-800 dark:text-indigo-300 opacity-80 mb-4 leading-relaxed">
                            Biometric authentication is enabled for 94% of your active mobile users. This reduces reliance on passwords and improves security posture.
                        </p>
                        <div className="w-full bg-indigo-200 dark:bg-indigo-800 rounded-full h-2 mb-2">
                            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                        </div>
                        <div className="text-xs text-indigo-700 dark:text-indigo-400 font-medium text-right">94% Adoption</div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                            <History className="w-4 h-4 text-slate-400" /> Recent Security Alerts
                        </h3>
                        <div className="space-y-4">
                            <div className="flex gap-3 text-sm">
                                <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0"></div>
                                <div>
                                    <div className="font-medium text-slate-800 dark:text-slate-200">Failed FaceID Attempt</div>
                                    <div className="text-xs text-slate-500">User: john.doe@aura.com • 2m ago</div>
                                </div>
                            </div>
                            <div className="flex gap-3 text-sm">
                                <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                                <div>
                                    <div className="font-medium text-slate-800 dark:text-slate-200">New Device Login</div>
                                    <div className="text-xs text-slate-500">User: sarah.smith • 15m ago</div>
                                </div>
                            </div>
                        </div>
                        <button className="w-full mt-4 text-xs font-bold text-indigo-600 hover:underline">View Security Log</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
