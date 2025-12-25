import { APIClient } from '@/lib/api-client';
import type { BankAccount, Transaction, Loan, InsurancePolicy, InsuranceClaim, Portfolio, TradeOrder, ComplianceProgram, ComplianceAudit, FinancialSettings, FinancialAlert } from './types';
import { WireTransfer, FinancialPlan, RegulatoryReport, SanctionsScreening, TransactionMonitoring } from './types';

export class BankingService {
  private static accountsEndpoint = '/financial-services/banking/accounts';
  private static transactionsEndpoint = '/financial-services/banking/transactions';
  private static loansEndpoint = '/financial-services/banking/loans';

  static async getAllAccounts(): Promise<BankAccount[]> {
    return APIClient.get<BankAccount[]>(this.accountsEndpoint);
  }

  static async getAccountById(accountId: string): Promise<BankAccount | null> {
    return APIClient.get<BankAccount>(`${this.accountsEndpoint}/${accountId}`);
  }

  static async createAccount(accountData: Partial<BankAccount>): Promise<BankAccount> {
    return APIClient.post<BankAccount>(this.accountsEndpoint, accountData);
  }

  static async updateAccount(accountId: string, updates: Partial<BankAccount>): Promise<BankAccount> {
    return APIClient.put<BankAccount>(`${this.accountsEndpoint}/${accountId}`, updates);
  }

  static async getAllTransactions(): Promise<Transaction[]> {
    return APIClient.get<Transaction[]>(this.transactionsEndpoint);
  }

  static async getAccountTransactions(accountId: string): Promise<Transaction[]> {
    return APIClient.get<Transaction[]>(this.transactionsEndpoint, { accountId });
  }

  static async createTransaction(transactionData: Partial<Transaction>): Promise<Transaction> {
    return APIClient.post<Transaction>(this.transactionsEndpoint, transactionData);
  }

  static async getAllLoans(): Promise<Loan[]> {
    return APIClient.get<Loan[]>(this.loansEndpoint);
  }

  static async createLoan(loanData: Partial<Loan>): Promise<Loan> {
    return APIClient.post<Loan>(this.loansEndpoint, loanData);
  }

  static async updateLoan(loanId: string, updates: Partial<Loan>): Promise<Loan> {
    return APIClient.put<Loan>(`${this.loansEndpoint}/${loanId}`, updates);
  }
}

export class InsuranceService {
  private static policiesEndpoint = '/financial-services/insurance/policies';
  private static claimsEndpoint = '/financial-services/insurance/claims';

  static async getAllPolicies(): Promise<InsurancePolicy[]> {
    return APIClient.get<InsurancePolicy[]>(this.policiesEndpoint);
  }

  static async createPolicy(policyData: Partial<InsurancePolicy>): Promise<InsurancePolicy> {
    return APIClient.post<InsurancePolicy>(this.policiesEndpoint, policyData);
  }

  static async updatePolicy(policyId: string, updates: Partial<InsurancePolicy>): Promise<InsurancePolicy> {
    return APIClient.put<InsurancePolicy>(`${this.policiesEndpoint}/${policyId}`, updates);
  }

  static async getAllClaims(): Promise<InsuranceClaim[]> {
    return APIClient.get<InsuranceClaim[]>(this.claimsEndpoint);
  }

  static async createClaim(claimData: Partial<InsuranceClaim>): Promise<InsuranceClaim> {
    return APIClient.post<InsuranceClaim>(this.claimsEndpoint, claimData);
  }

  static async updateClaim(claimId: string, updates: Partial<InsuranceClaim>): Promise<InsuranceClaim> {
    return APIClient.put<InsuranceClaim>(`${this.claimsEndpoint}/${claimId}`, updates);
  }
}

export class WealthManagementService {
  private static portfoliosEndpoint = '/financial-services/wealth/portfolios';
  private static ordersEndpoint = '/financial-services/wealth/orders';

  static async getAllPortfolios(): Promise<Portfolio[]> {
    return APIClient.get<Portfolio[]>(this.portfoliosEndpoint);
  }

  static async createPortfolio(portfolioData: Partial<Portfolio>): Promise<Portfolio> {
    return APIClient.post<Portfolio>(this.portfoliosEndpoint, portfolioData);
  }

  static async updatePortfolio(portfolioId: string, updates: Partial<Portfolio>): Promise<Portfolio> {
    return APIClient.put<Portfolio>(`${this.portfoliosEndpoint}/${portfolioId}`, updates);
  }

  static async getAllTradeOrders(): Promise<TradeOrder[]> {
    return APIClient.get<TradeOrder[]>(this.ordersEndpoint);
  }

  static async createTradeOrder(orderData: Partial<TradeOrder>): Promise<TradeOrder> {
    return APIClient.post<TradeOrder>(this.ordersEndpoint, orderData);
  }
}

export class RegulatoryComplianceService {
  private static programsEndpoint = '/financial-services/compliance/programs';
  private static auditsEndpoint = '/financial-services/compliance/audits';

  static async getAllCompliancePrograms(): Promise<ComplianceProgram[]> {
    return APIClient.get<ComplianceProgram[]>(this.programsEndpoint);
  }

  static async createComplianceProgram(programData: Partial<ComplianceProgram>): Promise<ComplianceProgram> {
    return APIClient.post<ComplianceProgram>(this.programsEndpoint, programData);
  }

  static async updateComplianceProgram(programId: string, updates: Partial<ComplianceProgram>): Promise<ComplianceProgram> {
    return APIClient.put<ComplianceProgram>(`${this.programsEndpoint}/${programId}`, updates);
  }

  static async getAllComplianceAudits(): Promise<ComplianceAudit[]> {
    return APIClient.get<ComplianceAudit[]>(this.auditsEndpoint);
  }

  static async createComplianceAudit(auditData: Partial<ComplianceAudit>): Promise<ComplianceAudit> {
    return APIClient.post<ComplianceAudit>(this.auditsEndpoint, auditData);
  }
}

export class FinancialSettingsService {
  private static endpoint = '/financial-services/settings';

  static async getSettings(): Promise<FinancialSettings | null> {
    return APIClient.get<FinancialSettings>(this.endpoint);
  }

  static async updateSettings(settings: Partial<FinancialSettings>): Promise<FinancialSettings> {
    return APIClient.put<FinancialSettings>(this.endpoint, settings);
  }
}

export class AlertsService {
  private static endpoint = '/financial-services/alerts';

  static async getAllAlerts(): Promise<FinancialAlert[]> {
    return APIClient.get<FinancialAlert[]>(this.endpoint);
  }

  static async createAlert(alertData: Partial<FinancialAlert>): Promise<FinancialAlert> {
    return APIClient.post<FinancialAlert>(this.endpoint, alertData);
  }

  static async updateAlert(alertId: string, updates: Partial<FinancialAlert>): Promise<FinancialAlert> {
    return APIClient.put<FinancialAlert>(`${this.endpoint}/${alertId}`, updates);
  }
}
