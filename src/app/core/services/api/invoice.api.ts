import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { CreateInvoiceRequest, InvoiceDto, RegisterPaymentRequest } from "../../models/billing.model";

@Injectable({ providedIn: "root" })
export class InvoiceApi {
    private readonly baseUrl = `${environment.apiUrl}/invoices`;

    constructor(private readonly http: HttpClient) {}

    issue(request: CreateInvoiceRequest): Observable<InvoiceDto> {
        return this.http.post<InvoiceDto>(this.baseUrl, request);
    }

    getById(invoiceId: string): Observable<InvoiceDto> {
        return this.http.get<InvoiceDto>(`${this.baseUrl}/${invoiceId}`);
    }

    registerPayment(invoiceId: string, request: RegisterPaymentRequest): Observable<InvoiceDto> {
        return this.http.patch<InvoiceDto>(`${this.baseUrl}/${invoiceId}/payments`, request);
    }

    cancel(invoiceId: string): Observable<InvoiceDto> {
        return this.http.patch<InvoiceDto>(`${this.baseUrl}/${invoiceId}/cancel`, {});
    }
}
