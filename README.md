# 🏦 LedgerX Frontend

An Angular web application for **LedgerX** — the financial management platform for micro and small businesses.

Cash accounts, income and expense tracking, accounts receivable and payable, budgets, recurring transactions, and cash-flow reporting, rendered as a single-page app on top of the [LedgerX backend](https://github.com/nischor/ledgerx-backend) REST API.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.0.8.

> **Status:** early-stage. The foundation (auth, layout, routing, API integration) and a working screen per backend bounded context are in place; there is no automated test coverage yet beyond the CLI-generated `app.spec.ts`, and a few backend API gaps (noted below) shape parts of the UI.

## 🧭 Table of Contents

- [Architecture](#-architecture)
- [Features](#features)
- [Technology Stack](#-technology-stack)
- [Backend Integration](#-backend-integration)
- [Known Backend Limitations](#-known-backend-limitations)
- [Authentication](#authentication)
- [Running Locally](#-running-locally)
- [Environment Configuration](#-environment-configuration)
- [Code Scaffolding](#-code-scaffolding)
- [Testing](#-testing)
- [Building](#-building)
- [Repository Structure](#-repository-structure)
- [Contributing](#-contributing)
- [License](#-license)
- [Additional Resources](#-additional-resources)

## 🏗️ Architecture

The app is a standalone-components, signals-based Angular SPA with routes lazy-loaded per feature.

```text
┌─────────────────────────────────────────────────────────────────┐
│  features/                                                      │  ← user-facing pages
│  auth, dashboard, companies, financial-accounts, categories,    │
│  transactions, budgets, recurring-transactions, parties,        │
│  invoices, notifications, users — one lazy route per feature    │
├─────────────────────────────────────────────────────────────────┤
│  layout/shell                                                   │  ← app shell
│  Sidebar navigation, topbar, company switcher                   │
├─────────────────────────────────────────────────────────────────┤
│  shared/                                                        │  ← reusable building blocks
│  Presentational components (empty state, toast container)       │
├─────────────────────────────────────────────────────────────────┤
│  core/                                                          │  ← app-wide concerns
│  models/    — TypeScript interfaces mirroring backend DTOs      │
│  services/  — AuthService, CompanyContextService, ToastService, │
│               one HTTP API service per bounded context          │
│  guards/    — authGuard, guestGuard, roleGuard                  │
│  interceptors/ — JWT attachment, global error → toast handling  │
└─────────────────────────────────────────────────────────────────┘
```

### Dependency Rule

- `features` inject `core` services and compose `shared` presentational components; they never call `HttpClient` directly.
- Every backend bounded context has exactly one API service under `core/services/api/*`, matching the backend's own context boundaries (identity, company, accounting, billing, reporting, notification).
- `shared` is presentational and has no knowledge of features or the API.
- `layout/shell` and routing/guards/interceptors wire everything together at bootstrap, configured in `app.config.ts` and `app.routes.ts`.

## Features

| Feature                | Folder                              | Backend context / endpoints consumed                                                   |
| ----------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------- |
| Auth                    | `features/auth`                      | `identity` — `POST /auth/login`                                                          |
| Dashboard               | `features/dashboard`                 | `reporting` — cash-flow summary; `notification` — recent activity preview                |
| Companies               | `features/companies`                 | `company` — register, deactivate (see [known limitations](#-known-backend-limitations)) |
| Financial Accounts      | `features/financial-accounts`        | `accounting` — create, list, deactivate financial accounts                               |
| Categories              | `features/categories`                | `accounting` — create, list income/expense/transfer categories                           |
| Transactions            | `features/transactions`              | `accounting` — record transactions, transfer funds between accounts                      |
| Budgets                 | `features/budgets`                   | `accounting` — create, list, check status, deactivate monthly budgets                    |
| Recurring Transactions  | `features/recurring-transactions`    | `accounting` — create, list, deactivate rules; trigger `generate-due`                    |
| Parties                 | `features/parties`                   | `billing` — create, list customers/suppliers                                             |
| Invoices                | `features/invoices`                  | `billing` — issue, look up, register payments, cancel invoices                           |
| Notifications           | `features/notifications`             | `notification` — list, filter unread, mark as read                                       |
| Users                   | `features/users`                     | `identity` — register users, grant roles, deactivate (DEVELOPER/ADMINISTRATOR only)      |

## 🛠️ Technology Stack

| Layer           | Technology                                         |
| ---------------- | --------------------------------------------------- |
| Language          | TypeScript, HTML5, SCSS                            |
| Framework          | Angular 22, generated with Angular CLI 22.0.8      |
| Component model    | Standalone components, signals, lazy-loaded routes |
| HTTP & state       | `HttpClient`, RxJS, functional HTTP interceptors   |
| Styling            | Hand-rolled SCSS design system (`src/styles.scss`) — cards, forms, tables, badges, toasts |
| Unit testing       | Vitest through `ng test`                           |
| Build              | Angular CLI (esbuild + Vite dev server)            |
| Package manager    | pnpm (see `packageManager` in `package.json`)      |

## 🔌 Backend Integration

The frontend calls the LedgerX backend REST API, versioned under `/api/v1`, directly — there is currently **no dev-server proxy**; `environment.ts` points `apiUrl` straight at `https://localhost:8080/api/v1`. Because the backend serves a self-signed TLS certificate that is regenerated on every restart, open `https://localhost:8080` once in the browser and accept the certificate before the SPA's requests will succeed.

Endpoints consumed by the UI:

### Identity & Company

| Method | Path                                  | Used for                                    |
| ------ | -------------------------------------- | -------------------------------------------- |
| POST   | `/api/v1/auth/login`                   | Password login — returns a signed JWT       |
| POST   | `/api/v1/users`                        | User registration                           |
| PATCH  | `/api/v1/users/{userId}/roles`         | Role granting                               |
| PATCH  | `/api/v1/users/{userId}/deactivate`    | User deactivation                           |
| POST   | `/api/v1/companies`                    | Company registration                        |
| PATCH  | `/api/v1/companies/{companyId}/deactivate` | Company deactivation                    |

### Accounting

| Method     | Path                                                                       | Used for                              |
| ---------- | ---------------------------------------------------------------------------- | -------------------------------------- |
| GET / POST | `/api/v1/companies/{companyId}/financial-accounts`                           | Account list and creation             |
| PATCH      | `/api/v1/companies/{companyId}/financial-accounts/{accountId}/deactivate`    | Account deactivation                  |
| GET / POST | `/api/v1/companies/{companyId}/categories`                                   | Income/expense/transfer categories    |
| POST       | `/api/v1/transactions`                                                        | Record income or expense              |
| POST       | `/api/v1/transfers`                                                           | Move funds between accounts           |
| GET / POST | `/api/v1/companies/{companyId}/budgets`                                       | Budget planning                       |
| GET        | `/api/v1/companies/{companyId}/budgets/{budgetId}/status`                     | Spent vs. remaining amount            |
| PATCH      | `/api/v1/companies/{companyId}/budgets/{budgetId}/deactivate`                 | Budget deactivation                   |
| GET / POST | `/api/v1/companies/{companyId}/recurring-transactions`                        | Recurring rule list and creation      |
| POST       | `/api/v1/companies/{companyId}/recurring-transactions/generate-due`           | Materialize currently due rules       |
| PATCH      | `/api/v1/companies/{companyId}/recurring-transactions/{ruleId}/deactivate`    | Recurring rule deactivation           |

### Billing, Reporting & Notifications

| Method     | Path                                              | Used for                         |
| ---------- | --------------------------------------------------- | ----------------------------------- |
| GET / POST | `/api/v1/companies/{companyId}/parties`             | Customers and suppliers            |
| POST       | `/api/v1/invoices`                                  | Issue invoices with installments   |
| GET        | `/api/v1/invoices/{invoiceId}`                      | Look up an invoice                 |
| PATCH      | `/api/v1/invoices/{invoiceId}/payments`             | Register a payment                 |
| PATCH      | `/api/v1/invoices/{invoiceId}/cancel`               | Cancel an invoice                  |
| GET        | `/api/v1/companies/{companyId}/reports/cash-flow`   | Dashboard cash-flow summary        |
| GET        | `/api/v1/notifications?unreadOnly=true`             | Notification badge and feed        |
| PATCH      | `/api/v1/notifications/{notificationId}/read`       | Mark a notification as read        |

Every backend endpoint is documented with springdoc-openapi at `https://localhost:8080/swagger-ui/index.html` (JSON at `/v3/api-docs`), permitted without authentication in local development — useful when wiring a new screen to an endpoint.

## ⚠️ Known Backend Limitations

Two gaps in the current backend API (see the backend's `BUSINESS_RULES.md` → *Known Gaps*) shape parts of the UI, and are called out inline where they matter:

- **No "list companies" endpoint.** `CompanyController` only exposes `POST` and `PATCH .../deactivate` — there is no `GET /api/v1/companies`. The frontend works around this with `CompanyContextService`, which remembers every company you register or select in `localStorage` and offers it as the active company context. Companies created from another browser/session are invisible until re-registered or manually noted.
- **`InvoiceDto` does not expose installment IDs.** The DTO only carries `installmentCount`, never the individual installment identifiers needed by `PATCH /invoices/{invoiceId}/payments`. The Invoices screen asks you to paste the installment ID from another source (e.g. Swagger) when registering a payment.

## Authentication

The backend ships an idempotent bootstrap account for local development:

- **Email:** `admin@ledgerx.local`
- **Password:** `ChangeMe@2026`

⚠️ Change this password before deploying anywhere other than local development.

The frontend currently implements **password login with JWT only** (`POST /api/v1/auth/login`); the backend's OAuth2 Authorization Code + PKCE flow is not yet wired up on the frontend.

- `AuthService` decodes the JWT payload client-side (it is not treated as opaque) to read the `roles` and `permissions` claims and drive role-based UI (e.g. the Users screen is gated to `DEVELOPER`/`ADMINISTRATOR` via `roleGuard`).
- The session (token, decoded roles/permissions, expiry) is persisted to `localStorage` so a refresh doesn't force a re-login.
- `authInterceptor` attaches `Authorization: Bearer <token>` to every request; `errorInterceptor` logs the user out and redirects to `/login` on any `401 Unauthorized`, and surfaces every other backend error through a toast.
- `authGuard` / `guestGuard` gate the authenticated shell and the login page respectively; `roleGuard(...roles)` gates individual routes.

## 🚀 Running Locally

### Prerequisites

- Node.js 22 LTS or newer
- pnpm (the project pins `packageManager: pnpm@10.33.0`)
- A running [LedgerX backend](https://github.com/nischor/ledgerx-backend) — `docker compose up -d --build` starts the API, PostgreSQL, RabbitMQ, and Grafana LGTM
- A browser that has accepted the backend's self-signed certificate at `https://localhost:8080`

### Setup

```bash
git clone https://github.com/nischor/ledgerx-frontend.git
cd ledgerx-frontend
pnpm install
```

### Start the development server

```bash
pnpm start
# equivalent to: ng serve
```

Once the server is running, open your browser at `http://localhost:4200/`. The application reloads automatically whenever you modify source files.

## 🧩 Environment Configuration

Runtime settings live in `src/environments/`:

```ts
// environment.ts — used by `ng serve`
export const environment = {
    production: false,
    apiUrl: "https://localhost:8080/api/v1",
};

// environment.prod.ts — swapped in by `ng build` via fileReplacements
export const environment = {
    production: true,
    apiUrl: "/api/v1",
};
```

`angular.json`'s production build configuration replaces `environment.ts` with `environment.prod.ts`, so a production deployment is expected to sit behind a reverse proxy that serves the SPA and forwards `/api/v1` to the backend. Keep secrets out of both files — anything shipped to the browser is public.

## 🧱 Code Scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

Prefer generating inside the owning feature (e.g. `ng generate component features/billing/invoice-list`) so the feature-first structure stays intact.

## 🧪 Testing

### Unit tests

```bash
ng test
```

Runs through the [Vitest](https://vitest.dev/) test runner. At the moment only the CLI-generated `app.spec.ts` exists — there is no `HttpTestingController` coverage for the API services yet. This is a good area to contribute to.

### End-to-end tests

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default; none is configured yet.

## 📦 Building

```bash
ng build
```

Compiles the project and stores build artifacts in `dist/`. The production configuration applies tree-shaking, per-route code splitting, and hashed filenames for long-term caching.

## 📁 Repository Structure

```text
ledgerx-frontend/
 ├── src/
 │   ├── app/
 │   │   ├── core/
 │   │   │   ├── models/          # TypeScript interfaces mirroring backend DTOs
 │   │   │   ├── services/
 │   │   │   │   ├── api/         # one HTTP service per bounded context
 │   │   │   │   ├── auth.service.ts
 │   │   │   │   ├── company-context.service.ts
 │   │   │   │   └── toast.service.ts
 │   │   │   ├── guards/          # authGuard, guestGuard, roleGuard
 │   │   │   └── interceptors/    # JWT attachment, global error handling
 │   │   ├── layout/
 │   │   │   └── shell/           # sidebar + topbar app shell
 │   │   ├── shared/
 │   │   │   └── components/      # empty-state, toast-container
 │   │   └── features/            # one lazy-loaded feature per bounded context
 │   │       ├── auth/
 │   │       ├── dashboard/
 │   │       ├── companies/
 │   │       ├── financial-accounts/
 │   │       ├── categories/
 │   │       ├── transactions/
 │   │       ├── budgets/
 │   │       ├── recurring-transactions/
 │   │       ├── parties/
 │   │       ├── invoices/
 │   │       ├── notifications/
 │   │       └── users/
 │   ├── environments/            # environment.ts / environment.prod.ts
 │   ├── styles.scss              # global SCSS design system
 │   ├── index.html
 │   └── main.ts
 ├── public/                      # static assets (favicon, etc.)
 ├── angular.json
 ├── package.json
 ├── tsconfig.json
 └── README.md
```

## 🤝 Contributing

Contributions are welcome.

Before opening a pull request:

- Read the backend's [BUSINESS_RULES.md](https://github.com/nischor/ledgerx-backend/blob/main/BUSINESS_RULES.md) — the 127 documented rules are the source of truth, and the UI must respect them rather than re-implement them.
- Preserve the architecture:
    - features never call `HttpClient` directly — go through a `core/services/api` service;
    - keep `shared` presentational and feature-agnostic;
    - new screens belong to the feature that matches their bounded context.
- Ensure the build passes:

```bash
ng build
ng test
```

- Surface backend failures with the structured `ApiError` payload — never a raw stack trace (the global `errorInterceptor` already handles this for most cases).
- Keep tests meaningful and aligned with the existing architecture.

## 📄 License

This project is open-source. See the [LICENSE](LICENSE.md) file for details.

## 📖 Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

<p align="center">
<sub>Built with Angular 22, TypeScript, and the LedgerX backend.</sub>
</p>
