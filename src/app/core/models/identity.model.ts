/** A role granted to a user; each maps to a fixed set of {@link Permission}s on the backend. */
export type Role = "DEVELOPER" | "ADMINISTRATOR" | "MANAGER" | "COLLABORATOR";

/** A fine-grained authority derived from a user's {@link Role}s and embedded in the JWT. */
export type Permission = "READ" | "CREATE" | "UPDATE" | "DELETE" | "APPROVE" | "DEBUG";

/** A registered platform user. */
export interface UserDto {
    id: string;
    fullName: string;
    email: string;
    roles: Role[];
    active: boolean;
}

/** Payload for `POST /users`. */
export interface CreateUserRequest {
    fullName: string;
    email: string;
    password: string;
}

/** Payload for `PATCH /users/{userId}/roles`. */
export interface GrantRoleRequest {
    role: Role;
}

/** Payload for `POST /auth/login`. */
export interface LoginRequest {
    email: string;
    password: string;
}

/** Response of `POST /auth/login`: an Ed25519-signed JWT and its declared lifetime. */
export interface AuthenticationResultDto {
    accessToken: string;
    tokenType: string;
    expiresInSeconds: number;
}
