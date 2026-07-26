export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";

export type RecurrenceFrequency = "WEEKLY" | "MONTHLY" | "YEARLY";

export interface FinancialAccountDto {
    id: string;
    companyId: string;
    name: string;
    currency: string;
    balance: number;
    active: boolean;
}

export interface CreateFinancialAccountRequest {
    companyId: string;
    name: string;
    openingBalance: number;
}

export interface CategoryDto {
    id: string;
    companyId: string;
    name: string;
    type: TransactionType;
}

export interface CreateCategoryRequest {
    name: string;
    type: TransactionType;
}

export interface TransactionDto {
    id: string;
    financialAccountId: string;
    categoryId: string;
    type: TransactionType;
    amount: number;
    currency: string;
    description?: string;
    occurredOn: string;
}

export interface CreateTransactionRequest {
    financialAccountId: string;
    categoryId: string;
    type: TransactionType;
    amount: number;
    occurredOn: string;
    description?: string;
}

export interface TransferFundsRequest {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
}

export interface BudgetDto {
    id: string;
    companyId: string;
    categoryId: string;
    period: string;
    limit: number;
    currency: string;
    active: boolean;
}

export interface CreateBudgetRequest {
    categoryId: string;
    period: string;
    limit: number;
}

export interface BudgetStatusDto {
    budgetId: string;
    categoryId: string;
    period: string;
    limit: number;
    spent: number;
    remaining: number;
    overBudget: boolean;
}

export interface RecurringTransactionRuleDto {
    id: string;
    companyId: string;
    financialAccountId: string;
    categoryId: string;
    type: TransactionType;
    amount: number;
    description?: string;
    frequency: RecurrenceFrequency;
    nextOccurrence: string;
    active: boolean;
}

export interface CreateRecurringTransactionRuleRequest {
    financialAccountId: string;
    categoryId: string;
    type: TransactionType;
    amount: number;
    description?: string;
    frequency: RecurrenceFrequency;
    firstOccurrence: string;
}
