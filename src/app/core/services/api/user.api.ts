import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { CreateUserRequest, GrantRoleRequest, UserDto } from "../../models/identity.model";

@Injectable({ providedIn: "root" })
export class UserApi {
    private readonly baseUrl = `${environment.apiUrl}/users`;

    constructor(private readonly http: HttpClient) {}

    register(request: CreateUserRequest): Observable<UserDto> {
        return this.http.post<UserDto>(this.baseUrl, request);
    }

    grantRole(userId: string, request: GrantRoleRequest): Observable<UserDto> {
        return this.http.patch<UserDto>(`${this.baseUrl}/${userId}/roles`, request);
    }

    deactivate(userId: string): Observable<UserDto> {
        return this.http.patch<UserDto>(`${this.baseUrl}/${userId}/deactivate`, {});
    }
}
