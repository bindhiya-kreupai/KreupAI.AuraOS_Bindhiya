"use client";

import { useState, useEffect, useCallback } from 'react';
import {
    ESGMetricsService,
    ESGInitiativeService,
    ESGGoalService,
    ESGReportService,
    type ESGMetrics,
    type ESGInitiative,
    type ESGGoal,
} from '../services';

export const useESG = () => {
    const [metrics, setMetrics] = useState<ESGMetrics | null>(null);
    const [initiatives, setInitiatives] = useState<ESGInitiative[]>([]);
    const [goals, setGoals] = useState<ESGGoal[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadAllData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [metricsData, initiativesData, goalsData] = await Promise.all([
                ESGMetricsService.getMetrics(),
                ESGInitiativeService.getAll(),
                ESGGoalService.getAll(),
            ]);
            setMetrics(metricsData);
            setInitiatives(initiativesData);
            setGoals(goalsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load ESG data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAllData();
    }, [loadAllData]);

    const createInitiative = async (data: Partial<ESGInitiative>) => {
        setLoading(true);
        try {
            const newInitiative = await ESGInitiativeService.create(data);
            setInitiatives(prev => [...prev, newInitiative]);
            return newInitiative;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create initiative');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const generateReport = async (year: number, quarter?: number) => {
        setLoading(true);
        try {
            const report = await ESGReportService.generateReport({ year, quarter });
            return report;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate report');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        metrics,
        initiatives,
        goals,
        loading,
        error,
        loadAllData,
        createInitiative,
        generateReport,
    };
};
