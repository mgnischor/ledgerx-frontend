/** Discriminates a transaction/category as income, expense, or an internal transfer. */
export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";

/** Recurrence cadence for a {@link RecurringTransactionRuleDto}. */
export type RecurrenceFrequency = "WEEKLY" | "MONTHLY" | "YEARLY";

/** A cash or bank account belonging to a company, as returned by the accounting API. */
export interface FinancialAccountDto {
    id: string;
    companyId: string;
    name: string;
    /** ISO 4217 currency code; the backend defaults new accounts to `BRL`. */
    currency: string;
    balance: number;
    active: boolean;
}

/** Payload for `POST /companies/{companyId}/financial-accounts`. */
export interface CreateFinancialAccountRequest {
    /**
     * Duplicated from the URL path because the backend's `CreateFinancialAccountRequest` record
     * declares this field (even though the controller ignores it in favor of the path variable),
     * so `@Valid` rejects the request if it is missing from the body.
     */
    companyId: string;
    name: string;
    openingBalance: number;
}

/** A user-defined classification used to tag transactions and budgets. */
export interface CategoryDto {
    id: string;
    companyId: string;
    name: string;
    type: TransactionType;
}

/** Payload for `POST /companies/{companyId}/categories`. */
export interface CreateCategoryRequest {
    name: string;
    type: TransactionType;
}

/** A recorded income or expense movement on a single financial account. */
export interface TransactionDto {
    id: string;
    financialAccountId: string;
    categoryId: string;
    type: TransactionType;
    amount: number;
    currency: string;
    description?: string;
    /** ISO local date (`YYYY-MM-DD`) the movement occurred on. */
    occurredOn: string;
}

/** Payload for `POST /transactions`. `TRANSFER` is rejected here; use {@link TransferFundsRequest}. */
export interface CreateTransactionRequest {
    financialAccountId: string;
    categoryId: string;
    type: TransactionType;
    amount: number;
    occurredOn: string;
    description?: string;
}

/** Payload for `POST /transfers`, moving funds atomically between two accounts. */
export interface TransferFundsRequest {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
}

/** A monthly spending limit set on an expense category. */
export interface BudgetDto {
    id: string;
    companyId: string;
    categoryId: string;
    /** Calendar month the budget applies to, formatted `YYYY-MM`. */
    period: string;
    limit: number;
    currency: string;
    active: boolean;
}

/** Payload for `POST /companies/{companyId}/budgets`. */
export interface CreateBudgetRequest {
    categoryId: string;
    /** Calendar month the budget applies to, formatted `YYYY-MM` (HTML `<input type="month">`). */
    period: string;
    limit: number;
}

/** Computed spend-vs-limit snapshot for a budget, as returned by `GET .../budgets/{id}/status`. */
export interface BudgetStatusDto {
    budgetId: string;
    categoryId: string;
    period: string;
    limit: number;
    /** Sum of `EXPENSE` transactions recorded against the budget's category during its period. */
    spent: number;
    /** `limit - spent`, floored at the backend's discretion; may be negative if over budget. */
    remaining: number;
    overBudget: boolean;
}

/** A rule that materializes into a real transaction on/after its `nextOccurrence` date. */
export interface RecurringTransactionRuleDto {
    id: string;
    companyId: string;
    financialAccountId: string;
    categoryId: string;
    type: TransactionType;
    amount: number;
    description?: string;
    frequency: RecurrenceFrequency;
    /** ISO local date (`YYYY-MM-DD`) of the next transaction this rule will generate. */
    nextOccurrence: string;
    active: boolean;
}

/** Payload for `POST /companies/{companyId}/recurring-transactions`. */
export interface CreateRecurringTransactionRuleRequest {
    financialAccountId: string;
    categoryId: string;
    type: TransactionType;
    amount: number;
    description?: string;
    frequency: RecurrenceFrequency;
    /** ISO local date (`YYYY-MM-DD`) of the first occurrence; cannot be in the past. */
    firstOccurrence: string;
}
