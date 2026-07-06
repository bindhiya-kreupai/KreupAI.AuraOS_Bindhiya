-- Finance module domain models (AURA-149..160).
-- Defensive CREATE TABLE IF NOT EXISTS; repo uses db-push, enums stored as TEXT.
-- Cost centers reuse the existing aura_cost_center table.

CREATE TABLE IF NOT EXISTS "aura_finance_vendor" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "vendorCode" TEXT NOT NULL,
  "vendorName" TEXT NOT NULL,
  "vendorType" TEXT NOT NULL DEFAULT 'company',
  "status" TEXT NOT NULL DEFAULT 'pending_approval',
  "email" TEXT,
  "phone" TEXT,
  "website" TEXT,
  "taxId" TEXT,
  "categories" JSONB,
  "servicesProvided" JSONB,
  "paymentTerms" TEXT NOT NULL DEFAULT 'net_30',
  "preferredPaymentMethod" TEXT NOT NULL DEFAULT 'bank_transfer',
  "primaryContact" JSONB,
  "billingAddress" JSONB,
  "bankDetails" JSONB,
  "documents" JSONB,
  "performanceRating" DECIMAL(4,2) NOT NULL DEFAULT 0,
  "totalTransactions" INTEGER NOT NULL DEFAULT 0,
  "totalSpend" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "onTimePaymentRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
  "qualityScore" DECIMAL(5,2) NOT NULL DEFAULT 0,
  "w9OnFile" BOOLEAN NOT NULL DEFAULT false,
  "backgroundCheckCompleted" BOOLEAN NOT NULL DEFAULT false,
  "contractOnFile" BOOLEAN NOT NULL DEFAULT false,
  "contractExpiryDate" TIMESTAMP(3),
  "insuranceExpiryDate" TIMESTAMP(3),
  "approvalStatus" TEXT NOT NULL DEFAULT 'pending',
  "approvedBy" TEXT,
  "approvedDate" TIMESTAMP(3),
  "rejectionReason" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "aura_finance_vendor_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "FinanceVendor_tenantId_vendorCode_key" ON "aura_finance_vendor"("tenantId", "vendorCode");
CREATE INDEX IF NOT EXISTS "FinanceVendor_tenantId_idx" ON "aura_finance_vendor"("tenantId");
CREATE INDEX IF NOT EXISTS "FinanceVendor_status_idx" ON "aura_finance_vendor"("status");

CREATE TABLE IF NOT EXISTS "aura_finance_contract" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "contractCode" TEXT NOT NULL,
  "contractName" TEXT NOT NULL,
  "vendorId" TEXT,
  "vendorName" TEXT,
  "contractType" TEXT NOT NULL DEFAULT 'fixed_price',
  "status" TEXT NOT NULL DEFAULT 'draft',
  "startDate" TIMESTAMP(3),
  "endDate" TIMESTAMP(3),
  "autoRenew" BOOLEAN NOT NULL DEFAULT false,
  "renewalNoticeDays" INTEGER,
  "totalContractValue" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "paymentTerms" TEXT NOT NULL DEFAULT 'net_30',
  "totalSpent" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "remainingValue" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "utilizationRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
  "servicesIncluded" JSONB,
  "paymentSchedule" JSONB,
  "deliverables" JSONB,
  "kpis" JSONB,
  "amendments" JSONB,
  "documentUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "aura_finance_contract_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "FinanceContract_tenantId_contractCode_key" ON "aura_finance_contract"("tenantId", "contractCode");
CREATE INDEX IF NOT EXISTS "FinanceContract_tenantId_idx" ON "aura_finance_contract"("tenantId");
CREATE INDEX IF NOT EXISTS "FinanceContract_vendorId_idx" ON "aura_finance_contract"("vendorId");

CREATE TABLE IF NOT EXISTS "aura_finance_budget" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "budgetCode" TEXT NOT NULL,
  "budgetName" TEXT NOT NULL,
  "budgetType" TEXT NOT NULL DEFAULT 'operations',
  "status" TEXT NOT NULL DEFAULT 'draft',
  "description" TEXT,
  "fiscalYear" INTEGER NOT NULL,
  "period" TEXT NOT NULL DEFAULT 'annual',
  "startDate" TIMESTAMP(3),
  "endDate" TIMESTAMP(3),
  "department" TEXT,
  "costCenter" TEXT,
  "project" TEXT,
  "location" TEXT,
  "lines" JSONB,
  "totalBudget" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "totalAllocated" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "totalSpent" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "totalRemaining" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "utilizationRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
  "approvalStatus" TEXT NOT NULL DEFAULT 'pending',
  "approvedBy" TEXT,
  "approvedByName" TEXT,
  "approvedDate" TIMESTAMP(3),
  "rejectionReason" TEXT,
  "version" TEXT NOT NULL DEFAULT '1.0',
  "tags" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "createdByName" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "aura_finance_budget_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "FinanceBudget_tenantId_budgetCode_key" ON "aura_finance_budget"("tenantId", "budgetCode");
