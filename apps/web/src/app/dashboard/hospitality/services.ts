import { TipPool, Event, HousekeepingTask, HospitalitySettings, HospitalityAlert } from './types';
const STORAGE_KEYS = { TIP_POOLS: 'hospitality_tip_pools', EVENTS: 'hospitality_events', TASKS: 'hospitality_tasks', SETTINGS: 'hospitality_settings', ALERTS: 'hospitality_alerts' };
export class TipManagementService {
  static async getAllTipPools(): Promise<TipPool[]> { const data = localStorage.getItem(STORAGE_KEYS.TIP_POOLS); return data ? JSON.parse(data) : []; }
  static async createTipPool(data: Partial<TipPool>): Promise<TipPool> {
    const pools = await this.getAllTipPools();
    const newPool: TipPool = { poolId: 'pool-' + Date.now(), poolName: data.poolName || '', date: data.date || new Date().toISOString().split('T')[0], totalAmount: data.totalAmount || 0, distributionMethod: data.distributionMethod || 'hours_based', participants: data.participants || [], distributions: data.distributions || [], status: data.status || 'open', createdAt: new Date().toISOString(), ...data };
    pools.push(newPool); localStorage.setItem(STORAGE_KEYS.TIP_POOLS, JSON.stringify(pools)); return newPool;
  }
  static async updateTipPool(poolId: string, updates: Partial<TipPool>): Promise<TipPool> {
    const pools = await this.getAllTipPools(); const index = pools.findIndex(p => p.poolId === poolId);
    if (index === -1) throw new Error('Tip pool not found');
    pools[index] = { ...pools[index], ...updates }; localStorage.setItem(STORAGE_KEYS.TIP_POOLS, JSON.stringify(pools)); return pools[index];
  }
}
export class EventStaffingService {
  static async getAllEvents(): Promise<Event[]> { const data = localStorage.getItem(STORAGE_KEYS.EVENTS); return data ? JSON.parse(data) : []; }
  static async createEvent(data: Partial<Event>): Promise<Event> {
    const events = await this.getAllEvents();
    const newEvent: Event = { eventId: 'event-' + Date.now(), eventName: data.eventName || '', eventType: data.eventType || '', eventDate: data.eventDate || '', startTime: data.startTime || '', endTime: data.endTime || '', venue: data.venue || '', expectedGuests: data.expectedGuests || 0, staffingPlan: data.staffingPlan || {} as any, budget: data.budget || 0, status: data.status || 'planning', createdAt: new Date().toISOString(), ...data };
    events.push(newEvent); localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events)); return newEvent;
  }
  static async updateEvent(eventId: string, updates: Partial<Event>): Promise<Event> {
    const events = await this.getAllEvents(); const index = events.findIndex(e => e.eventId === eventId);
    if (index === -1) throw new Error('Event not found');
    events[index] = { ...events[index], ...updates }; localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events)); return events[index];
  }
}
export class HousekeepingService {
  static async getAllTasks(): Promise<HousekeepingTask[]> { const data = localStorage.getItem(STORAGE_KEYS.TASKS); return data ? JSON.parse(data) : []; }
  static async createTask(data: Partial<HousekeepingTask>): Promise<HousekeepingTask> {
    const tasks = await this.getAllTasks();
    const newTask: HousekeepingTask = { taskId: 'task-' + Date.now(), roomNumber: data.roomNumber || '', roomType: data.roomType || '', taskType: data.taskType || 'clean', priority: data.priority || 'medium', status: data.status || 'vacant_dirty', scheduledTime: data.scheduledTime || new Date().toISOString(), createdAt: new Date().toISOString(), ...data };
    tasks.push(newTask); localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks)); return newTask;
  }
  static async updateTask(taskId: string, updates: Partial<HousekeepingTask>): Promise<HousekeepingTask> {
    const tasks = await this.getAllTasks(); const index = tasks.findIndex(t => t.taskId === taskId);
    if (index === -1) throw new Error('Task not found');
    tasks[index] = { ...tasks[index], ...updates }; localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks)); return tasks[index];
  }
}
export class HospitalitySettingsService {
  static async getSettings(): Promise<HospitalitySettings | null> { const data = localStorage.getItem(STORAGE_KEYS.SETTINGS); return data ? JSON.parse(data) : null; }
  static async updateSettings(settings: Partial<HospitalitySettings>): Promise<HospitalitySettings> {
    const current = await this.getSettings(); const updated: HospitalitySettings = { ...current, ...settings, updatedAt: new Date().toISOString() } as HospitalitySettings;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated)); return updated;
  }
}
export class AlertsService {
  static async getAllAlerts(): Promise<HospitalityAlert[]> { const data = localStorage.getItem(STORAGE_KEYS.ALERTS); return data ? JSON.parse(data) : []; }
  static async createAlert(data: Partial<HospitalityAlert>): Promise<HospitalityAlert> {
    const alerts = await this.getAllAlerts();
    const newAlert: HospitalityAlert = { alertId: 'alert-' + Date.now(), alertType: data.alertType || 'tip_pool', severity: data.severity || 'medium', title: data.title || '', message: data.message || '', status: data.status || 'active', createdAt: new Date().toISOString(), ...data };
    alerts.push(newAlert); localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts)); return newAlert;
  }
}
