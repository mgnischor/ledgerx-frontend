import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { CompanyDto, CreateCompanyRequest } from "../../models/company.model";

/** HTTP client for the platform's company endpoints. */
@Injectable({ providedIn: "root" })
export class CompanyApi {
    private readonly baseUrl = `${environment.apiUrl}/companies`;

    /** @param http the Angular HTTP client used to issue requests */
    constructor(private readonly http: HttpClient) {}

    /**
     * Lists every company visible to the current user.
     *
     * @returns an observable emitting the list of companies
     */
    list(): Observable<CompanyDto[]> {
        return this.http.get<CompanyDto[]>(this.baseUrl);
    }

    /**
     * Registers a new company.
     *
     * @param request the company data to register
     * @returns an observable emitting the created company
     */
    register(request: CreateCompanyRequest): Observable<CompanyDto> {
        return this.http.post<CompanyDto>(this.baseUrl, request);
    }

    /**
     * Deactivates a company; idempotent on the backend.
     *
     * @param companyId the id of the company to deactivate
     * @returns an observable emitting the deactivated company
     */
    deactivate(companyId: string): Observable<CompanyDto> {
        return this.http.patch<CompanyDto>(`${this.baseUrl}/${companyId}/deactivate`, {});
    }
}
