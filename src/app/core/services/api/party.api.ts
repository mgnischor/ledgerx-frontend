import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { CreatePartyRequest, PartyDto } from "../../models/billing.model";

@Injectable({ providedIn: "root" })
export class PartyApi {
    constructor(private readonly http: HttpClient) {}

    private baseUrl(companyId: string): string {
        return `${environment.apiUrl}/companies/${companyId}/parties`;
    }

    create(companyId: string, request: CreatePartyRequest): Observable<PartyDto> {
        return this.http.post<PartyDto>(this.baseUrl(companyId), request);
    }

    list(companyId: string): Observable<PartyDto[]> {
        return this.http.get<PartyDto[]>(this.baseUrl(companyId));
    }
}
