"use client";
import { useState, useEffect, useCallback } from 'react';
import type { BankAccount, Transaction, Loan, InsurancePolicy, InsuranceClaim, Portfolio, TradeOrder, FinancialSettings, FinancialAlert } from '../types';
import { BankingService, InsuranceService, WealthManagementService, RegulatoryComplianceService, FinancialSettingsService, AlertsService } from '../services';
import { sampleBankAccounts, sampleInsurancePolicies, samplePortfolios, sampleFinancialSettings } from '../data';

interface Toast { type: 'success' | 'error' | 'info'; message: string; }

export const useFinancial = () => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>([]);
  const [insuranceClaims, setInsuranceClaims] = useState<InsuranceClaim[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [tradeOrders, setTradeOrders] = useState<TradeOrder[]>([]);
  const [settings, setSettings] = useState<FinancialSettings | null>(null);
  const [alerts, setAlerts] = useState<FinancialAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Toast) => { setToasts(prev => [...prev, toast]); setTimeout(() => setToasts(prev => prev.slice(1)), 5000); }, []);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [accountsData, policiesData, portfoliosData, settingsData] = await Promise.all([
        BankingService.getAllAccounts(), InsuranceService.getAllPolicies(), 
        WealthManagementService.getAllPortfolios(), FinancialSettingsService.getSettings()
      ]);
      if (accountsData.length === 0) { for (const acc of sampleBankAccounts) await BankingService.createAccount(acc); setBankAccounts(sampleBankAccounts); } else setBankAccounts(accountsData);
      if (policiesData.length === 0) { for (const pol of sampleInsurancePolicies) await InsuranceService.createPolicy(pol); setInsurancePolicies(sampleInsurancePolicies); } else setInsurancePolicies(policiesData);
      if (portfoliosData.length === 0) { for (const port of samplePortfolios) await WealthManagementService.createPortfolio(port); setPortfolios(samplePortfolios); } else setPortfolios(portfoliosData);
      if (!settingsData) { await FinancialSettingsService.updateSettings(sampleFinancialSettings); setSettings(sampleFinancialSettings); } else setSettings(settingsData);
    } catch { setError(err instanceof Error ? err.message : 'Failed to load data'); addToast({ type: 'error', message: 'Failed to load financial data' }); }
    finally { setLoading(false); }
  }, [addToast]);

  useEffect(() => { loadAllData(); }, [loadAllData]);

  const createBankAccount = async (accountData: Partial<BankAccount>) => {
    setLoading(true);
    try { const account = await BankingService.createAccount(accountData); setBankAccounts(await BankingService.getAllAccounts()); addToast({ type: 'success', message: 'Bank account created' }); return account; } catch { addToast({ type: 'error', message: 'Failed to create account' }); throw err; }
    finally { setLoading(false); }
  };

  const updateBankAccount = async (accountId: string, updates: Partial<BankAccount>) => {
    setLoading(true);
    try { const account = await BankingService.updateAccount(accountId, updates); setBankAccounts(await BankingService.getAllAccounts()); addToast({ type: 'success', message: 'Account updated' }); return account; } catch { addToast({ type: 'error', message: 'Failed to update account' }); throw err; }
    finally { setLoading(false); }
  };

  const createTransaction = async (transactionData: Partial<Transaction>) => {
    setLoading(true);
    try { const transaction = await BankingService.createTransaction(transactionData); setTransactions(await BankingService.getAllTransactions()); addToast({ type: 'success', message: 'Transaction created' }); return transaction; } catch { addToast({ type: 'error', message: 'Failed to create transaction' }); throw err; }
    finally { setLoading(false); }
  };

  const createInsurancePolicy = async (policyData: Partial<InsurancePolicy>) => {
    setLoading(true);
    try { const policy = await InsuranceService.createPolicy(policyData); setInsurancePolicies(await InsuranceService.getAllPolicies()); addToast({ type: 'success', message: 'Policy created' }); return policy; } catch { addToast({ type: 'error', message: 'Failed to create policy' }); throw err; }
    finally { setLoading(false); }
  };

  const createInsuranceClaim = async (claimData: Partial<InsuranceClaim>) => {
    setLoading(true);
    try { const claim = await InsuranceService.createClaim(claimData); setInsuranceClaims(await InsuranceService.getAllClaims()); addToast({ type: 'success', message: 'Claim filed' }); return claim; } catch { addToast({ type: 'error', message: 'Failed to file claim' }); throw err; }
    finally { setLoading(false); }
  };

  const updateInsuranceClaim = async (claimId: string, updates: Partial<InsuranceClaim>) => {
    setLoading(true);
    try { const claim = await InsuranceService.updateClaim(claimId, updates); setInsuranceClaims(await InsuranceService.getAllClaims()); addToast({ type: 'success', message: 'Claim updated' }); return claim; } catch { addToast({ type: 'error', message: 'Failed to update claim' }); throw err; }
    finally { setLoading(false); }
  };

  const createPortfolio = async (portfolioData: Partial<Portfolio>) => {
    setLoading(true);
    try { const portfolio = await WealthManagementService.createPortfolio(portfolioData); setPortfolios(await WealthManagementService.getAllPortfolios()); addToast({ type: 'success', message: 'Portfolio created' }); return portfolio; } catch { addToast({ type: 'error', message: 'Failed to create portfolio' }); throw err; }
    finally { setLoading(false); }
  };

  const updatePortfolio = async (portfolioId: string, updates: Partial<Portfolio>) => {
    setLoading(true);
    try { const portfolio = await WealthManagementService.updatePortfolio(portfolioId, updates); setPortfolios(await WealthManagementService.getAllPortfolios()); addToast({ type: 'success', message: 'Portfolio updated' }); return portfolio; } catch { addToast({ type: 'error', message: 'Failed to update portfolio' }); throw err; }
    finally { setLoading(false); }
  };

  const createTradeOrder = async (orderData: Partial<TradeOrder>) => {
    setLoading(true);
    try { const order = await WealthManagementService.createTradeOrder(orderData); setTradeOrders(await WealthManagementService.getAllTradeOrders()); addToast({ type: 'success', message: 'Trade order placed' }); return order; } catch { addToast({ type: 'error', message: 'Failed to place order' }); throw err; }
    finally { setLoading(false); }
  };

  const updateSettings = async (updates: Partial<FinancialSettings>) => {
    setLoading(true);
    try { const settingsData = await FinancialSettingsService.updateSettings(updates); setSettings(settingsData); addToast({ type: 'success', message: 'Settings updated' }); return settingsData; } catch { addToast({ type: 'error', message: 'Failed to update settings' }); throw err; }
    finally { setLoading(false); }
  };

  return { bankAccounts, transactions, loans, insurancePolicies, insuranceClaims, portfolios, tradeOrders, settings, alerts, loading, error, toasts, createBankAccount, updateBankAccount, createTransaction, createInsurancePolicy, createInsuranceClaim, updateInsuranceClaim, createPortfolio, updatePortfolio, createTradeOrder, updateSettings, loadAllData };
};
