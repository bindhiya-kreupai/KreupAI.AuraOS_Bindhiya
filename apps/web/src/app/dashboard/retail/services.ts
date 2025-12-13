import { Store, CommissionPlan, SalesCommission, SeasonalHire, RetailSettings, RetailAlert } from './types';
const STORAGE_KEYS = { STORES: 'retail_stores', COMMISSION_PLANS: 'retail_commission_plans', SALES_COMMISSIONS: 'retail_sales_commissions', SEASONAL_HIRES: 'retail_seasonal_hires', SETTINGS: 'retail_settings', ALERTS: 'retail_alerts' };
export class StoreOperationsService {
  static async getAllStores(): Promise<Store[]> { const data = localStorage.getItem(STORAGE_KEYS.STORES); return data ? JSON.parse(data) : []; }
  static async createStore(data: Partial<Store>): Promise<Store> {
    const stores = await this.getAllStores();
    const newStore: Store = { storeId: 'store-' + Date.now(), storeNumber: data.storeNumber || 'STR-' + Date.now(), storeName: data.storeName || '', location: data.location || {} as any, manager: data.manager || '', employees: data.employees || 0, status: data.status || 'open', operatingHours: data.operatingHours || {} as any, performance: data.performance || {} as any, createdAt: new Date().toISOString(), ...data };
    stores.push(newStore); localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(stores)); return newStore;
  }
  static async updateStore(storeId: string, updates: Partial<Store>): Promise<Store> {
    const stores = await this.getAllStores(); const index = stores.findIndex(s => s.storeId === storeId);
    if (index === -1) throw new Error('Store not found');
    stores[index] = { ...stores[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(stores)); return stores[index];
  }
}
export class CommissionService {
  static async getAllPlans(): Promise<CommissionPlan[]> { const data = localStorage.getItem(STORAGE_KEYS.COMMISSION_PLANS); return data ? JSON.parse(data) : []; }
  static async createPlan(data: Partial<CommissionPlan>): Promise<CommissionPlan> {
    const plans = await this.getAllPlans();
    const newPlan: CommissionPlan = { planId: 'plan-' + Date.now(), planName: data.planName || '', planType: data.planType || 'tiered', applicableRoles: data.applicableRoles || [], tiers: data.tiers || [], bonus: data.bonus || {} as any, effectiveDate: data.effectiveDate || new Date().toISOString().split('T')[0], status: data.status || 'active', createdAt: new Date().toISOString(), ...data };
    plans.push(newPlan); localStorage.setItem(STORAGE_KEYS.COMMISSION_PLANS, JSON.stringify(plans)); return newPlan;
  }
  static async getAllCommissions(): Promise<SalesCommission[]> { const data = localStorage.getItem(STORAGE_KEYS.SALES_COMMISSIONS); return data ? JSON.parse(data) : []; }
  static async createCommission(data: Partial<SalesCommission>): Promise<SalesCommission> {
    const commissions = await this.getAllCommissions();
    const newCommission: SalesCommission = { commissionId: 'comm-' + Date.now(), employeeId: data.employeeId || '', employeeName: data.employeeName || '', period: data.period || {} as any, totalSales: data.totalSales || 0, commissionableAmount: data.commissionableAmount || 0, commissionRate: data.commissionRate || 0, commissionEarned: data.commissionEarned || 0, bonusEarned: data.bonusEarned || 0, totalEarnings: data.totalEarnings || 0, status: data.status || 'pending', createdAt: new Date().toISOString(), ...data };
    commissions.push(newCommission); localStorage.setItem(STORAGE_KEYS.SALES_COMMISSIONS, JSON.stringify(commissions)); return newCommission;
  }
  static async updateCommission(commissionId: string, updates: Partial<SalesCommission>): Promise<SalesCommission> {
    const commissions = await this.getAllCommissions(); const index = commissions.findIndex(c => c.commissionId === commissionId);
    if (index === -1) throw new Error('Commission not found');
    commissions[index] = { ...commissions[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.SALES_COMMISSIONS, JSON.stringify(commissions)); return commissions[index];
  }
}
export class SeasonalHiringService {
  static async getAllHires(): Promise<SeasonalHire[]> { const data = localStorage.getItem(STORAGE_KEYS.SEASONAL_HIRES); return data ? JSON.parse(data) : []; }
  static async createHire(data: Partial<SeasonalHire>): Promise<SeasonalHire> {
    const hires = await this.getAllHires();
    const newHire: SeasonalHire = { hireId: 'hire-' + Date.now(), applicantName: data.applicantName || '', email: data.email || '', phone: data.phone || '', position: data.position || '', storeId: data.storeId || '', storeName: data.storeName || '', seasonPeriod: data.seasonPeriod || {} as any, availability: data.availability || [], experience: data.experience || 0, status: data.status || 'applied', createdAt: new Date().toISOString(), ...data };
    hires.push(newHire); localStorage.setItem(STORAGE_KEYS.SEASONAL_HIRES, JSON.stringify(hires)); return newHire;
  }
  static async updateHire(hireId: string, updates: Partial<SeasonalHire>): Promise<SeasonalHire> {
    const hires = await this.getAllHires(); const index = hires.findIndex(h => h.hireId === hireId);
    if (index === -1) throw new Error('Hire not found');
    hires[index] = { ...hires[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.SEASONAL_HIRES, JSON.stringify(hires)); return hires[index];
  }
}
export class RetailSettingsService {
  static async getSettings(): Promise<RetailSettings | null> { const data = localStorage.getItem(STORAGE_KEYS.SETTINGS); return data ? JSON.parse(data) : null; }
  static async updateSettings(settings: Partial<RetailSettings>): Promise<RetailSettings> {
    const current = await this.getSettings(); const updated: RetailSettings = { ...current, ...settings, updatedAt: new Date().toISOString() } as RetailSettings;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated)); return updated;
  }
}
