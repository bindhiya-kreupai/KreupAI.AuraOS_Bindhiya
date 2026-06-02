import { describe, it, expect } from 'vitest';
import { ModelCalibrationService } from '../model-calibration.service';

describe('ModelCalibrationService.generateQualityBenchmarks', () => {
  const benchmarks = ModelCalibrationService.generateQualityBenchmarks();

  it('returns benchmarks for multiple models', () => {
    expect(benchmarks.length).toBeGreaterThan(0);
  });

  it('each benchmark has required fields', () => {
    benchmarks.forEach((b) => {
      expect(b.modelId).toBeTruthy();
      expect(b.modelName).toBeTruthy();
      expect(b.version).toBeTruthy();
      expect(b.benchmarkDate).toBeInstanceOf(Date);
      expect(b.dataset.totalSamples).toBeGreaterThan(0);
      expect(b.metrics).toBeDefined();
      expect(b.thresholds).toBeDefined();
      expect(['APPROVED', 'NEEDS_REVIEW', 'FAILED']).toContain(b.status);
    });
  });

  it('dataset train + test samples sum reasonably', () => {
    benchmarks.forEach((b) => {
      expect(b.dataset.trainSamples + b.dataset.testSamples).toBeLessThanOrEqual(
        b.dataset.totalSamples + 1
      );
    });
  });

  it('thresholds include drift and recalibration triggers', () => {
    benchmarks.forEach((b) => {
      expect(b.thresholds.maxDriftScore).toBeGreaterThan(0);
      expect(b.thresholds.recalibrationTrigger).toBeGreaterThan(0);
    });
  });
});

describe('ModelCalibrationService.getDriftMonitorConfigs', () => {
  const configs = ModelCalibrationService.getDriftMonitorConfigs();

  it('returns 6 model configs', () => {
    expect(configs.length).toBe(6);
  });

  it('each config has alert thresholds (low < moderate < high < critical)', () => {
    configs.forEach((c) => {
      expect(c.alertThresholds.low).toBeLessThan(c.alertThresholds.moderate);
      expect(c.alertThresholds.moderate).toBeLessThan(c.alertThresholds.high);
      expect(c.alertThresholds.high).toBeLessThan(c.alertThresholds.critical);
    });
  });

  it('defaults to PSI data drift method', () => {
    configs.forEach((c) => expect(c.dataDriftMethod).toBe('PSI'));
  });

  it('autoRecalibrate is false (requires human approval)', () => {
    configs.forEach((c) => expect(c.autoRecalibrate).toBe(false));
  });

  it('notifyOnDrift is true', () => {
    configs.forEach((c) => expect(c.notifyOnDrift).toBe(true));
  });

  it('windowSize and baselineWindow are positive', () => {
    configs.forEach((c) => {
      expect(c.windowSize).toBeGreaterThan(0);
      expect(c.baselineWindow).toBeGreaterThan(c.windowSize);
    });
  });
});

