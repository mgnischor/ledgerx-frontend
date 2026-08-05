import { Injectable, computed, inject, signal } from "@angular/core";
import { CompanyDto } from "../models/company.model";
import { CompanyApi } from "./api/company.api";

const STORAGE_KEY = "ledgerx.known-companies";
const SELECTED_KEY = "ledgerx.selected-company";

/**
 * Companies have no per-user membership: any authorized caller can see every company via
 * {@code GET /api/v1/companies}. {@link refresh} pulls that full list so a user (e.g. the
 * DEVELOPER bootstrap admin) has every tenant available, not just ones created/added in this
 * browser. The client-side cache is kept as a fallback so the last known list still renders
 * before {@link refresh} resolves (e.g. briefly offline).
 */
@Injectable({ providedIn: "root" })
export class CompanyContextService {
    private readonly companyApi = inject(CompanyApi);

    private readonly companies = signal<CompanyDto[]>(this.restore());
    private readonly selectedId = signal<string | null>(localStorage.getItem(SELECTED_KEY));

    readonly knownCompanies = this.companies.asReadonly();
    readonly selectedCompany = computed(
        () => this.companies().find((company) => company.id === this.selectedId()) ?? null,
    );

    /** Fetches every company from the backend and replaces the known/cached list with it. */
    refresh(): void {
        this.companyApi.list().subscribe((companies) => {
            this.companies.set(companies);
            this.persist();
            if (!this.selectedId() && companies.length > 0) {
                this.select(companies[0].id);
            }
        });
    }

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
