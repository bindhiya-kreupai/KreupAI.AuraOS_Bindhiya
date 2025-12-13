import { BankAccount, Transaction, Loan, WireTransfer, InsurancePolicy, InsuranceClaim, Portfolio, TradeOrder, FinancialPlan, ComplianceProgram, ComplianceAudit, RegulatoryReport, SanctionsScreening, TransactionMonitoring, FinancialSettings, FinancialAlert } from './types';

const STORAGE_KEYS = {
  BANK_ACCOUNTS: 'financial_bank_accounts', TRANSACTIONS: 'financial_transactions', LOANS: 'financial_loans', WIRE_TRANSFERS: 'financial_wire_transfers',
  INSURANCE_POLICIES: 'financial_insurance_policies', INSURANCE_CLAIMS: 'financial_insurance_claims', PORTFOLIOS: 'financial_portfolios',
  TRADE_ORDERS: 'financial_trade_orders', FINANCIAL_PLANS: 'financial_plans', COMPLIANCE_PROGRAMS: 'financial_compliance_programs',
  COMPLIANCE_AUDITS: 'financial_compliance_audits', REGULATORY_REPORTS: 'financial_regulatory_reports',
  SANCTIONS_SCREENING: 'financial_sanctions_screening', TRANSACTION_MONITORING: 'financial_transaction_monitoring',
  SETTINGS: 'financial_settings', ALERTS: 'financial_alerts',
};

export class BankingService {
  static async getAllAccounts(): Promise<BankAccount[]> { const data = localStorage.getItem(STORAGE_KEYS.BANK_ACCOUNTS); return data ? JSON.parse(data) : []; }
  static async getAccountById(accountId: string): Promise<BankAccount | null> { const accounts = await this.getAllAccounts(); return accounts.find(a => a.accountId === accountId) || null; }
  static async createAccount(accountData: Partial<BankAccount>): Promise<BankAccount> {
    const accounts = await this.getAllAccounts();
    const newAccount: BankAccount = { accountId: 'acct-' + Date.now(), accountNumber: accountData.accountNumber || String(Math.floor(Math.random() * 10000000000)), accountType: accountData.accountType || 'checking', customerId: accountData.customerId || '', customerName: accountData.customerName || '', balance: accountData.balance || { current: 0, available: 0, pending: 0, hold: 0, currency: 'USD' }, status: accountData.status || 'active', openDate: accountData.openDate || new Date().toISOString().split('T')[0], fees: accountData.fees || [], features: accountData.features || [], linkedAccounts: accountData.linkedAccounts || [], alerts: accountData.alerts || [], createdAt: new Date().toISOString(), ...accountData };
    accounts.push(newAccount); localStorage.setItem(STORAGE_KEYS.BANK_ACCOUNTS, JSON.stringify(accounts)); return newAccount;
  }
  static async updateAccount(accountId: string, updates: Partial<BankAccount>): Promise<BankAccount> {
    const accounts = await this.getAllAccounts(); const index = accounts.findIndex(a => a.accountId === accountId);
    if (index === -1) throw new Error('Account not found');
    accounts[index] = { ...accounts[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.BANK_ACCOUNTS, JSON.stringify(accounts)); return accounts[index];
  }
  static async getAllTransactions(): Promise<Transaction[]> { const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS); return data ? JSON.parse(data) : []; }
  static async getAccountTransactions(accountId: string): Promise<Transaction[]> { const transactions = await this.getAllTransactions(); return transactions.filter(t => t.accountId === accountId); }
  static async createTransaction(transactionData: Partial<Transaction>): Promise<Transaction> {
    const transactions = await this.getAllTransactions();
    const newTransaction: Transaction = { transactionId: 'txn-' + Date.now(), accountId: transactionData.accountId || '', transactionType: transactionData.transactionType || 'deposit', amount: transactionData.amount || 0, currency: transactionData.currency || 'USD', description: transactionData.description || '', date: transactionData.date || new Date().toISOString(), postDate: transactionData.postDate || new Date().toISOString(), status: transactionData.status || 'completed', metadata: transactionData.metadata || { channel: 'online' }, createdAt: new Date().toISOString(), ...transactionData };
    transactions.push(newTransaction); localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions)); return newTransaction;
  }
  static async getAllLoans(): Promise<Loan[]> { const data = localStorage.getItem(STORAGE_KEYS.LOANS); return data ? JSON.parse(data) : []; }
  static async createLoan(loanData: Partial<Loan>): Promise<Loan> {
    const loans = await this.getAllLoans();
    const newLoan: Loan = { loanId: 'loan-' + Date.now(), loanNumber: loanData.loanNumber || 'LN-' + Date.now(), loanType: loanData.loanType || 'personal', customerId: loanData.customerId || '', customerName: loanData.customerName || '', principal: loanData.principal || 0, currentBalance: loanData.currentBalance || loanData.principal || 0, interestRate: loanData.interestRate || 0, term: loanData.term || {} as any, payment: loanData.payment || {} as any, status: loanData.status || 'applied', applicationDate: loanData.applicationDate || new Date().toISOString().split('T')[0], documents: loanData.documents || [], createdAt: new Date().toISOString(), ...loanData };
    loans.push(newLoan); localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans)); return newLoan;
  }
  static async updateLoan(loanId: string, updates: Partial<Loan>): Promise<Loan> {
    const loans = await this.getAllLoans(); const index = loans.findIndex(l => l.loanId === loanId);
    if (index === -1) throw new Error('Loan not found');
    loans[index] = { ...loans[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans)); return loans[index];
  }
}