describe('ModelCalibrationService.detectDrift', () => {
  it('returns NONE severity when metrics unchanged', () => {
    const r = ModelCalibrationService.detectDrift(
      'ATTRITION_PREDICTOR',
      { accuracy: 0.85, f1Score: 0.83 },
      { accuracy: 0.85, f1Score: 0.83 },
      '2024-Q1',
      '2024-Q2'
    );
    expect(r.severity).toBe('NONE');
    expect(r.driftScore).toBe(0);
    expect(r.recommendation).toBe('NO_ACTION');
    expect(r.affectedFeatures).toEqual([]);
  });

  it('detects accuracy drop and flags concept drift', () => {
    const r = ModelCalibrationService.detectDrift(
      'ATTRITION_PREDICTOR',
      { accuracy: 0.85 },
      { accuracy: 0.75 },
      '2024-Q1',
      '2024-Q2'
    );
    expect(r.driftScore).toBeGreaterThan(0);
    expect(r.affectedFeatures).toContain('accuracy');
    expect(r.driftType).toBe('CONCEPT_DRIFT');
  });

  it('detects f1 drop', () => {
    const r = ModelCalibrationService.detectDrift(
      'ENGAGEMENT_SCORER',
      { f1Score: 0.85 },
      { f1Score: 0.75 },
      'A',
      'B'
    );
    expect(r.affectedFeatures).toContain('f1_score');
  });

  it('weights AUC drift higher (×3)', () => {
    const r = ModelCalibrationService.detectDrift(
      'RECRUITMENT_SCORER',
      { auc: 0.9 },
      { auc: 0.7 },
      'A',
      'B'
    );
    expect(r.affectedFeatures).toContain('auc');
    // 0.2 * 3 = 0.6, but capped at 1.0
    expect(r.driftScore).toBeGreaterThan(0.4);
  });

  it('caps drift score at 1.0', () => {
    const r = ModelCalibrationService.detectDrift(
      'ATTRITION_PREDICTOR',
      { accuracy: 0.95, f1Score: 0.95, auc: 0.99 },
      { accuracy: 0.1, f1Score: 0.1, auc: 0.1 },
      'A',
      'B'
    );
    expect(r.driftScore).toBeLessThanOrEqual(1.0);
    expect(r.severity).toBe('CRITICAL');
  });

  it('CRITICAL → MODEL_RETRAIN_REQUIRED', () => {
    const r = ModelCalibrationService.detectDrift(
      'ATTRITION_PREDICTOR',
      { accuracy: 0.95, f1Score: 0.95, auc: 0.99 },
      { accuracy: 0.1, f1Score: 0.1, auc: 0.1 },
      'A',
      'B'
    );
    expect(r.recommendation).toBe('MODEL_RETRAIN_REQUIRED');
  });

  it('LOW severity → MONITOR_CLOSELY', () => {
    const r = ModelCalibrationService.detectDrift(
      'ATTRITION_PREDICTOR',
      { accuracy: 0.85 },
      { accuracy: 0.82 }, // 0.03 drop * 2 = 0.06 -> LOW
      'A',
      'B'
    );
    expect(r.severity).toBe('LOW');
    expect(r.recommendation).toBe('MONITOR_CLOSELY');
  });

  it('MODERATE → SCHEDULE_RECALIBRATION', () => {
    const r = ModelCalibrationService.detectDrift(
      'ATTRITION_PREDICTOR',
      { accuracy: 0.85 },
      { accuracy: 0.79 }, // 0.06 * 2 = 0.12 -> MODERATE
      'A',
      'B'
    );
    expect(r.severity).toBe('MODERATE');
    expect(r.recommendation).toBe('SCHEDULE_RECALIBRATION');
  });

  it('HIGH → IMMEDIATE_RECALIBRATION', () => {
    const r = ModelCalibrationService.detectDrift(
      'ATTRITION_PREDICTOR',
      { accuracy: 0.85 },
      { accuracy: 0.77 }, // 0.08 * 2 = 0.16 -> HIGH
      'A',
      'B'
    );
    expect(r.severity).toBe('HIGH');
    expect(r.recommendation).toBe('IMMEDIATE_RECALIBRATION');
  });

  it('detects MAPE increase (regression metric)', () => {
    const r = ModelCalibrationService.detectDrift(
      'LEAVE_FORECASTER',
      { mape: 5 },
      { mape: 15 },
      'A',
      'B'
    );
    expect(r.affectedFeatures).toContain('mape');
  });

  it('preserves baseline + current periods', () => {
    const r = ModelCalibrationService.detectDrift(
      'ATTRITION_PREDICTOR',
      { accuracy: 0.85 },
      { accuracy: 0.82 },
      '2024-Q1',
      '2024-Q2'
    );
    expect(r.baseline.period).toBe('2024-Q1');
    expect(r.current.period).toBe('2024-Q2');
  });

  it('returns DATA_DRIFT type when no specific features detected', () => {
    const r = ModelCalibrationService.detectDrift(
      'ATTRITION_PREDICTOR',
      { accuracy: 0.85 },
      { accuracy: 0.85 },
      'A',
      'B'
    );
    expect(r.driftType).toBe('DATA_DRIFT');
  });
});

describe('ModelCalibrationService.generateRecalibrationRunbook', () => {
  const runbook = ModelCalibrationService.generateRecalibrationRunbook();

  it('returns versioned runbook', () => {
    expect(runbook.version).toBeTruthy();
    expect(runbook.publishedDate).toBeInstanceOf(Date);
  });

  it('schedule defaults to MONTHLY on day 1', () => {
    expect(runbook.schedule.frequency).toBe('MONTHLY');
    expect(runbook.schedule.dayOfMonth).toBe(1);
  });

  it('nextScheduled is in the future', () => {
    expect(runbook.schedule.nextScheduled.getTime()).toBeGreaterThan(Date.now());
  });

  it('contains ordered, numbered steps', () => {
    expect(runbook.steps.length).toBeGreaterThanOrEqual(10);
    runbook.steps.forEach((s, i) => {
      expect(s.order).toBe(i + 1);
      expect(s.name).toBeTruthy();
      expect(s.estimatedMinutes).toBeGreaterThan(0);
    });
  });

  it('has at least one manual step (Approval Gate)', () => {
    const manual = runbook.steps.filter((s) => !s.automated);
    expect(manual.length).toBeGreaterThan(0);
  });

  it('rollback procedure is non-empty', () => {
    expect(runbook.rollbackProcedure.length).toBeGreaterThan(0);
  });

  it('approval gate requires approvals', () => {
    expect(runbook.approvalGate.required).toBe(true);
    expect(runbook.approvalGate.minApprovals).toBeGreaterThan(0);
    expect(runbook.approvalGate.approvers.length).toBeGreaterThan(0);
  });

  it('Model Retraining step has rollbackOnFailure=true', () => {
    const retrain = runbook.steps.find((s) => s.name === 'Model Retraining');
    expect(retrain).toBeDefined();
    expect(retrain!.rollbackOnFailure).toBe(true);
  });
});
