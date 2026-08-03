import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { environment } from "../../../../environments/environment";
import { CompanyDto, CreateCompanyRequest } from "../../models/company.model";
import { CompanyApi } from "./company.api";

describe("CompanyApi", () => {
    let api: CompanyApi;
    let httpMock: HttpTestingController;
    const baseUrl = `${environment.apiUrl}/companies`;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [CompanyApi, provideHttpClient(), provideHttpClientTesting()],
        });
        api = TestBed.inject(CompanyApi);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("registers a company", () => {
        const request: CreateCompanyRequest = {
            legalName: "Acme Ltda",
            tradeName: "Acme",
            cnpj: "12345678000199",
            size: "MICRO",
            street: "Main St",
            number: "100",
            city: "Sao Paulo",
            state: "SP",
            zipCode: "01000-000",
            country: "BR",
        };
        const response: CompanyDto = {
            id: "company-1",
            legalName: request.legalName,
            tradeName: request.tradeName,
            cnpj: request.cnpj,
            size: request.size,
            active: true,
        };

        api.register(request).subscribe((res) => expect(res).toEqual(response));

        const req = httpMock.expectOne(baseUrl);
        expect(req.request.method).toBe("POST");
        expect(req.request.body).toEqual(request);
        req.flush(response);
    });

    it("deactivates a company", () => {
        api.deactivate("company-1").subscribe();

        const req = httpMock.expectOne(`${baseUrl}/company-1/deactivate`);
        expect(req.request.method).toBe("PATCH");
        expect(req.request.body).toEqual({});
        req.flush({});
    });
});
