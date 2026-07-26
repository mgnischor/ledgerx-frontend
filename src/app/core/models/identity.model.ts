export type Role = "DEVELOPER" | "ADMINISTRATOR" | "MANAGER" | "COLLABORATOR";

export type Permission = "READ" | "CREATE" | "UPDATE" | "DELETE" | "APPROVE" | "DEBUG";

export interface UserDto {
    id: string;
    fullName: string;
    email: string;
    roles: Role[];
    active: boolean;
}

export interface CreateUserRequest {
    fullName: string;
    email: string;
    password: string;
}

export interface GrantRoleRequest {
    role: Role;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthenticationResultDto {
    accessToken: string;
    tokenType: string;
    expiresInSeconds: number;
}
