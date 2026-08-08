import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { CreateUserRequest, GrantRoleRequest, UserDto } from "../../models/identity.model";

/** HTTP client for the platform's user-management endpoints. */
@Injectable({ providedIn: "root" })
export class UserApi {
    private readonly baseUrl = `${environment.apiUrl}/users`;

    /** @param http the Angular HTTP client used to issue requests */
    constructor(private readonly http: HttpClient) {}

    /**
     * Registers a new user.
     *
     * @param request the user data to register
     * @returns an observable emitting the created user
     */
    register(request: CreateUserRequest): Observable<UserDto> {
        return this.http.post<UserDto>(this.baseUrl, request);
    }

    /**
     * Grants a role to a user; idempotent on the backend.
     *
     * @param userId  the user's id
     * @param request the role to grant
     * @returns an observable emitting the updated user
     */
    grantRole(userId: string, request: GrantRoleRequest): Observable<UserDto> {
        return this.http.patch<UserDto>(`${this.baseUrl}/${userId}/roles`, request);
    }

    /**
     * Deactivates a user; idempotent on the backend.
     *
     * @param userId the user's id
     * @returns an observable emitting the deactivated user
     */
    deactivate(userId: string): Observable<UserDto> {
        return this.http.patch<UserDto>(`${this.baseUrl}/${userId}/deactivate`, {});
    }
}
