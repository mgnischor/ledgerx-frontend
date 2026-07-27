/**
 * Cash-flow totals for a company over a date range, as returned by
 * `GET /companies/{companyId}/reports/cash-flow`. Only `INCOME` and `EXPENSE` transactions are
 * included; `TRANSFER` is excluded to avoid double counting.
 */
export interface CashFlowSummary {
    companyId: string;
    /** ISO local date (`YYYY-MM-DD`), inclusive start of the reporting window. */
    from: string;
    /** ISO local date (`YYYY-MM-DD`), inclusive end of the reporting window. */
    to: string;
    totalIncome: number;
    totalExpense: number;
    /** `totalIncome - totalExpense`. */
    netResult: number;
}
