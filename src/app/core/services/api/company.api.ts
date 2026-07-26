import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { CompanyDto, CreateCompanyRequest } from "../../models/company.model";

@Injectable({ providedIn: "root" })
export class CompanyApi {
    private readonly baseUrl = `${environment.apiUrl}/companies`;

    constructor(private readonly http: HttpClient) {}

    register(request: CreateCompanyRequest): Observable<CompanyDto> {
        return this.http.post<CompanyDto>(this.baseUrl, request);
    }

    deactivate(companyId: string): Observable<CompanyDto> {
        return this.http.patch<CompanyDto>(`${this.baseUrl}/${companyId}/deactivate`, {});
    }
}
