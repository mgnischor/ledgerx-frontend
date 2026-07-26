export type CompanySize = "MEI" | "MICRO" | "SMALL";

export interface CompanyDto {
    id: string;
    legalName: string;
    tradeName: string;
    cnpj: string;
    size: CompanySize;
    active: boolean;
}

export interface CreateCompanyRequest {
    legalName: string;
    tradeName: string;
    cnpj: string;
    size: CompanySize;
    street: string;
    number: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}
