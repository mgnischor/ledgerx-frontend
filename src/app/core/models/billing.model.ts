export type PartyType = "CUSTOMER" | "SUPPLIER";

export type DocumentType = "CPF" | "CNPJ";

export type InvoiceDirection = "RECEIVABLE" | "PAYABLE";

export type InvoiceStatus = "OPEN" | "PARTIALLY_PAID" | "PAID" | "CANCELED" | "OVERDUE";

export interface PartyDto {
    id: string;
    companyId: string;
    name: string;
    document: string;
    email: string;
    type: PartyType;
}

export interface CreatePartyRequest {
    name: string;
    document: string;
    documentType: DocumentType;
    email: string;
    type: PartyType;
}

export interface InvoiceDto {
    id: string;
    companyId: string;
    partyId: string;
    direction: InvoiceDirection;
    status: InvoiceStatus;
    installmentCount: number;
}

export interface CreateInvoiceRequest {
    companyId: string;
    partyId: string;
    direction: PartyType;
    installmentAmounts: number[];
    firstDueDate: string;
}

export interface RegisterPaymentRequest {
    installmentId: string;
    paidOn: string;
}
