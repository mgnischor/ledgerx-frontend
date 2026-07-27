/** Brazilian regulatory size bracket for a company (`MEI`, micro, or small business). */
export type CompanySize = "MEI" | "MICRO" | "SMALL";

/**
 * A registered tenant company. Notably has no address fields — the backend's `CompanyDto` only
 * echoes back identity/status, not the address submitted at registration.
 */
export interface CompanyDto {
    id: string;
    legalName: string;
    tradeName: string;
    cnpj: string;
    size: CompanySize;
    active: boolean;
}

/** Payload for `POST /companies`. Address fields are flat (no nested object) to match the backend DTO. */
export interface CreateCompanyRequest {
    legalName: string;
    tradeName: string;
    cnpj: string;
    size: CompanySize;
    street: string;
    number: string;
    city: string;
    /** Two-letter Brazilian state code (UF), e.g. `SP`. */
    state: string;
    /** Brazilian CEP, either `NNNNNNNN` or `NNNNN-NNN`. */
    zipCode: string;
    country: string;
}
