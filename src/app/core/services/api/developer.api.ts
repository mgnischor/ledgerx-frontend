import { HttpClient, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { DeveloperInfoDto } from "../../models/developer.model";

/** HTTP client for the developer/debug endpoints. */
@Injectable({ providedIn: "root" })
export class DeveloperApi {
    /** @param http the Angular HTTP client used to issue requests */
    constructor(private readonly http: HttpClient) {}

    /** Requests the full response (not just the body) to also surface the X-Debug-* trace headers. */
    info(): Observable<HttpResponse<DeveloperInfoDto>> {
        return this.http.get<DeveloperInfoDto>(`${environment.apiUrl}/developer`, { observe: "response" });
    }
}
