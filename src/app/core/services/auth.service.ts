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

    /** Whether a live session exists, i.e. a stored session whose token has not expired yet. */
    readonly isAuthenticated = computed(() => {
        const session = this.session();
        return !!session && session.expiresAt > Date.now();
    });

    /** Email of the signed-in user, or `null` when no session is active. */
    readonly currentEmail = computed(() => this.session()?.email ?? null);

    /** Roles granted to the active session, or an empty array when signed out. */
    readonly roles = computed(() => this.session()?.roles ?? []);

    /** Permissions granted to the active session, or an empty array when signed out. */
    readonly permissions = computed(() => this.session()?.permissions ?? []);

    /** @param http the Angular HTTP client used to call the authentication endpoints */
    constructor(private readonly http: HttpClient) {}

    /** The active session's raw JWT access token, or `null` when signed out. */
    get accessToken(): string | null {
        return this.session()?.accessToken ?? null;
    }

    /**
     * Authenticates the user, stores the resulting {@link Session}, and persists it to
     * `localStorage` so the login survives a page reload.
     *
     * @param request the credentials to authenticate with
     * @returns an observable emitting the raw authentication result once the session is stored
     */
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

    /** Clears the active session from memory and from `localStorage`. */
    logout(): void {
        this.session.set(null);
        localStorage.removeItem(STORAGE_KEY);
    }

    /**
     * Whether the active session holds at least one of the given roles.
     *
     * @param roles the roles to test for
     * @returns `true` if any of the roles is present, otherwise `false`
     */
    hasRole(...roles: Role[]): boolean {
        return roles.some((role) => this.roles().includes(role));
    }

    /**
     * Whether the active session holds at least one of the given permissions.
     *
     * @param permissions the permissions to test for
     * @returns `true` if any of the permissions is present, otherwise `false`
     */
    hasPermission(...permissions: Permission[]): boolean {
        return permissions.some((permission) => this.permissions().includes(permission));
    }

    /**
     * Decodes the payload of a JWT without verifying its signature.
     *
     * @param token the JWT to decode
     * @returns the decoded claims, or `{ sub: "" }` if the token cannot be parsed
     */
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

    /**
     * Reads a previously persisted session from `localStorage`, discarding it when expired or
     * malformed.
     *
     * @returns the restored session, or `null` when absent, expired, or unparseable
     */
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
