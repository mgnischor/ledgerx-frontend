import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { environment } from "../../../../environments/environment";
import { BudgetDto, BudgetStatusDto, CreateBudgetRequest } from "../../models/accounting.model";
import { BudgetApi } from "./budget.api";

describe("BudgetApi", () => {
    let api: BudgetApi;
    let httpMock: HttpTestingController;
    const companyId = "company-1";
    const budgetId = "budget-1";
    const baseUrl = `${environment.apiUrl}/companies/${companyId}/budgets`;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [BudgetApi, provideHttpClient(), provideHttpClientTesting()],
        });
        api = TestBed.inject(BudgetApi);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("creates a budget", () => {
        const request: CreateBudgetRequest = { categoryId: "cat-1", period: "2026-08", limit: 1000 };
        const response: BudgetDto = {
            id: budgetId,
            companyId,
            categoryId: "cat-1",
            period: "2026-08",
            limit: 1000,
            currency: "BRL",
            active: true,
        };

        api.create(companyId, request).subscribe((res) => expect(res).toEqual(response));

        const req = httpMock.expectOne(baseUrl);
        expect(req.request.method).toBe("POST");
        expect(req.request.body).toEqual(request);
        req.flush(response);
    });

    it("lists budgets", () => {
        api.list(companyId).subscribe((res) => expect(res).toEqual([]));

        const req = httpMock.expectOne(baseUrl);
        expect(req.request.method).toBe("GET");
        req.flush([]);
    });

    it("fetches budget status", () => {
        const response: BudgetStatusDto = {
            budgetId,
            categoryId: "cat-1",
            period: "2026-08",
            limit: 1000,
            spent: 200,
            remaining: 800,
            overBudget: false,
        };

        api.status(companyId, budgetId).subscribe((res) => expect(res).toEqual(response));

        const req = httpMock.expectOne(`${baseUrl}/${budgetId}/status`);
        expect(req.request.method).toBe("GET");
        req.flush(response);
    });

    it("deactivates a budget", () => {
        api.deactivate(companyId, budgetId).subscribe();

        const req = httpMock.expectOne(`${baseUrl}/${budgetId}/deactivate`);
        expect(req.request.method).toBe("PATCH");
        expect(req.request.body).toEqual({});
        req.flush({});
    });
});
