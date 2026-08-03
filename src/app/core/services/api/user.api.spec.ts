import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { environment } from "../../../../environments/environment";
import { CreateUserRequest, GrantRoleRequest, UserDto } from "../../models/identity.model";
import { UserApi } from "./user.api";

describe("UserApi", () => {
    let api: UserApi;
    let httpMock: HttpTestingController;
    const userId = "user-1";
    const baseUrl = `${environment.apiUrl}/users`;

    const response: UserDto = {
        id: userId,
        fullName: "Jane Doe",
        email: "jane@example.com",
        roles: ["COLLABORATOR"],
        active: true,
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [UserApi, provideHttpClient(), provideHttpClientTesting()],
        });
        api = TestBed.inject(UserApi);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("registers a user", () => {
        const request: CreateUserRequest = { fullName: "Jane Doe", email: "jane@example.com", password: "secret" };

        api.register(request).subscribe((res) => expect(res).toEqual(response));

        const req = httpMock.expectOne(baseUrl);
        expect(req.request.method).toBe("POST");
        expect(req.request.body).toEqual(request);
        req.flush(response);
    });

    it("grants a role", () => {
        const request: GrantRoleRequest = { role: "MANAGER" };

        api.grantRole(userId, request).subscribe((res) => expect(res).toEqual(response));

        const req = httpMock.expectOne(`${baseUrl}/${userId}/roles`);
        expect(req.request.method).toBe("PATCH");
        expect(req.request.body).toEqual(request);
        req.flush(response);
    });

    it("deactivates a user", () => {
        api.deactivate(userId).subscribe();

        const req = httpMock.expectOne(`${baseUrl}/${userId}/deactivate`);
        expect(req.request.method).toBe("PATCH");
        expect(req.request.body).toEqual({});
        req.flush({});
    });
});
