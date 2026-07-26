import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { CashFlowSummary } from "../../models/reporting.model";

@Injectable({ providedIn: "root" })
export class ReportApi {
    constructor(private readonly http: HttpClient) {}

    cashFlow(companyId: string, from: string, to: string): Observable<CashFlowSummary> {
        return this.http.get<CashFlowSummary>(`${environment.apiUrl}/companies/${companyId}/reports/cash-flow`, {
            params: { from, to },
        });
    }
}
