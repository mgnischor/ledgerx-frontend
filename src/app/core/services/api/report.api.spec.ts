import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { environment } from "../../../../environments/environment";
import { CashFlowSummary } from "../../models/reporting.model";
import { ReportApi } from "./report.api";

describe("ReportApi", () => {
    let api: ReportApi;
    let httpMock: HttpTestingController;
    const companyId = "company-1";
    const baseUrl = `${environment.apiUrl}/companies/${companyId}/reports/cash-flow`;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ReportApi, provideHttpClient(), provideHttpClientTesting()],
        });
        api = TestBed.inject(ReportApi);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("fetches the cash-flow summary for a date range", () => {
        const response: CashFlowSummary = {
            companyId,
            from: "2026-08-01",
            to: "2026-08-31",
            totalIncome: 5000,
            totalExpense: 2000,
            netResult: 3000,
        };

        api.cashFlow(companyId, "2026-08-01", "2026-08-31").subscribe((res) => expect(res).toEqual(response));

        const req = httpMock.expectOne((r) => r.url === baseUrl);
        expect(req.request.method).toBe("GET");
        expect(req.request.params.get("from")).toBe("2026-08-01");
        expect(req.request.params.get("to")).toBe("2026-08-31");
        req.flush(response);
    });
});
