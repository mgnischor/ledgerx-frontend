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

    /** Read-only view of every company currently known to the context (cached or freshly loaded). */
    readonly knownCompanies = this.companies.asReadonly();
    /** The currently selected company, or `null` when none is selected. */
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

    /**
     * Upserts a company into the known/cached list, persisting it and selecting it when nothing is
     * selected yet.
     *
     * @param company the company to add or refresh
     */
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

    /**
     * Removes a company from the known/cached list, clearing the selection if it was selected.
     *
     * @param companyId the id of the company to forget
     */
    forget(companyId: string): void {
        this.companies.update((companies) => companies.filter((c) => c.id !== companyId));
        this.persist();
        if (this.selectedId() === companyId) {
            this.selectedId.set(null);
            localStorage.removeItem(SELECTED_KEY);
        }
    }

    /**
     * Selects a company as the active one, persisting the choice across reloads.
     *
     * @param companyId the id of the company to select
     */
    select(companyId: string): void {
        this.selectedId.set(companyId);
        localStorage.setItem(SELECTED_KEY, companyId);
    }

    /** Writes the current known-company list to `localStorage`. */
    private persist(): void {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.companies()));
    }

    /**
     * Reads the previously cached known-company list from `localStorage`.
     *
     * @returns the restored companies, or an empty array when absent or malformed
     */
    private restore(): CompanyDto[] {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? (JSON.parse(raw) as CompanyDto[]) : [];
        } catch {
            return [];
        }
    }
}
