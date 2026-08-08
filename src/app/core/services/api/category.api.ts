import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { CategoryDto, CreateCategoryRequest } from "../../models/accounting.model";

/** HTTP client for the `accounting` context's category endpoints. */
@Injectable({ providedIn: "root" })
export class CategoryApi {
    /** @param http the Angular HTTP client used to issue requests */
    constructor(private readonly http: HttpClient) {}

    /** Builds the base URL for a company's category endpoints. */
    private baseUrl(companyId: string): string {
        return `${environment.apiUrl}/companies/${companyId}/categories`;
    }

    /**
     * Creates a new category for the company.
     *
     * @param companyId the owning company's id
     * @param request   the category data to create
     * @returns an observable emitting the created category
     */
    create(companyId: string, request: CreateCategoryRequest): Observable<CategoryDto> {
        return this.http.post<CategoryDto>(this.baseUrl(companyId), request);
    }

    /**
     * Lists every category registered for the company.
     *
     * @param companyId the owning company's id
     * @returns an observable emitting the company's categories
     */
    list(companyId: string): Observable<CategoryDto[]> {
        return this.http.get<CategoryDto[]>(this.baseUrl(companyId));
    }
}
