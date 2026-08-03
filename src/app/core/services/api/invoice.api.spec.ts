import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { environment } from "../../../../environments/environment";
import { CreateInvoiceRequest, InvoiceDto, RegisterPaymentRequest } from "../../models/billing.model";
import { InvoiceApi } from "./invoice.api";

describe("InvoiceApi", () => {
    let api: InvoiceApi;
    let httpMock: HttpTestingController;
    const invoiceId = "invoice-1";
    const baseUrl = `${environment.apiUrl}/invoices`;

    const response: InvoiceDto = {
        id: invoiceId,
        companyId: "company-1",
        partyId: "party-1",
        direction: "RECEIVABLE",
        status: "OPEN",
        installmentCount: 3,
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [InvoiceApi, provideHttpClient(), provideHttpClientTesting()],
        });
        api = TestBed.inject(InvoiceApi);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("issues an invoice", () => {
        const request: CreateInvoiceRequest = {
            companyId: "company-1",
            partyId: "party-1",
            direction: "CUSTOMER",
            installmentAmounts: [100, 100, 100],
            firstDueDate: "2026-09-01",
        };

        api.issue(request).subscribe((res) => expect(res).toEqual(response));

        const req = httpMock.expectOne(baseUrl);
        expect(req.request.method).toBe("POST");
        expect(req.request.body).toEqual(request);
        req.flush(response);
    });

    it("fetches an invoice by id", () => {
        api.getById(invoiceId).subscribe((res) => expect(res).toEqual(response));

        const req = httpMock.expectOne(`${baseUrl}/${invoiceId}`);
        expect(req.request.method).toBe("GET");
        req.flush(response);
    });

    it("registers a payment", () => {
        const request: RegisterPaymentRequest = { installmentId: "installment-1", paidOn: "2026-08-01" };

        api.registerPayment(invoiceId, request).subscribe((res) => expect(res).toEqual(response));

        const req = httpMock.expectOne(`${baseUrl}/${invoiceId}/payments`);
        expect(req.request.method).toBe("PATCH");
        expect(req.request.body).toEqual(request);
        req.flush(response);
    });

    it("cancels an invoice", () => {
        api.cancel(invoiceId).subscribe();

        const req = httpMock.expectOne(`${baseUrl}/${invoiceId}/cancel`);
        expect(req.request.method).toBe("PATCH");
        expect(req.request.body).toEqual({});
        req.flush({});
    });
});
