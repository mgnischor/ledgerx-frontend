import { Injectable, computed, signal } from "@angular/core";
import { CompanyDto } from "../models/company.model";

const STORAGE_KEY = "ledgerx.known-companies";
const SELECTED_KEY = "ledgerx.selected-company";

/**
 * The API has no "list companies" endpoint (BUSINESS_RULES.md / company controller only exposes
 * create and deactivate), so known companies are tracked client-side: every company created or
 * manually added through the UI is remembered here and offered as the active company context.
 */
@Injectable({ providedIn: "root" })
export class CompanyContextService {
    private readonly companies = signal<CompanyDto[]>(this.restore());
    private readonly selectedId = signal<string | null>(localStorage.getItem(SELECTED_KEY));

    readonly knownCompanies = this.companies.asReadonly();
    readonly selectedCompany = computed(
        () => this.companies().find((company) => company.id === this.selectedId()) ?? null,
    );

    remember(company: CompanyDto): void {
        this.companies.update((companies) => {
            const withoutExisting = companies.filter((c) => c.id !== company.id);
            return [...withoutExisting, company];
        });
        this.persist();
        if (!this.selectedId()) {
            this.select(company.id);
        }
    }

    forget(companyId: string): void {
        this.companies.update((companies) => companies.filter((c) => c.id !== companyId));
        this.persist();
        if (this.selectedId() === companyId) {
            this.selectedId.set(null);
            localStorage.removeItem(SELECTED_KEY);
        }
    }

    select(companyId: string): void {
        this.selectedId.set(companyId);
        localStorage.setItem(SELECTED_KEY, companyId);
    }

    private persist(): void {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.companies()));
    }

    private restore(): CompanyDto[] {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? (JSON.parse(raw) as CompanyDto[]) : [];
        } catch {
            return [];
        }
    }
}
