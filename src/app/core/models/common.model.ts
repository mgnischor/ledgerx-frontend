/**
 * Two shapes come back from the backend under this same name, depending on whether the
 * exception was caught by `GlobalExceptionHandler`:
 * - Handled exceptions (404/422/401/403): `{ timestamp, status, error, message, details }`,
 *   matching `ApiError.java` exactly — `details` is a plain string list, not a field->message map.
 * - Uncaught `@Valid` bean-validation failures (400) fall through to Spring Boot's default error
 *   body instead: `{ timestamp, status, error, path }`, with no `message` and no `details` at all.
 */
export interface ApiError {
    timestamp?: string;
    status: number;
    error: string;
    message?: string;
    details?: string[];
    path?: string;
}