CREATE INDEX IF NOT EXISTS "FinanceBudget_tenantId_idx" ON "aura_finance_budget"("tenantId");
CREATE INDEX IF NOT EXISTS "FinanceBudget_status_idx" ON "aura_finance_budget"("status");

CREATE TABLE IF NOT EXISTS "aura_finance_budget_template" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "templateCode" TEXT NOT NULL,
  "templateName" TEXT NOT NULL,
  "templateType" TEXT NOT NULL DEFAULT 'operations',
  "status" TEXT NOT NULL DEFAULT 'active',
  "description" TEXT,
  "templateLines" JSONB,
  "defaultPeriod" TEXT NOT NULL DEFAULT 'annual',
  "defaultCurrency" TEXT NOT NULL DEFAULT 'USD',
  "includeHeadcount" BOOLEAN NOT NULL DEFAULT false,
  "includeContingency" BOOLEAN NOT NULL DEFAULT false,
  "contingencyPercentage" DECIMAL(5,2),
  "usageCount" INTEGER NOT NULL DEFAULT 0,
  "lastUsedDate" TIMESTAMP(3),
  "allowedDepartments" JSONB,
  "allowedRoles" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "aura_finance_budget_template_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "FinanceBudgetTemplate_tenantId_templateCode_key" ON "aura_finance_budget_template"("tenantId", "templateCode");
CREATE INDEX IF NOT EXISTS "FinanceBudgetTemplate_tenantId_idx" ON "aura_finance_budget_template"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_finance_scenario" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "scenarioCode" TEXT NOT NULL,
  "scenarioName" TEXT NOT NULL,
  "scenarioType" TEXT NOT NULL DEFAULT 'custom',
  "status" TEXT NOT NULL DEFAULT 'draft',
  "description" TEXT,
  "baseBudgetId" TEXT,
  "baseBudgetName" TEXT,
  "assumptions" JSONB,
  "adjustedLines" JSONB,
  "totalAdjustedBudget" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "totalVarianceFromBase" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "variancePercentage" DECIMAL(6,2) NOT NULL DEFAULT 0,
  "headcountImpact" JSONB,
  "cashFlowImpact" JSONB,
  "lastRunAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "aura_finance_scenario_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "FinanceScenario_tenantId_scenarioCode_key" ON "aura_finance_scenario"("tenantId", "scenarioCode");
CREATE INDEX IF NOT EXISTS "FinanceScenario_tenantId_idx" ON "aura_finance_scenario"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_finance_petty_cash_fund" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "fundCode" TEXT NOT NULL,
  "fundName" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "department" TEXT,
  "location" TEXT,
  "custodian" TEXT,
  "custodianName" TEXT,
  "initialBalance" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "currentBalance" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "totalDisbursed" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "totalReplenished" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "fundLimit" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "transactionLimit" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "minimumBalance" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "requireReceipt" BOOLEAN NOT NULL DEFAULT true,
  "requireApproval" BOOLEAN NOT NULL DEFAULT true,
  "approvalThreshold" DECIMAL(15,2),
  "lastReconciledDate" TIMESTAMP(3),
  "lastReconciledBy" TEXT,
  "nextReconciliationDue" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "aura_finance_petty_cash_fund_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "FinancePettyCashFund_tenantId_fundCode_key" ON "aura_finance_petty_cash_fund"("tenantId", "fundCode");
CREATE INDEX IF NOT EXISTS "FinancePettyCashFund_tenantId_idx" ON "aura_finance_petty_cash_fund"("tenantId");

CREATE TABLE IF NOT EXISTS "aura_finance_petty_cash_transaction" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "transactionCode" TEXT NOT NULL,
  "fundId" TEXT NOT NULL,
  "transactionType" TEXT NOT NULL DEFAULT 'disbursement',
  "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "category" TEXT,
  "description" TEXT,
  "requestedBy" TEXT,
  "requestedByName" TEXT,
  "receiptNumber" TEXT,
  "receiptAttachment" TEXT,
  "vendor" TEXT,
  "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
  "approvalStatus" TEXT,
  "approvedBy" TEXT,
  "approvedDate" TIMESTAMP(3),
  "reconciled" BOOLEAN NOT NULL DEFAULT false,
  "reconciledDate" TIMESTAMP(3),
  "balanceAfter" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  CONSTRAINT "aura_finance_petty_cash_transaction_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "FinancePettyCashTransaction_tenantId_transactionCode_key" ON "aura_finance_petty_cash_transaction"("tenantId", "transactionCode");
