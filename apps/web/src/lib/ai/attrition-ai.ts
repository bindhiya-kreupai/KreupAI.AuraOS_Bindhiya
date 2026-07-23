/**
 * Attrition Prediction — orchestration (score → persist → aggregate → simulate)
 */

import { prisma } from '@aura/database';
import { randomUUID } from 'crypto';
import {
  ATTRITION_ALGORITHM,
  ATTRITION_MODEL_CODE,
  ATTRITION_MODEL_TYPE,
  ATTRITION_MODEL_VERSION,
  AT_RISK_THRESHOLD,
  DEFAULT_REPLACEMENT_COST_FACTOR,
  PREDICTION_FRESHNESS_DAYS,
  distributionColors,
  impactLabel,
  scoreEmployee,
} from './attrition-rules';
import { buildFeatureVectorForEmployee, buildFeatureVectors } from './attrition-retrieval';
import { emptyDashboard } from './attrition-fallback';
import type {
  AttritionAtRiskFilters,
  AttritionDashboardData,
  AttritionDistributionSlice,
  AttritionDriver,
  AttritionEmployeePrediction,
  AttritionHorizonDays,
  AttritionRecomputeResult,
  AttritionRiskLevel,
  AttritionSimulationResult,
  AttritionSummary,
} from './attrition-types';

type StoredPayload = AttritionEmployeePrediction & {
  featureScores?: Record<string, number>;
};

async function ensureActiveModel(tenantId: string, userId: string) {
  const preferred = await prisma.predictiveModel.findFirst({
    where: {
      tenantId,
      code: ATTRITION_MODEL_CODE,
      isActive: true,
      isDeleted: false,
    },
    orderBy: { updatedAt: 'desc' },
  });

  const existing =
    preferred ||
    (await prisma.predictiveModel.findFirst({
      where: {
        tenantId,
        modelType: ATTRITION_MODEL_TYPE,
        isActive: true,
        isDeleted: false,
      },
      orderBy: { updatedAt: 'desc' },
    }));

  if (existing) {
    const isRulesLike =
      !existing.algorithm ||
      existing.algorithm === ATTRITION_ALGORITHM ||
      existing.algorithm === 'WEIGHTED' ||
      existing.version === '2.1.0';

    if (
      isRulesLike &&
      (existing.version !== ATTRITION_MODEL_VERSION || existing.accuracy != null)
    ) {
      return prisma.predictiveModel.update({
        where: { id: existing.id },
        data: {
          code: existing.code || ATTRITION_MODEL_CODE,
          algorithm: ATTRITION_ALGORITHM,
          version: ATTRITION_MODEL_VERSION,
          // Rules model — no holdout accuracy until outcome feedback exists
          accuracy: null,
          name: existing.name || 'Attrition Weighted Rules v1',
          updatedBy: userId,
        },
      });
    }
    return existing;
  }

  return prisma.predictiveModel.create({
    data: {
      tenantId,
      code: ATTRITION_MODEL_CODE,
      name: 'Attrition Weighted Rules v1',
      description: 'Explainable weighted-feature attrition risk (rules-based)',
      modelType: ATTRITION_MODEL_TYPE,
      algorithm: ATTRITION_ALGORITHM,
      trainingDataset: { source: 'tenant_workforce_live' },
      features: {
        families: ['compensation', 'engagement', 'performance', 'tenure', 'management', 'workload'],
      },
      targetVariable: 'voluntary_exit_risk_0_100',
      version: ATTRITION_MODEL_VERSION,
      accuracy: null,
      status: 'ACTIVE',
      isActive: true,
      deployedAt: new Date(),
      parameters: {
        atRiskThreshold: AT_RISK_THRESHOLD,
        replacementCostFactor: DEFAULT_REPLACEMENT_COST_FACTOR,
        riskBands: { LOW: [0, 29], MEDIUM: [30, 59], HIGH: [60, 79], CRITICAL: [80, 100] },
      },
      createdBy: userId,
    },
  });
}

function freshnessCutoff(): Date {
  return new Date(Date.now() - PREDICTION_FRESHNESS_DAYS * 24 * 60 * 60 * 1000);
}

