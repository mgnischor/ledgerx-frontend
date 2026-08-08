import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { CreateInvoiceRequest, InvoiceDto, RegisterPaymentRequest } from "../../models/billing.model";

/** HTTP client for the `billing` context's invoice endpoints. */
@Injectable({ providedIn: "root" })
export class InvoiceApi {
    private readonly baseUrl = `${environment.apiUrl}/invoices`;

    /** @param http the Angular HTTP client used to issue requests */
    constructor(private readonly http: HttpClient) {}

    /**
     * Issues a new invoice with one or more installments.
     *
     * @param request the invoice data to issue
     * @returns an observable emitting the issued invoice
     */
    issue(request: CreateInvoiceRequest): Observable<InvoiceDto> {
        return this.http.post<InvoiceDto>(this.baseUrl, request);
    }

    /**
     * Fetches a single invoice by id.
     *
     * @param invoiceId the invoice's id
     * @returns an observable emitting the requested invoice
     */
    getById(invoiceId: string): Observable<InvoiceDto> {
        return this.http.get<InvoiceDto>(`${this.baseUrl}/${invoiceId}`);
    }

    /**
     * Registers a payment against one of the invoice's installments.
     *
     * @param invoiceId the invoice's id
     * @param request   the payment data to register
     * @returns an observable emitting the updated invoice
     */
    registerPayment(invoiceId: string, request: RegisterPaymentRequest): Observable<InvoiceDto> {
        return this.http.patch<InvoiceDto>(`${this.baseUrl}/${invoiceId}/payments`, request);
    }

    /**
     * Cancels an invoice; idempotent on the backend.
     *
     * @param invoiceId the invoice's id
     * @returns an observable emitting the canceled invoice
     */
    cancel(invoiceId: string): Observable<InvoiceDto> {
        return this.http.patch<InvoiceDto>(`${this.baseUrl}/${invoiceId}/cancel`, {});
    }
}
