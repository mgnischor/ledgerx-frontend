import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { BudgetDto, BudgetStatusDto, CreateBudgetRequest } from "../../models/accounting.model";

@Injectable({ providedIn: "root" })
export class BudgetApi {
    constructor(private readonly http: HttpClient) {}

    private baseUrl(companyId: string): string {
        return `${environment.apiUrl}/companies/${companyId}/budgets`;
    }

    create(companyId: string, request: CreateBudgetRequest): Observable<BudgetDto> {
        return this.http.post<BudgetDto>(this.baseUrl(companyId), request);
    }

    list(companyId: string): Observable<BudgetDto[]> {
        return this.http.get<BudgetDto[]>(this.baseUrl(companyId));
    }

    status(companyId: string, budgetId: string): Observable<BudgetStatusDto> {
        return this.http.get<BudgetStatusDto>(`${this.baseUrl(companyId)}/${budgetId}/status`);
    }

    deactivate(companyId: string, budgetId: string): Observable<BudgetDto> {
        return this.http.patch<BudgetDto>(`${this.baseUrl(companyId)}/${budgetId}/deactivate`, {});
    }
}
