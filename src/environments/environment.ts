/**
 * Development runtime configuration, used by `ng serve`.
 *
 * `apiUrl` is intentionally relative so requests stay same-origin and are forwarded to the
 * backend by the dev-server proxy configured in `proxy.conf.json` — this avoids CORS entirely and
 * mirrors how the production nginx image reverse-proxies `/api/` (see the Dockerfile).
 */
export const environment = {
    production: false,
    apiUrl: "/api/v1",
};
