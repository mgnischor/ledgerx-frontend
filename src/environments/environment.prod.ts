/**
 * Production runtime configuration, swapped in for {@link environment} by `ng build` via the
 * `fileReplacements` entry in `angular.json`.
 *
 * `apiUrl` stays relative: the production deployment is expected to sit behind a reverse proxy
 * (the nginx image built by this repo's Dockerfile) that serves the SPA and forwards `/api/v1` to
 * the backend.
 */
export const environment = {
    production: true,
    apiUrl: "/api/v1",
};
