import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { BudgetDto, BudgetStatusDto, CreateBudgetRequest } from "../../models/accounting.model";

/** HTTP client for the `accounting` context's budget endpoints. */
@Injectable({ providedIn: "root" })
export class BudgetApi {
    constructor(private readonly http: HttpClient) {}

    private baseUrl(companyId: string): string {
        return `${environment.apiUrl}/companies/${companyId}/budgets`;
    }

    /** Creates a monthly spending limit for an expense category. */
    create(companyId: string, request: CreateBudgetRequest): Observable<BudgetDto> {
        return this.http.post<BudgetDto>(this.baseUrl(companyId), request);
    }

    /** Lists every budget (active or not) registered for the company. */
    list(companyId: string): Observable<BudgetDto[]> {
        return this.http.get<BudgetDto[]>(this.baseUrl(companyId));
    }

    /** Fetches the computed spent/remaining snapshot for a single budget. */
    status(companyId: string, budgetId: string): Observable<BudgetStatusDto> {
        return this.http.get<BudgetStatusDto>(`${this.baseUrl(companyId)}/${budgetId}/status`);
    }

    /** Deactivates a budget; idempotent on the backend. */
    deactivate(companyId: string, budgetId: string): Observable<BudgetDto> {
        return this.http.patch<BudgetDto>(`${this.baseUrl(companyId)}/${budgetId}/deactivate`, {});
    }
}