CREATE INDEX IF NOT EXISTS "FinancePettyCashTransaction_tenantId_idx" ON "aura_finance_petty_cash_transaction"("tenantId");
CREATE INDEX IF NOT EXISTS "FinancePettyCashTransaction_fundId_idx" ON "aura_finance_petty_cash_transaction"("fundId");

CREATE TABLE IF NOT EXISTS "aura_finance_petty_cash_reconciliation" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "reconciliationCode" TEXT NOT NULL,
  "fundId" TEXT NOT NULL,
  "fundName" TEXT,
  "reconciliationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expectedBalance" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "actualBalance" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "variance" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "transactionCount" INTEGER NOT NULL DEFAULT 0,
  "totalDisbursements" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "totalReplenishments" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "unreconciledTransactions" INTEGER NOT NULL DEFAULT 0,
  "cashOnHand" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "receipts" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "ious" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'in_progress',
  "varianceExplanation" TEXT,
  "varianceResolution" TEXT,
  "reconciledBy" TEXT,
  "reconciledByName" TEXT,
  "reviewedBy" TEXT,
  "reviewedDate" TIMESTAMP(3),
  "supportingDocuments" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  CONSTRAINT "aura_finance_petty_cash_reconciliation_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "FinancePettyCashReconciliation_tenantId_code_key" ON "aura_finance_petty_cash_reconciliation"("tenantId", "reconciliationCode");
CREATE INDEX IF NOT EXISTS "FinancePettyCashReconciliation_tenantId_idx" ON "aura_finance_petty_cash_reconciliation"("tenantId");
CREATE INDEX IF NOT EXISTS "FinancePettyCashReconciliation_fundId_idx" ON "aura_finance_petty_cash_reconciliation"("fundId");

CREATE TABLE IF NOT EXISTS "aura_finance_petty_cash_policy" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "policyType" TEXT NOT NULL DEFAULT 'approval',
  "name" TEXT NOT NULL,
  "description" TEXT,
  "threshold" DECIMAL(15,2),
  "approverRole" TEXT,
  "monthlyLimit" DECIMAL(15,2),
  "requireReceipt" BOOLEAN NOT NULL DEFAULT true,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "config" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "aura_finance_petty_cash_policy_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "FinancePettyCashPolicy_tenantId_idx" ON "aura_finance_petty_cash_policy"("tenantId");
CREATE INDEX IF NOT EXISTS "FinancePettyCashPolicy_policyType_idx" ON "aura_finance_petty_cash_policy"("policyType");

CREATE TABLE IF NOT EXISTS "aura_finance_asset" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "assetCode" TEXT NOT NULL,
  "assetName" TEXT NOT NULL,
  "assetType" TEXT NOT NULL DEFAULT 'capital',
  "status" TEXT NOT NULL DEFAULT 'active',
  "description" TEXT,
  "purchasePrice" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "currentValue" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "depreciationMethod" TEXT NOT NULL DEFAULT 'straight_line',
  "usefulLife" INTEGER NOT NULL DEFAULT 5,
  "salvageValue" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "accumulatedDepreciation" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "purchaseDate" TIMESTAMP(3),
  "vendor" TEXT,
  "invoiceNumber" TEXT,
  "warrantyExpiryDate" TIMESTAMP(3),
  "assignedTo" TEXT,
  "assignedToName" TEXT,
  "department" TEXT,
  "costCenter" TEXT,
  "location" TEXT,
  "serialNumber" TEXT,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "reorderPoint" INTEGER NOT NULL DEFAULT 0,
  "unitCost" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "supplier" TEXT,
  "lastRestocked" TIMESTAMP(3),
  "maintenanceSchedule" JSONB,
  "maintenanceHistory" JSONB,
  "disposalDate" TIMESTAMP(3),
  "disposalMethod" TEXT,
  "disposalValue" DECIMAL(15,2),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  CONSTRAINT "aura_finance_asset_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "FinanceAsset_tenantId_assetCode_key" ON "aura_finance_asset"("tenantId", "assetCode");
CREATE INDEX IF NOT EXISTS "FinanceAsset_tenantId_idx" ON "aura_finance_asset"("tenantId");
CREATE INDEX IF NOT EXISTS "FinanceAsset_assetType_idx" ON "aura_finance_asset"("assetType");
