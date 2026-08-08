import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import {
    CreateRecurringTransactionRuleRequest,
    RecurringTransactionRuleDto,
} from "../../models/accounting.model";

/** HTTP client for the `accounting` context's recurring-transaction endpoints. */
@Injectable({ providedIn: "root" })
export class RecurringTransactionApi {
    /** @param http the Angular HTTP client used to issue requests */
    constructor(private readonly http: HttpClient) {}

    /** Builds the base URL for a company's recurring-transaction endpoints. */
    private baseUrl(companyId: string): string {
        return `${environment.apiUrl}/companies/${companyId}/recurring-transactions`;
    }

    /**
     * Creates a new recurring-transaction rule for the company.
     *
     * @param companyId the owning company's id
     * @param request   the rule data to create
     * @returns an observable emitting the created rule
     */
    create(companyId: string, request: CreateRecurringTransactionRuleRequest): Observable<RecurringTransactionRuleDto> {
        return this.http.post<RecurringTransactionRuleDto>(this.baseUrl(companyId), request);
    }

    /**
     * Lists every recurring-transaction rule registered for the company.
     *
     * @param companyId the owning company's id
     * @returns an observable emitting the company's rules
     */
    list(companyId: string): Observable<RecurringTransactionRuleDto[]> {
        return this.http.get<RecurringTransactionRuleDto[]>(this.baseUrl(companyId));
    }

    /**
     * Materializes every rule whose next occurrence is due into a real transaction.
     *
     * @param companyId the owning company's id
     * @returns an observable that completes once the due transactions were generated
     */
    generateDue(companyId: string): Observable<void> {
        return this.http.post<void>(`${this.baseUrl(companyId)}/generate-due`, {});
    }

    /**
     * Deactivates a recurring-transaction rule; idempotent on the backend.
     *
     * @param companyId the owning company's id
     * @param ruleId    the rule's id
     * @returns an observable emitting the deactivated rule
     */
    deactivate(companyId: string, ruleId: string): Observable<RecurringTransactionRuleDto> {
        return this.http.patch<RecurringTransactionRuleDto>(`${this.baseUrl(companyId)}/${ruleId}/deactivate`, {});
    }
}
