/** Whether a {@link PartyDto} is on the receivable or payable side of billing. */
export type PartyType = "CUSTOMER" | "SUPPLIER";

/** Brazilian document type backing a party's {@link PartyDto.document}. */
export type DocumentType = "CPF" | "CNPJ";

/**
 * Direction of an invoice. Confusingly, the backend reuses {@link PartyType} for this field on the
 * wire (`CUSTOMER`/`SUPPLIER`) rather than these more descriptive names; this alias exists for
 * readability at call sites that don't need the party-specific type.
 */
export type InvoiceDirection = "RECEIVABLE" | "PAYABLE";

/** Lifecycle state of an invoice. */
export type InvoiceStatus = "OPEN" | "PARTIALLY_PAID" | "PAID" | "CANCELED" | "OVERDUE";

/** A customer or supplier a company can issue invoices to/from. */
export interface PartyDto {
    id: string;
    companyId: string;
    name: string;
    /** Raw CPF or CNPJ digits/formatting as submitted; the document type itself is not echoed back. */
    document: string;
    email: string;
    type: PartyType;
}

/** Payload for `POST /companies/{companyId}/parties`. */
export interface CreatePartyRequest {
    name: string;
    document: string;
    documentType: DocumentType;
    email: string;
    type: PartyType;
}

/**
 * An issued invoice. Notably, the backend's `InvoiceDto` only carries `installmentCount`, never
 * the individual installment IDs — see {@link RegisterPaymentRequest} for the workaround this
 * forces on the payment flow.
 */
export interface InvoiceDto {
    id: string;
    companyId: string;
    partyId: string;
    direction: InvoiceDirection;
    status: InvoiceStatus;
    installmentCount: number;
}

/** Payload for `POST /invoices`. */
export interface CreateInvoiceRequest {
    companyId: string;
    partyId: string;
    /** Wire value is a {@link PartyType}, not an {@link InvoiceDirection}; see that type's note. */
    direction: PartyType;
    /** Up to 60 entries; each becomes one installment due monthly starting on `firstDueDate`. */
    installmentAmounts: number[];
    /** ISO local date (`YYYY-MM-DD`) of the first installment's due date; cannot be in the past. */
    firstDueDate: string;
}

/**
 * Payload for `PATCH /invoices/{invoiceId}/payments`.
 *
 * `installmentId` cannot be discovered through the API (see {@link InvoiceDto}'s note), so the UI
 * currently asks the operator to supply it from an out-of-band source (e.g. Swagger).
 */
export interface RegisterPaymentRequest {
    installmentId: string;
    /** ISO local date (`YYYY-MM-DD`) the payment was made; cannot be in the future. */
    paidOn: string;
}
