import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { CreateFinancialAccountRequest, FinancialAccountDto } from "../../models/accounting.model";

@Injectable({ providedIn: "root" })
export class FinancialAccountApi {
    constructor(private readonly http: HttpClient) {}

    private baseUrl(companyId: string): string {
        return `${environment.apiUrl}/companies/${companyId}/financial-accounts`;
    }

    create(companyId: string, request: CreateFinancialAccountRequest): Observable<FinancialAccountDto> {
        return this.http.post<FinancialAccountDto>(this.baseUrl(companyId), request);
    }

    list(companyId: string): Observable<FinancialAccountDto[]> {
        return this.http.get<FinancialAccountDto[]>(this.baseUrl(companyId));
    }

    getById(companyId: string, accountId: string): Observable<FinancialAccountDto> {
        return this.http.get<FinancialAccountDto>(`${this.baseUrl(companyId)}/${accountId}`);
    }

    deactivate(companyId: string, accountId: string): Observable<FinancialAccountDto> {
        return this.http.patch<FinancialAccountDto>(`${this.baseUrl(companyId)}/${accountId}/deactivate`, {});
    }
}
