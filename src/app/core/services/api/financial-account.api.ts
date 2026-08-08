import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { CreateFinancialAccountRequest, FinancialAccountDto } from "../../models/accounting.model";

/** HTTP client for the `accounting` context's financial-account endpoints. */
@Injectable({ providedIn: "root" })
export class FinancialAccountApi {
    /** @param http the Angular HTTP client used to issue requests */
    constructor(private readonly http: HttpClient) {}

    /** Builds the base URL for a company's financial-account endpoints. */
    private baseUrl(companyId: string): string {
        return `${environment.apiUrl}/companies/${companyId}/financial-accounts`;
    }

    /**
     * Creates a new financial account for the company.
     *
     * @param companyId the owning company's id
     * @param request   the account data to create
     * @returns an observable emitting the created account
     */
    create(companyId: string, request: CreateFinancialAccountRequest): Observable<FinancialAccountDto> {
        return this.http.post<FinancialAccountDto>(this.baseUrl(companyId), request);
    }

    /**
     * Lists every financial account registered for the company.
     *
     * @param companyId the owning company's id
     * @returns an observable emitting the company's financial accounts
     */
    list(companyId: string): Observable<FinancialAccountDto[]> {
        return this.http.get<FinancialAccountDto[]>(this.baseUrl(companyId));
    }

    /**
     * Fetches a single financial account by id.
     *
     * @param companyId the owning company's id
     * @param accountId the account's id
     * @returns an observable emitting the requested account
     */
    getById(companyId: string, accountId: string): Observable<FinancialAccountDto> {
        return this.http.get<FinancialAccountDto>(`${this.baseUrl(companyId)}/${accountId}`);
    }

    /**
     * Deactivates a financial account; idempotent on the backend.
     *
     * @param companyId the owning company's id
     * @param accountId the account's id
     * @returns an observable emitting the deactivated account
     */
    deactivate(companyId: string, accountId: string): Observable<FinancialAccountDto> {
        return this.http.patch<FinancialAccountDto>(`${this.baseUrl(companyId)}/${accountId}/deactivate`, {});
    }
}
