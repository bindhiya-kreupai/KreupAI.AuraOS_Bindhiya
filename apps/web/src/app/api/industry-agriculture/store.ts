import { promises as fs } from 'fs';
import path from 'path';

const STORE_PATH = path.join(process.cwd(), 'apps', 'web', 'data', 'agriculture-store.json');

async function ensureStore() {
  try {
    await fs.access(STORE_PATH);
  } catch (e) {
    await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
    await fs.writeFile(
      STORE_PATH,
      JSON.stringify(
        {
          workers: [],
          pools: [],
          facilities: [],
          assignments: [],
          inspections: [],
          cycles: [],
          schedules: [],
          analytics: {},
          settings: {},
        },
        null,
        2
      )
    );
  }
}

async function readStore() {
  await ensureStore();
  const raw = await fs.readFile(STORE_PATH, 'utf-8');
  return JSON.parse(raw);
}

async function writeStore(data: any) {
  await ensureStore();
  await fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function genId(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeSearchTerm(value: unknown) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export async function seedIfEmpty() {
  const store = await readStore();

  if (
    process.env.NODE_ENV === 'production' ||
    (Array.isArray(store.workers) && store.workers.length > 0)
  ) {
    return;
  }

  try {
    const samples = await import('../../dashboard/agriculture/data');
    store.workers = samples.sampleSeasonalWorkers || [];
    store.pools = samples.sampleLaborPools || [];
    store.facilities = samples.sampleHousingFacilities || [];
    store.assignments = samples.sampleHousingAssignments || [];
    store.inspections = samples.sampleHousingInspections || [];
    store.cycles = samples.sampleCropCycles || [];
    store.schedules = samples.sampleHarvestSchedules || [];
    store.analytics = samples.sampleAgricultureAnalytics || {};
    store.settings = samples.sampleAgricultureSettings || {};
    await writeStore(store);
  } catch (e) {
    // ignore missing sample data
  }
}

// -----------------------------------------------------------------------------
// Seasonal labor
// -----------------------------------------------------------------------------
export async function getWorkers() {
  await seedIfEmpty();
  const store = await readStore();
  return store.workers || [];
}

export async function getWorkerById(id: string) {
  const workers = await getWorkers();
  return workers.find((w: any) => w.workerId === id || w.id === id) || null;
}

export async function searchWorkers(filters: {
  query?: string;
  status?: string;
  seasonType?: string;
  skills?: string[];
}) {
  const workers = await getWorkers();
  return workers.filter((worker: any) => {
    const query = normalizeSearchTerm(filters.query);
    const status = normalizeSearchTerm(filters.status);
    const seasonType = normalizeSearchTerm(filters.seasonType);
    const skills = (filters.skills || []).map(normalizeSearchTerm).filter(Boolean);

    const matchesQuery =
      !query ||
      normalizeSearchTerm(worker.fullName).includes(query) ||
      normalizeSearchTerm(worker.nationality).includes(query) ||
      normalizeSearchTerm(worker.employeeId).includes(query) ||
      normalizeSearchTerm(worker.phone).includes(query) ||
      normalizeSearchTerm(worker.email).includes(query);

    const matchesStatus = !status || normalizeSearchTerm(worker.status).includes(status);
    const matchesSeason =
      !seasonType || normalizeSearchTerm(worker.seasonType).includes(seasonType);
    const matchesSkills =
      skills.length === 0 ||
      skills.every((skill) =>
        Array.isArray(worker.skills)
          ? worker.skills.some((item: string) => normalizeSearchTerm(item).includes(skill))
          : false
      );

    return matchesQuery && matchesStatus && matchesSeason && matchesSkills;
  });
}

export async function createWorker(payload: any) {
  const store = await readStore();
  const id = payload.workerId || genId('worker');
  const worker = {
    ...payload,
    workerId: id,
    createdDate: new Date().toISOString(),
    lastUpdatedDate: new Date().toISOString(),
  };
  store.workers = store.workers || [];
  store.workers.push(worker);
  await writeStore(store);
  return worker;
}

export async function updateWorker(id: string, updates: any) {
  const store = await readStore();
  store.workers = store.workers || [];
  const idx = store.workers.findIndex((w: any) => w.workerId === id || w.id === id);
  if (idx === -1) return null;
  store.workers[idx] = {
    ...store.workers[idx],
    ...updates,
    lastUpdatedDate: new Date().toISOString(),
  };
  await writeStore(store);
  return store.workers[idx];
}

export async function deleteWorker(id: string) {
  const store = await readStore();
  store.workers = store.workers || [];
  const idx = store.workers.findIndex((w: any) => w.workerId === id || w.id === id);
  if (idx === -1) return false;
  store.workers.splice(idx, 1);
  await writeStore(store);
  return true;
}

export async function assignWorker(workerId: string, assignment: any) {
  const worker = await getWorkerById(workerId);
  if (!worker) return null;
  const updatedAssignment = {
    ...assignment,
    assignmentId: assignment.assignmentId || genId('assignment'),
    workerId,
    workerName: worker.fullName || worker.workerName || 'Unknown',
  };

  const store = await readStore();
  store.workers = store.workers || [];
  const idx = store.workers.findIndex((w: any) => w.workerId === workerId || w.id === workerId);
  if (idx === -1) return null;

  const previousAssignments = store.workers[idx].assignmentHistory || [];
  store.workers[idx].assignmentHistory = [...previousAssignments, updatedAssignment];
  store.workers[idx].currentAssignment = updatedAssignment;
  store.workers[idx].lastUpdatedDate = new Date().toISOString();
  await writeStore(store);
  return store.workers[idx];
}

export async function getLaborPools() {
  await seedIfEmpty();
  const store = await readStore();
  return store.pools || [];
}

export async function createLaborPool(payload: any) {
  const store = await readStore();
  const id = payload.poolId || genId('pool');
  const pool = {
    ...payload,
    poolId: id,
    createdDate: new Date().toISOString(),
  };
  store.pools = store.pools || [];
  store.pools.push(pool);
  await writeStore(store);
  return pool;
}

// -----------------------------------------------------------------------------
// Housing management
// -----------------------------------------------------------------------------
export async function getFacilities() {
  await seedIfEmpty();
  const store = await readStore();
  return store.facilities || [];
}

export async function getFacilityById(id: string) {
  const facilities = await getFacilities();
  return facilities.find((f: any) => f.facilityId === id || f.id === id) || null;
}

export async function createFacility(payload: any) {
  const store = await readStore();
  const id = payload.facilityId || genId('facility');
  const facility = {
    ...payload,
    facilityId: id,
    createdDate: new Date().toISOString(),
    lastUpdatedDate: new Date().toISOString(),
  };
  store.facilities = store.facilities || [];
  store.facilities.push(facility);
  await writeStore(store);
  return facility;
}

export async function updateFacility(id: string, updates: any) {
  const store = await readStore();
  store.facilities = store.facilities || [];
  const idx = store.facilities.findIndex((f: any) => f.facilityId === id || f.id === id);
  if (idx === -1) return null;
  store.facilities[idx] = {
    ...store.facilities[idx],
    ...updates,
    lastUpdatedDate: new Date().toISOString(),
  };
  await writeStore(store);
  return store.facilities[idx];
}

export async function deleteFacility(id: string) {
  const store = await readStore();
  store.facilities = store.facilities || [];
  const idx = store.facilities.findIndex((f: any) => f.facilityId === id || f.id === id);
  if (idx === -1) return false;
  store.facilities.splice(idx, 1);
  await writeStore(store);
  return true;
}

export async function getAssignments() {
  await seedIfEmpty();
  const store = await readStore();
  return store.assignments || [];
}

export async function createAssignment(payload: any) {
  const store = await readStore();
  const id = payload.assignmentId || genId('housing');
  const assignment = {
    ...payload,
    assignmentId: id,
    createdDate: new Date().toISOString(),
    lastUpdatedDate: new Date().toISOString(),
  };
  store.assignments = store.assignments || [];
  store.assignments.push(assignment);
  await writeStore(store);
  return assignment;
}

export async function checkOutAssignment(id: string, checkoutData: any) {
  const store = await readStore();
  store.assignments = store.assignments || [];
  const idx = store.assignments.findIndex(
    (assignment: any) => assignment.assignmentId === id || assignment.id === id
  );
  if (idx === -1) return null;
  store.assignments[idx] = {
    ...store.assignments[idx],
    status: 'completed',
    checkoutCondition: checkoutData,
    lastUpdatedDate: new Date().toISOString(),
  };
  await writeStore(store);
  return store.assignments[idx];
}

export async function getInspections() {
  await seedIfEmpty();
  const store = await readStore();
  return store.inspections || [];
}

export async function createInspection(payload: any) {
  const store = await readStore();
  const id = payload.inspectionId || genId('inspection');
  const inspection = {
    ...payload,
    inspectionId: id,
    createdDate: new Date().toISOString(),
    lastUpdatedDate: new Date().toISOString(),
  };
  store.inspections = store.inspections || [];
  store.inspections.push(inspection);
  await writeStore(store);
  return inspection;
}

// -----------------------------------------------------------------------------
// Crop cycles
// -----------------------------------------------------------------------------
export async function getCropCycles() {
  await seedIfEmpty();
  const store = await readStore();
  return store.cycles || [];
}

export async function getCropCycleById(id: string) {
  const cycles = await getCropCycles();
  return cycles.find((cycle: any) => cycle.cycleId === id || cycle.id === id) || null;
}

export async function createCropCycle(payload: any) {
  const store = await readStore();
  const id = payload.cycleId || genId('cycle');
  const cycle = {
    ...payload,
    cycleId: id,
    createdDate: new Date().toISOString(),
    lastUpdatedDate: new Date().toISOString(),
  };
  store.cycles = store.cycles || [];
  store.cycles.push(cycle);
  await writeStore(store);
  return cycle;
}

export async function updateCropCycle(id: string, updates: any) {
  const store = await readStore();
  store.cycles = store.cycles || [];
  const idx = store.cycles.findIndex((cycle: any) => cycle.cycleId === id || cycle.id === id);
  if (idx === -1) return null;
  store.cycles[idx] = {
    ...store.cycles[idx],
    ...updates,
    lastUpdatedDate: new Date().toISOString(),
  };
  await writeStore(store);
  return store.cycles[idx];
}

export async function deleteCropCycle(id: string) {
  const store = await readStore();
  store.cycles = store.cycles || [];
  const idx = store.cycles.findIndex((cycle: any) => cycle.cycleId === id || cycle.id === id);
  if (idx === -1) return false;
  store.cycles.splice(idx, 1);
  await writeStore(store);
  return true;
}

export async function updateCropStage(id: string, stage: any) {
  const store = await readStore();
  store.cycles = store.cycles || [];
  const idx = store.cycles.findIndex((cycle: any) => cycle.cycleId === id || cycle.id === id);
  if (idx === -1) return null;
  store.cycles[idx] = {
    ...store.cycles[idx],
    currentStage: stage,
    lastUpdatedDate: new Date().toISOString(),
  };
  await writeStore(store);
  return store.cycles[idx];
}

export async function getHarvestSchedules() {
  await seedIfEmpty();
  const store = await readStore();
  return store.schedules || [];
}

export async function createHarvestSchedule(payload: any) {
  const store = await readStore();
  const id = payload.scheduleId || genId('schedule');
  const schedule = {
    ...payload,
    scheduleId: id,
    createdDate: new Date().toISOString(),
    lastUpdatedDate: new Date().toISOString(),
  };
  store.schedules = store.schedules || [];
  store.schedules.push(schedule);
  await writeStore(store);
  return schedule;
}

// -----------------------------------------------------------------------------
// Analytics & settings
// -----------------------------------------------------------------------------
export async function getAnalytics() {
  await seedIfEmpty();
  const store = await readStore();
  return store.analytics || {};
}

export async function getSettings() {
  await seedIfEmpty();
  const store = await readStore();
  return store.settings || {};
}

export async function updateSettings(updates: any) {
  const store = await readStore();
  store.settings = {
    ...(store.settings || {}),
    ...updates,
    lastUpdatedDate: new Date().toISOString(),
  };
  await writeStore(store);
  return store.settings;
}

export default {
  getWorkers,
  getWorkerById,
  searchWorkers,
  createWorker,
  updateWorker,
  deleteWorker,
  assignWorker,
  getLaborPools,
  createLaborPool,
  getFacilities,
  getFacilityById,
  createFacility,
  updateFacility,
  deleteFacility,
  getAssignments,
  createAssignment,
  checkOutAssignment,
  getInspections,
  createInspection,
  getCropCycles,
  getCropCycleById,
  createCropCycle,
  updateCropCycle,
  deleteCropCycle,
  updateCropStage,
  getHarvestSchedules,
  createHarvestSchedule,
  getAnalytics,
  getSettings,
  updateSettings,
  seedIfEmpty,
};
