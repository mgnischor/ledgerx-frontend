import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { environment } from "../../../../environments/environment";
import { CreateFinancialAccountRequest, FinancialAccountDto } from "../../models/accounting.model";
import { FinancialAccountApi } from "./financial-account.api";

describe("FinancialAccountApi", () => {
    let api: FinancialAccountApi;
    let httpMock: HttpTestingController;
    const companyId = "company-1";
    const accountId = "account-1";
    const baseUrl = `${environment.apiUrl}/companies/${companyId}/financial-accounts`;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [FinancialAccountApi, provideHttpClient(), provideHttpClientTesting()],
        });
        api = TestBed.inject(FinancialAccountApi);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("creates a financial account", () => {
        const request: CreateFinancialAccountRequest = { companyId, name: "Checking", openingBalance: 500 };
        const response: FinancialAccountDto = {
            id: accountId,
            companyId,
            name: "Checking",
            currency: "BRL",
            balance: 500,
            active: true,
        };

        api.create(companyId, request).subscribe((res) => expect(res).toEqual(response));

        const req = httpMock.expectOne(baseUrl);
        expect(req.request.method).toBe("POST");
        expect(req.request.body).toEqual(request);
        req.flush(response);
    });

    it("lists financial accounts", () => {
        api.list(companyId).subscribe((res) => expect(res).toEqual([]));

        const req = httpMock.expectOne(baseUrl);
        expect(req.request.method).toBe("GET");
        req.flush([]);
    });

    it("fetches a financial account by id", () => {
        const response: FinancialAccountDto = {
            id: accountId,
            companyId,
            name: "Checking",
            currency: "BRL",
            balance: 500,
            active: true,
        };

        api.getById(companyId, accountId).subscribe((res) => expect(res).toEqual(response));

        const req = httpMock.expectOne(`${baseUrl}/${accountId}`);
        expect(req.request.method).toBe("GET");
        req.flush(response);
    });

    it("deactivates a financial account", () => {
        api.deactivate(companyId, accountId).subscribe();

        const req = httpMock.expectOne(`${baseUrl}/${accountId}/deactivate`);
        expect(req.request.method).toBe("PATCH");
        expect(req.request.body).toEqual({});
        req.flush({});
    });
});
