import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { CreatePartyRequest, PartyDto } from "../../models/billing.model";

/** HTTP client for the `billing` context's party endpoints. */
@Injectable({ providedIn: "root" })
export class PartyApi {
    /** @param http the Angular HTTP client used to issue requests */
    constructor(private readonly http: HttpClient) {}

    /** Builds the base URL for a company's party endpoints. */
    private baseUrl(companyId: string): string {
        return `${environment.apiUrl}/companies/${companyId}/parties`;
    }

    /**
     * Creates a new party (customer or supplier) for the company.
     *
     * @param companyId the owning company's id
     * @param request   the party data to create
     * @returns an observable emitting the created party
     */
    create(companyId: string, request: CreatePartyRequest): Observable<PartyDto> {
        return this.http.post<PartyDto>(this.baseUrl(companyId), request);
    }

    /**
     * Lists every party registered for the company.
     *
     * @param companyId the owning company's id
     * @returns an observable emitting the company's parties
     */
    list(companyId: string): Observable<PartyDto[]> {
        return this.http.get<PartyDto[]>(this.baseUrl(companyId));
    }
}
