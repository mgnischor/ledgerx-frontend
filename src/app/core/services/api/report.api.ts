import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { CashFlowSummary } from "../../models/reporting.model";

/** HTTP client for the `reporting` context's report endpoints. */
@Injectable({ providedIn: "root" })
export class ReportApi {
    /** @param http the Angular HTTP client used to issue requests */
    constructor(private readonly http: HttpClient) {}

    /**
     * Fetches the cash-flow summary for a company within a date range.
     *
     * @param companyId the owning company's id
     * @param from      inclusive start date as `YYYY-MM-DD`
     * @param to        inclusive end date as `YYYY-MM-DD`
     * @returns an observable emitting the cash-flow summary
     */
    cashFlow(companyId: string, from: string, to: string): Observable<CashFlowSummary> {
        return this.http.get<CashFlowSummary>(`${environment.apiUrl}/companies/${companyId}/reports/cash-flow`, {
            params: { from, to },
        });
    }
}
