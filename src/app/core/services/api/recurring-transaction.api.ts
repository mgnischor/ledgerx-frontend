import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import {
    CreateRecurringTransactionRuleRequest,
    RecurringTransactionRuleDto,
} from "../../models/accounting.model";

@Injectable({ providedIn: "root" })
export class RecurringTransactionApi {
    constructor(private readonly http: HttpClient) {}

    private baseUrl(companyId: string): string {
        return `${environment.apiUrl}/companies/${companyId}/recurring-transactions`;
    }

    create(companyId: string, request: CreateRecurringTransactionRuleRequest): Observable<RecurringTransactionRuleDto> {
        return this.http.post<RecurringTransactionRuleDto>(this.baseUrl(companyId), request);
    }

    list(companyId: string): Observable<RecurringTransactionRuleDto[]> {
        return this.http.get<RecurringTransactionRuleDto[]>(this.baseUrl(companyId));
    }

    generateDue(companyId: string): Observable<void> {
        return this.http.post<void>(`${this.baseUrl(companyId)}/generate-due`, {});
    }

    deactivate(companyId: string, ruleId: string): Observable<RecurringTransactionRuleDto> {
        return this.http.patch<RecurringTransactionRuleDto>(`${this.baseUrl(companyId)}/${ruleId}/deactivate`, {});
    }
}
