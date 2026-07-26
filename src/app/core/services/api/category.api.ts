import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { CategoryDto, CreateCategoryRequest } from "../../models/accounting.model";

@Injectable({ providedIn: "root" })
export class CategoryApi {
    constructor(private readonly http: HttpClient) {}

    private baseUrl(companyId: string): string {
        return `${environment.apiUrl}/companies/${companyId}/categories`;
    }

    create(companyId: string, request: CreateCategoryRequest): Observable<CategoryDto> {
        return this.http.post<CategoryDto>(this.baseUrl(companyId), request);
    }

    list(companyId: string): Observable<CategoryDto[]> {
        return this.http.get<CategoryDto[]>(this.baseUrl(companyId));
    }
}
