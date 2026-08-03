import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { environment } from "../../../../environments/environment";
import { CreateRecurringTransactionRuleRequest, RecurringTransactionRuleDto } from "../../models/accounting.model";
import { RecurringTransactionApi } from "./recurring-transaction.api";

describe("RecurringTransactionApi", () => {
    let api: RecurringTransactionApi;
    let httpMock: HttpTestingController;
    const companyId = "company-1";
    const ruleId = "rule-1";
    const baseUrl = `${environment.apiUrl}/companies/${companyId}/recurring-transactions`;

    const response: RecurringTransactionRuleDto = {
        id: ruleId,
        companyId,
        financialAccountId: "account-1",
        categoryId: "cat-1",
        type: "EXPENSE",
        amount: 100,
        frequency: "MONTHLY",
        nextOccurrence: "2026-09-01",
        active: true,
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [RecurringTransactionApi, provideHttpClient(), provideHttpClientTesting()],
        });
        api = TestBed.inject(RecurringTransactionApi);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("creates a recurring transaction rule", () => {
        const request: CreateRecurringTransactionRuleRequest = {
            financialAccountId: "account-1",
            categoryId: "cat-1",
            type: "EXPENSE",
            amount: 100,
            frequency: "MONTHLY",
            firstOccurrence: "2026-09-01",
        };

        api.create(companyId, request).subscribe((res) => expect(res).toEqual(response));

        const req = httpMock.expectOne(baseUrl);
        expect(req.request.method).toBe("POST");
        expect(req.request.body).toEqual(request);
        req.flush(response);
    });

    it("lists recurring transaction rules", () => {
        api.list(companyId).subscribe((res) => expect(res).toEqual([]));

        const req = httpMock.expectOne(baseUrl);
        expect(req.request.method).toBe("GET");
        req.flush([]);
    });

    it("triggers generation of currently due rules", () => {
        api.generateDue(companyId).subscribe();

        const req = httpMock.expectOne(`${baseUrl}/generate-due`);
        expect(req.request.method).toBe("POST");
        expect(req.request.body).toEqual({});
        req.flush(null);
    });

    it("deactivates a recurring transaction rule", () => {
        api.deactivate(companyId, ruleId).subscribe();

        const req = httpMock.expectOne(`${baseUrl}/${ruleId}/deactivate`);
        expect(req.request.method).toBe("PATCH");
        expect(req.request.body).toEqual({});
        req.flush(response);
    });
});
