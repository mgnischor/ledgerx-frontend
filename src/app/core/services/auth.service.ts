import { HttpClient } from "@angular/common/http";
import { Injectable, computed, signal } from "@angular/core";
import { Observable, tap } from "rxjs";
import { environment } from "../../../environments/environment";
import { AuthenticationResultDto, LoginRequest, Permission, Role } from "../models/identity.model";

interface JwtClaims {
    sub: string;
    roles?: Role[];
    permissions?: Permission[];
    exp?: number;
}

interface Session {
    accessToken: string;
    email: string;
    roles: Role[];
    permissions: Permission[];
    expiresAt: number;
}

const STORAGE_KEY = "ledgerx.session";

@Injectable({ providedIn: "root" })
export class AuthService {
    private readonly session = signal<Session | null>(this.restoreSession());

    readonly isAuthenticated = computed(() => {
        const session = this.session();
        return !!session && session.expiresAt > Date.now();
    });
    readonly currentEmail = computed(() => this.session()?.email ?? null);
    readonly roles = computed(() => this.session()?.roles ?? []);
    readonly permissions = computed(() => this.session()?.permissions ?? []);

    constructor(private readonly http: HttpClient) {}

    get accessToken(): string | null {
        return this.session()?.accessToken ?? null;
    }

    login(request: LoginRequest): Observable<AuthenticationResultDto> {
        return this.http.post<AuthenticationResultDto>(`${environment.apiUrl}/auth/login`, request).pipe(
            tap((result) => {
                const claims = this.decodeClaims(result.accessToken);
                const session: Session = {
                    accessToken: result.accessToken,
                    email: claims.sub || request.email,
                    roles: claims.roles ?? [],
                    permissions: claims.permissions ?? [],
                    expiresAt: Date.now() + result.expiresInSeconds * 1000,
                };
                this.session.set(session);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
            }),
        );
    }

    logout(): void {
        this.session.set(null);
        localStorage.removeItem(STORAGE_KEY);
    }

    hasRole(...roles: Role[]): boolean {
        return roles.some((role) => this.roles().includes(role));
    }

    hasPermission(...permissions: Permission[]): boolean {
        return permissions.some((permission) => this.permissions().includes(permission));
    }

    private decodeClaims(token: string): JwtClaims {
        try {
            const payload = token.split(".")[1];
            const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
            const json = decodeURIComponent(
                atob(normalized)
                    .split("")
                    .map((char) => "%" + char.charCodeAt(0).toString(16).padStart(2, "0"))
                    .join(""),
            );
            return JSON.parse(json) as JwtClaims;
        } catch {
            return { sub: "" };
        }
    }

    private restoreSession(): Session | null {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return null;
        }
        try {
            const session = JSON.parse(raw) as Session;
            return session.expiresAt > Date.now() ? session : null;
        } catch {
            return null;
        }
    }
}
