import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { environment } from "../../../../environments/environment";
import { CreatePartyRequest, PartyDto } from "../../models/billing.model";
import { PartyApi } from "./party.api";

describe("PartyApi", () => {
    let api: PartyApi;
    let httpMock: HttpTestingController;
    const companyId = "company-1";
    const baseUrl = `${environment.apiUrl}/companies/${companyId}/parties`;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [PartyApi, provideHttpClient(), provideHttpClientTesting()],
        });
        api = TestBed.inject(PartyApi);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("creates a party", () => {
        const request: CreatePartyRequest = {
            name: "Jane Doe",
            document: "12345678900",
            documentType: "CPF",
            email: "jane@example.com",
            type: "CUSTOMER",
        };
        const response: PartyDto = {
            id: "party-1",
            companyId,
            name: request.name,
            document: request.document,
            email: request.email,
            type: request.type,
        };

        api.create(companyId, request).subscribe((res) => expect(res).toEqual(response));

        const req = httpMock.expectOne(baseUrl);
        expect(req.request.method).toBe("POST");
        expect(req.request.body).toEqual(request);
        req.flush(response);
    });

    it("lists parties", () => {
        api.list(companyId).subscribe((res) => expect(res).toEqual([]));

        const req = httpMock.expectOne(baseUrl);
        expect(req.request.method).toBe("GET");
        req.flush([]);
    });
});