function parsePayload(inputFeatures: unknown, predictedValue: number): StoredPayload | null {
  if (!inputFeatures || typeof inputFeatures !== 'object') return null;
  const raw = inputFeatures as Record<string, unknown>;
  const output = (raw.output || raw) as Record<string, unknown>;
  if (typeof output.employeeId !== 'string') return null;
  return {
    employeeId: String(output.employeeId),
    employeeName: String(output.employeeName || 'Employee'),
    department: String(output.department || 'Unknown'),
    departmentId: output.departmentId ? String(output.departmentId) : undefined,
    location: output.location ? String(output.location) : undefined,
    role: output.role ? String(output.role) : undefined,
    managerId: (output.managerId as string | null | undefined) ?? null,
    riskScore: typeof output.riskScore === 'number' ? output.riskScore : predictedValue,
    riskLevel: (output.riskLevel as AttritionRiskLevel) || 'MEDIUM',
    horizonDays: (output.horizonDays as AttritionHorizonDays) || 180,
    primaryFactor: String(output.primaryFactor || 'Unknown'),
    factors: Array.isArray(output.factors) ? (output.factors as StoredPayload['factors']) : [],
    recommendations: Array.isArray(output.recommendations)
      ? (output.recommendations as StoredPayload['recommendations'])
      : [],
    estimatedSalary:
      typeof output.estimatedSalary === 'number' ? output.estimatedSalary : undefined,
    dataCompleteness: typeof output.dataCompleteness === 'number' ? output.dataCompleteness : 0.5,
    modelVersion: String(output.modelVersion || ATTRITION_MODEL_VERSION),
    predictedAt: String(output.predictedAt || new Date().toISOString()),
    confidence: typeof output.confidence === 'number' ? output.confidence : undefined,
    featureScores: output.featureScores as Record<string, number> | undefined,
  };
}

function toPrediction(
  vector: Awaited<ReturnType<typeof buildFeatureVectors>>[number],
  score: ReturnType<typeof scoreEmployee>,
  horizonDays: AttritionHorizonDays
): AttritionEmployeePrediction {
  return {
    employeeId: vector.employeeId,
    employeeName: vector.employeeName,
    department: vector.department,
    departmentId: vector.departmentId,
    location: vector.location,
    role: vector.role,
    managerId: vector.managerId,
    riskScore: score.riskScore,
    riskLevel: score.riskLevel,
    horizonDays,
    primaryFactor: score.primaryFactor,
    factors: score.factors,
    recommendations: score.recommendations,
    estimatedSalary: vector.estimatedSalary || undefined,
    dataCompleteness: score.dataCompleteness,
    modelVersion: ATTRITION_MODEL_VERSION,
    predictedAt: new Date().toISOString(),
    confidence: score.confidence,
  };
}