export class InsuranceService {
  static async getAllPolicies(): Promise<InsurancePolicy[]> { const data = localStorage.getItem(STORAGE_KEYS.INSURANCE_POLICIES); return data ? JSON.parse(data) : []; }
  static async createPolicy(policyData: Partial<InsurancePolicy>): Promise<InsurancePolicy> {
    const policies = await this.getAllPolicies();
    const newPolicy: InsurancePolicy = { policyId: 'pol-' + Date.now(), policyNumber: policyData.policyNumber || 'POL-' + Date.now(), policyType: policyData.policyType || 'auto', policyHolder: policyData.policyHolder || {} as any, coverage: policyData.coverage || {} as any, premium: policyData.premium || {} as any, beneficiaries: policyData.beneficiaries || [], status: policyData.status || 'active', effectiveDate: policyData.effectiveDate || new Date().toISOString().split('T')[0], expirationDate: policyData.expirationDate || '', claims: policyData.claims || [], documents: policyData.documents || [], createdAt: new Date().toISOString(), ...policyData };
    policies.push(newPolicy); localStorage.setItem(STORAGE_KEYS.INSURANCE_POLICIES, JSON.stringify(policies)); return newPolicy;
  }
  static async updatePolicy(policyId: string, updates: Partial<InsurancePolicy>): Promise<InsurancePolicy> {
    const policies = await this.getAllPolicies(); const index = policies.findIndex(p => p.policyId === policyId);
    if (index === -1) throw new Error('Policy not found');
    policies[index] = { ...policies[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.INSURANCE_POLICIES, JSON.stringify(policies)); return policies[index];
  }
  static async getAllClaims(): Promise<InsuranceClaim[]> { const data = localStorage.getItem(STORAGE_KEYS.INSURANCE_CLAIMS); return data ? JSON.parse(data) : []; }
  static async createClaim(claimData: Partial<InsuranceClaim>): Promise<InsuranceClaim> {
    const claims = await this.getAllClaims();
    const newClaim: InsuranceClaim = { claimId: 'claim-' + Date.now(), claimNumber: claimData.claimNumber || 'CLM-' + Date.now(), policyId: claimData.policyId || '', claimType: claimData.claimType || 'auto', claimant: claimData.claimant || {} as any, incident: claimData.incident || {} as any, claimAmount: claimData.claimAmount || 0, status: claimData.status || 'reported', filedDate: claimData.filedDate || new Date().toISOString().split('T')[0], investigation: claimData.investigation || { investigationStatus: 'pending', findings: [], fraudIndicators: [], recommendation: 'further_investigation' }, documents: claimData.documents || [], timeline: claimData.timeline || [], communications: claimData.communications || [], createdAt: new Date().toISOString(), ...claimData };
    claims.push(newClaim); localStorage.setItem(STORAGE_KEYS.INSURANCE_CLAIMS, JSON.stringify(claims)); return newClaim;
  }
  static async updateClaim(claimId: string, updates: Partial<InsuranceClaim>): Promise<InsuranceClaim> {
    const claims = await this.getAllClaims(); const index = claims.findIndex(c => c.claimId === claimId);
    if (index === -1) throw new Error('Claim not found');
    claims[index] = { ...claims[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.INSURANCE_CLAIMS, JSON.stringify(claims)); return claims[index];
  }
}

export class WealthManagementService {
  static async getAllPortfolios(): Promise<Portfolio[]> { const data = localStorage.getItem(STORAGE_KEYS.PORTFOLIOS); return data ? JSON.parse(data) : []; }
  static async createPortfolio(portfolioData: Partial<Portfolio>): Promise<Portfolio> {
    const portfolios = await this.getAllPortfolios();
    const newPortfolio: Portfolio = { portfolioId: 'port-' + Date.now(), portfolioName: portfolioData.portfolioName || '', clientId: portfolioData.clientId || '', clientName: portfolioData.clientName || '', totalValue: portfolioData.totalValue || 0, cashBalance: portfolioData.cashBalance || 0, investedAmount: portfolioData.investedAmount || 0, unrealizedGainLoss: portfolioData.unrealizedGainLoss || 0, realizedGainLoss: portfolioData.realizedGainLoss || 0, allocation: portfolioData.allocation || [], holdings: portfolioData.holdings || [], performance: portfolioData.performance || {} as any, riskProfile: portfolioData.riskProfile || {} as any, status: portfolioData.status || 'active', inceptionDate: portfolioData.inceptionDate || new Date().toISOString().split('T')[0], createdAt: new Date().toISOString(), ...portfolioData };
    portfolios.push(newPortfolio); localStorage.setItem(STORAGE_KEYS.PORTFOLIOS, JSON.stringify(portfolios)); return newPortfolio;
  }
  static async updatePortfolio(portfolioId: string, updates: Partial<Portfolio>): Promise<Portfolio> {
    const portfolios = await this.getAllPortfolios(); const index = portfolios.findIndex(p => p.portfolioId === portfolioId);
    if (index === -1) throw new Error('Portfolio not found');
    portfolios[index] = { ...portfolios[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.PORTFOLIOS, JSON.stringify(portfolios)); return portfolios[index];
  }
  static async getAllTradeOrders(): Promise<TradeOrder[]> { const data = localStorage.getItem(STORAGE_KEYS.TRADE_ORDERS); return data ? JSON.parse(data) : []; }
  static async createTradeOrder(orderData: Partial<TradeOrder>): Promise<TradeOrder> {
    const orders = await this.getAllTradeOrders();
    const newOrder: TradeOrder = { orderId: 'order-' + Date.now(), portfolioId: orderData.portfolioId || '', orderType: orderData.orderType || 'market', action: orderData.action || 'buy', symbol: orderData.symbol || '', quantity: orderData.quantity || 0, filledQuantity: orderData.filledQuantity || 0, commission: orderData.commission || 0, status: orderData.status || 'pending', placedDate: orderData.placedDate || new Date().toISOString(), createdAt: new Date().toISOString(), ...orderData };
    orders.push(newOrder); localStorage.setItem(STORAGE_KEYS.TRADE_ORDERS, JSON.stringify(orders)); return newOrder;
  }
}

export class RegulatoryComplianceService {
  static async getAllCompliancePrograms(): Promise<ComplianceProgram[]> { const data = localStorage.getItem(STORAGE_KEYS.COMPLIANCE_PROGRAMS); return data ? JSON.parse(data) : []; }
  static async createComplianceProgram(programData: Partial<ComplianceProgram>): Promise<ComplianceProgram> {
    const programs = await this.getAllCompliancePrograms();
    const newProgram: ComplianceProgram = { programId: 'prog-' + Date.now(), programName: programData.programName || '', complianceArea: programData.complianceArea || 'kyc', policies: programData.policies || [], procedures: programData.procedures || [], controls: programData.controls || [], training: programData.training || [], audits: programData.audits || [], status: programData.status || 'compliant', lastReviewDate: programData.lastReviewDate || new Date().toISOString().split('T')[0], nextReviewDate: programData.nextReviewDate || '', responsibleOfficer: programData.responsibleOfficer || '', createdAt: new Date().toISOString(), ...programData };
    programs.push(newProgram); localStorage.setItem(STORAGE_KEYS.COMPLIANCE_PROGRAMS, JSON.stringify(programs)); return newProgram;
  }
  static async updateComplianceProgram(programId: string, updates: Partial<ComplianceProgram>): Promise<ComplianceProgram> {
    const programs = await this.getAllCompliancePrograms(); const index = programs.findIndex(p => p.programId === programId);
    if (index === -1) throw new Error('Program not found');
    programs[index] = { ...programs[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.COMPLIANCE_PROGRAMS, JSON.stringify(programs)); return programs[index];
  }
  static async getAllComplianceAudits(): Promise<ComplianceAudit[]> { const data = localStorage.getItem(STORAGE_KEYS.COMPLIANCE_AUDITS); return data ? JSON.parse(data) : []; }
  static async createComplianceAudit(auditData: Partial<ComplianceAudit>): Promise<ComplianceAudit> {
    const audits = await this.getAllComplianceAudits();
    const newAudit: ComplianceAudit = { auditId: 'audit-' + Date.now(), auditName: auditData.auditName || '', auditType: auditData.auditType || 'internal', scope: auditData.scope || [], auditor: auditData.auditor || {} as any, scheduledDate: auditData.scheduledDate || new Date().toISOString().split('T')[0], status: auditData.status || 'scheduled', findings: auditData.findings || [], overallRating: auditData.overallRating || 'satisfactory', createdAt: new Date().toISOString(), ...auditData };
    audits.push(newAudit); localStorage.setItem(STORAGE_KEYS.COMPLIANCE_AUDITS, JSON.stringify(audits)); return newAudit;
  }
}

export class FinancialSettingsService {
  static async getSettings(): Promise<FinancialSettings | null> { const data = localStorage.getItem(STORAGE_KEYS.SETTINGS); return data ? JSON.parse(data) : null; }
  static async updateSettings(settings: Partial<FinancialSettings>): Promise<FinancialSettings> {
    const currentSettings = await this.getSettings();
    const updatedSettings: FinancialSettings = { ...currentSettings, ...settings, updatedAt: new Date().toISOString() } as FinancialSettings;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings)); return updatedSettings;
  }
}

export class AlertsService {
  static async getAllAlerts(): Promise<FinancialAlert[]> { const data = localStorage.getItem(STORAGE_KEYS.ALERTS); return data ? JSON.parse(data) : []; }
  static async createAlert(alertData: Partial<FinancialAlert>): Promise<FinancialAlert> {
    const alerts = await this.getAllAlerts();
    const newAlert: FinancialAlert = { alertId: 'alert-' + Date.now(), alertType: alertData.alertType || 'transaction', severity: alertData.severity || 'medium', title: alertData.title || '', message: alertData.message || '', affectedEntity: alertData.affectedEntity || {} as any, status: alertData.status || 'active', createdAt: new Date().toISOString(), ...alertData };
    alerts.push(newAlert); localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts)); return newAlert;
  }
  static async updateAlert(alertId: string, updates: Partial<FinancialAlert>): Promise<FinancialAlert> {
    const alerts = await this.getAllAlerts(); const index = alerts.findIndex(a => a.alertId === alertId);
    if (index === -1) throw new Error('Alert not found');
    alerts[index] = { ...alerts[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts)); return alerts[index];
  }
}