async function upsertPrediction(
  tenantId: string,
  modelId: string,
  prediction: AttritionEmployeePrediction,
  featureScores: Record<string, number>,
  userId?: string
) {
  const existing = await prisma.prediction.findFirst({
    where: {
      tenantId,
      modelId,
      entityType: 'Employee',
      entityId: prediction.employeeId,
      isDeleted: false,
    },
    orderBy: { predictedDate: 'desc' },
  });

  const payload = {
    output: prediction,
    featureScores,
  };

  if (existing) {
    await prisma.prediction.update({
      where: { id: existing.id },
      data: {
        predictedValue: prediction.riskScore,
        confidence: prediction.confidence ?? null,
        predictedDate: new Date(),
        inputFeatures: payload as object,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });
    return existing.id;
  }

  const created = await prisma.prediction.create({
    data: {
      modelId,
      tenantId,
      entityType: 'Employee',
      entityId: prediction.employeeId,
      predictedValue: prediction.riskScore,
      confidence: prediction.confidence ?? null,
      predictedDate: new Date(),
      inputFeatures: payload as object,
      createdBy: userId,
    },
  });
  return created.id;
}

export async function loadStoredPredictions(
  tenantId: string,
  opts?: { freshOnly?: boolean; modelId?: string }
): Promise<AttritionEmployeePrediction[]> {
  const where: Record<string, unknown> = {
    tenantId,
    entityType: 'Employee',
    isDeleted: false,
  };
  if (opts?.modelId) where.modelId = opts.modelId;
  if (opts?.freshOnly) where.predictedDate = { gte: freshnessCutoff() };

  const rows = await prisma.prediction.findMany({
    where: where as any,
    orderBy: { predictedDate: 'desc' },
    take: 10000,
  });

  const seen = new Set<string>();
  const out: AttritionEmployeePrediction[] = [];
  for (const row of rows) {
    const entityId = row.entityId;
    if (!entityId || seen.has(entityId)) continue;
    seen.add(entityId);
    const parsed = parsePayload(row.inputFeatures, row.predictedValue);
    if (parsed) out.push(parsed);
  }
  return out;
}

function buildDrivers(predictions: AttritionEmployeePrediction[]): AttritionDriver[] {
  const map = new Map<string, { count: number; impactSum: number }>();
  for (const p of predictions) {
    for (const f of p.factors.slice(0, 3)) {
      const cur = map.get(f.name) || { count: 0, impactSum: 0 };
      cur.count += 1;
      cur.impactSum += f.impact;
      map.set(f.name, cur);
    }
  }
  return [...map.entries()]
    .map(([factor, v]) => {
      const avgImpact = v.count ? v.impactSum / v.count : 0;
      return {
        factor,
        count: v.count,
        impact: impactLabel(avgImpact),
        avgImpact: Math.round(avgImpact),
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

function buildDistribution(
  predictions: AttritionEmployeePrediction[]
): AttritionDistributionSlice[] {
  const colors = distributionColors();
  const counts: Record<AttritionRiskLevel, number> = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  };
  for (const p of predictions) counts[p.riskLevel] += 1;

  // UI historically used High/Medium/Low — merge CRITICAL into High Risk for pie
  return [
    {
      name: 'High Risk',
      value: counts.CRITICAL + counts.HIGH,
      color: colors['High Risk'],
      level: 'HIGH',
    },
    {
      name: 'Medium Risk',
      value: counts.MEDIUM,
      color: colors['Medium Risk'],
      level: 'MEDIUM',
    },
    {
      name: 'Low Risk',
      value: counts.LOW,
      color: colors['Low Risk'],
      level: 'LOW',
    },
  ];
}

function buildSummary(
  predictions: AttritionEmployeePrediction[],
  model: { version: string; accuracy: number | null },
  lastRunAt: string | null,
  horizonDays: AttritionHorizonDays,
  costFactor = DEFAULT_REPLACEMENT_COST_FACTOR
): AttritionSummary {
  const byRiskLevel: Record<AttritionRiskLevel, number> = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    CRITICAL: 0,
  };
  let replacement = 0;
  let atRisk = 0;
  for (const p of predictions) {
    byRiskLevel[p.riskLevel] += 1;
    if (p.riskScore >= AT_RISK_THRESHOLD) {
      atRisk += 1;
      const annual =
        (p.estimatedSalary || 0) * (p.estimatedSalary && p.estimatedSalary < 50000 ? 12 : 1);
      // If salary looks monthly (< 50k), annualize; else treat as CTC/annual
      replacement += annual * costFactor;
    }
  }
  const total = predictions.length;
  return {
    totalEmployees: total,
    atRiskCount: atRisk,
    atRiskPercentage: total ? Math.round((atRisk / total) * 1000) / 10 : 0,
    replacementCostEstimate: Math.round(replacement),
    modelAccuracy: model.accuracy,
    modelVersion: model.version || ATTRITION_MODEL_VERSION,
    lastRunAt,
    byRiskLevel,
    horizonDays,
  };
}

export async function getDashboard(
  tenantId: string,
  opts?: { horizonDays?: AttritionHorizonDays; autoRecompute?: boolean; userId?: string }
): Promise<AttritionDashboardData> {
  const horizonDays = opts?.horizonDays ?? 180;
  const model = await ensureActiveModel(tenantId, opts?.userId || 'system');
  let predictions = await loadStoredPredictions(tenantId, { freshOnly: true, modelId: model.id });

  if (predictions.length === 0) {
    predictions = await loadStoredPredictions(tenantId, { freshOnly: false, modelId: model.id });
  }

  // Stale score formula (pre-calibration / wrong modelVersion) → recompute
  const needsRescore =
    predictions.length > 0 &&
    predictions.some((p) => !p.modelVersion || p.modelVersion !== ATTRITION_MODEL_VERSION);

  if ((predictions.length === 0 || needsRescore) && opts?.autoRecompute !== false) {
    await recomputeAttrition(tenantId, opts?.userId || 'system', { horizonDays });
    predictions = await loadStoredPredictions(tenantId, { freshOnly: false, modelId: model.id });
    if (predictions.length === 0) {
      const empty = emptyDashboard(horizonDays);
      empty.summary.modelVersion = model.version;
      return { ...empty, needsRecompute: true };
    }
  }

  const lastRun = await prisma.aIRunRecord.findFirst({
    where: { tenantId, runType: { in: ['attrition_prediction', 'attrition_prediction_batch'] } },
    orderBy: { startedAt: 'desc' },
  });

  const stale =
    !predictions.length ||
    predictions.some((p) => new Date(p.predictedAt).getTime() < freshnessCutoff().getTime());

  return {
    summary: buildSummary(
      predictions,
      { version: model.version, accuracy: model.accuracy },
      lastRun?.completedAt?.toISOString() || predictions[0]?.predictedAt || null,
      horizonDays
    ),
    distribution: buildDistribution(predictions),
    drivers: buildDrivers(predictions),
    stale,
    needsRecompute: predictions.length === 0,
  };
}

export async function getAtRiskEmployees(
  tenantId: string,
  filters?: AttritionAtRiskFilters & { autoRecompute?: boolean }
): Promise<{
  employees: AttritionEmployeePrediction[];
  total: number;
  page: number;
  limit: number;
}> {
  const model = await ensureActiveModel(tenantId, 'system');
  let all = await loadStoredPredictions(tenantId, { freshOnly: false, modelId: model.id });
  if (all.length === 0 && filters?.autoRecompute) {
    await recomputeAttrition(tenantId, 'system', {
      horizonDays: filters?.horizonDays ?? 180,
    });
    all = await loadStoredPredictions(tenantId, { freshOnly: false, modelId: model.id });
  }

  const minScore = filters?.minScore ?? AT_RISK_THRESHOLD;
  const filteredFull = all
    .filter((p) => {
      if (p.riskScore < minScore) return false;
      if (filters?.departmentId && p.departmentId !== filters.departmentId) return false;
      if (filters?.managerId && p.managerId !== filters.managerId) return false;
      if (filters?.riskLevel && p.riskLevel !== filters.riskLevel) return false;
      return true;
    })
    .sort((a, b) => b.riskScore - a.riskScore);

  const limit = filters?.limit ?? 50;
  const offset = filters?.offset ?? 0;
  const page = Math.floor(offset / limit) + 1;

  return {
    employees: filteredFull.slice(offset, offset + limit),
    total: filteredFull.length,
    page,
    limit,
  };
}

export async function getEmployeePrediction(
  tenantId: string,
  employeeId: string,
  opts?: { horizonDays?: AttritionHorizonDays; userId?: string }
): Promise<AttritionEmployeePrediction | null> {
  const model = await ensureActiveModel(tenantId, opts?.userId || 'system');
  const stored = await prisma.prediction.findFirst({
    where: {
      tenantId,
      modelId: model.id,
      entityType: 'Employee',
      entityId: employeeId,
      isDeleted: false,
    },
    orderBy: { predictedDate: 'desc' },
  });
  if (stored) {
    const parsed = parsePayload(stored.inputFeatures, stored.predictedValue);
    if (parsed) return parsed;
  }

  const vector = await buildFeatureVectorForEmployee(tenantId, employeeId);
  if (!vector) return null;
  const horizonDays = opts?.horizonDays ?? 180;
  const scored = scoreEmployee(vector, { horizonDays });
  const prediction = toPrediction(vector, scored, horizonDays);
  await upsertPrediction(tenantId, model.id, prediction, scored.featureScores, opts?.userId);
  return prediction;
}

export async function recomputeAttrition(
  tenantId: string,
  userId: string,
  opts?: {
    horizonDays?: AttritionHorizonDays;
    employeeIds?: string[];
    filters?: AttritionAtRiskFilters;
  }
): Promise<AttritionRecomputeResult> {
  const started = Date.now();
  const runId = randomUUID();
  const horizonDays = opts?.horizonDays ?? 180;
  const model = await ensureActiveModel(tenantId, userId);

  let vectors = await buildFeatureVectors(tenantId, opts?.filters);
  if (opts?.employeeIds?.length) {
    const set = new Set(opts.employeeIds);
    vectors = vectors.filter((v) => set.has(v.employeeId));
  }

  const failures: AttritionRecomputeResult['failures'] = [];
  let atRiskCount = 0;
  let scoredCount = 0;

  for (const vector of vectors) {
    try {
      const scored = scoreEmployee(vector, { horizonDays });
      const prediction = toPrediction(vector, scored, horizonDays);
      await upsertPrediction(tenantId, model.id, prediction, scored.featureScores, userId);
      scoredCount += 1;
      if (prediction.riskScore >= AT_RISK_THRESHOLD) atRiskCount += 1;
    } catch (err) {
      failures.push({
        employeeId: vector.employeeId,
        error: err instanceof Error ? err.message : 'score failed',
      });
    }
  }

  const durationMs = Date.now() - started;
  await prisma.aIRunRecord.create({
    data: {
      tenantId,
      runType: 'attrition_prediction_batch',
      inputContext: {
        runId,
        horizonDays,
        requestedCount: vectors.length,
        employeeIds: opts?.employeeIds,
      } as object,
      output: {
        runId,
        scoredCount,
        atRiskCount,
        failureCount: failures.length,
        failures: failures.slice(0, 50),
      } as object,
      modelVersion: model.version,
      completedAt: new Date(),
      durationMs,
      createdBy: userId,
    },
  });

  await prisma.predictiveModel.update({
    where: { id: model.id },
    data: { trainedAt: new Date(), trainingRecords: scoredCount, updatedBy: userId },
  });

  return {
    runId,
    scoredCount,
    atRiskCount,
    durationMs,
    modelVersion: model.version,
    failures,
  };
}

export async function simulateRetention(
  tenantId: string,
  salaryBoostPercent: number,
  opts?: { horizonDays?: AttritionHorizonDays }
): Promise<AttritionSimulationResult> {
  const horizonDays = opts?.horizonDays ?? 180;
  const boost = Math.min(50, Math.max(0, salaryBoostPercent));
  const vectors = await buildFeatureVectors(tenantId);
  if (vectors.length === 0) {
    return {
      salaryBoostPercent: boost,
      projectedRiskReductionPct: 0,
      estimatedSavedHeadcount: 0,
      projectedAtRiskCount: 0,
      projectedDistribution: emptyDashboard(horizonDays).distribution,
      message: 'No active employees to simulate',
    };
  }

  let baselineAtRisk = 0;
  let projectedAtRisk = 0;
  const projected: AttritionEmployeePrediction[] = [];

  for (const vector of vectors) {
    const base = scoreEmployee(vector, { horizonDays });
    if (base.riskScore >= AT_RISK_THRESHOLD) baselineAtRisk += 1;
    const sim = scoreEmployee(vector, { horizonDays, salaryBoostPercent: boost });
    if (sim.riskScore >= AT_RISK_THRESHOLD) projectedAtRisk += 1;
    projected.push(toPrediction(vector, sim, horizonDays));
  }

  const saved = Math.max(0, baselineAtRisk - projectedAtRisk);
  const reductionPct =
    baselineAtRisk > 0
      ? Math.round((saved / baselineAtRisk) * 1000) / 10
      : boost > 0
        ? Math.min(boost * 1.2, 40)
        : 0;

  return {
    salaryBoostPercent: boost,
    projectedRiskReductionPct: reductionPct,
    estimatedSavedHeadcount: saved,
    projectedAtRiskCount: projectedAtRisk,
    projectedDistribution: buildDistribution(projected),
    message: `A ${boost}% salary increase is projected to move ~${saved} employee(s) below the at-risk threshold (advisory only — no live scores changed).`,
  };
}

export async function getRunStatus(tenantId: string, runId: string) {
  const byId = await prisma.aIRunRecord.findFirst({
    where: { tenantId, id: runId },
  });
  let run = byId;
  if (!run) {
    const recent = await prisma.aIRunRecord.findMany({
      where: {
        tenantId,
        runType: { in: ['attrition_prediction', 'attrition_prediction_batch'] },
      },
      orderBy: { startedAt: 'desc' },
      take: 50,
    });
    run =
      recent.find((r) => {
        const ctx = r.inputContext as Record<string, unknown> | null;
        const out = r.output as Record<string, unknown> | null;
        return ctx?.runId === runId || out?.runId === runId;
      }) || null;
  }
  if (!run) return null;
  return {
    runId,
    status: run.completedAt ? 'completed' : 'running',
    startedAt: run.startedAt,
    completedAt: run.completedAt,
    durationMs: run.durationMs,
    output: run.output,
    modelVersion: run.modelVersion,
  };
}

/** Re-export helpers used by APIs */
export { AT_RISK_THRESHOLD };
