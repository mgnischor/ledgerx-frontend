# 🏦 LedgerX Frontend

An open-source Angular web application for **LedgerX** — the financial management platform for micro and small businesses.

Cash accounts, income and expense tracking, accounts receivable and payable, budgets, recurring transactions, and cash-flow reporting — rendered as a fast, responsive SPA on top of the LedgerX REST API.

https://img.shields.io/badge/Angular-22-DD0031?logo=angular
https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript
https://img.shields.io/badge/Vitest-unit_tests-6E9F18?logo=vitest
https://img.shields.io/badge/Node-22_LTS-5FA04E?logo=nodedotjs
https://img.shields.io/badge/Open_Source-blue

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.0.8.

## ✨ Why LedgerX Frontend?

|                               |                                                                                                                                                                               |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🎯 Feature-first structure    | One lazy-loaded feature per backend bounded context — `identity`, `company`, `accounting`, `billing`, `reporting`, `notification` — so the UI maps 1:1 to the domain.         |
| 🔐 Security-aware by default  | JWT bearer tokens attached by an HTTP interceptor, opaque-token handling, and first-class support for the backend's OAuth2 Authorization Code + PKCE flow for public clients. |
| ⚡ Modern Angular             | Standalone components, signals-based state, lazy routes, and esbuild-powered builds. No NgModules, no legacy boilerplate.                                                     |
| 🧪 Testable                   | Vitest-based unit tests through `ng test`, with `HttpTestingController` coverage for every API service.                                                                       |
| 🚀 Zero-friction local setup  | One `npm start`, a dev proxy to the LedgerX backend, and automatic reload whenever you modify any of the source files.                                                        |
| 🇧🇷 Built for the same reality | pt_BR formatting for dates, BRL currency, and CPF/CNPJ documents — matching the backend's sample data.                                                                        |

## 🧭 Table of Contents

[Architecture](#-architecture)
[Features](#features)
[Technology Stack](#-technology-stack)
[Backend Integration](#-backend-integration)
[API Documentation](#api-documentation)
[Authentication](#authentication)
[Running Locally](#-running-locally)
[Environment Configuration](#-environment-configuration)
[Code Scaffolding](#-code-scaffolding)
[Testing](#-testing)
[Building](#-building)
[Repository Structure](#-repository-structure)
[Contributing](#-contributing)
[License](#-license)
[Additional Resources](#-additional-resources)

## 🏗️ Architecture

LedgerX Frontend is organized as a **feature-first** Angular application. Each business feature maps to one backend bounded context and is lazy-loaded behind its own route, while cross-cutting concerns live in `core`, `shared`, and `data`.

```
┌─────────────────────────────────────────────────────────────────┐
│  features/                                                      │  ← user-facing pages
│  auth, dashboard, accounts, transactions, budgets,              │
│  billing, notifications — one lazy route per feature            │
├─────────────────────────────────────────────────────────────────┤
│  data/                                                          │  ← API integration
│  HTTP services, DTO models, auth + error interceptors           │
├─────────────────────────────────────────────────────────────────┤
│  shared/                                                        │  ← reusable building blocks
│  Presentational components, pipes (BRL, CPF/CNPJ, dates),       │
│  directives, form validators                                    │
├─────────────────────────────────────────────────────────────────┤
│  core/                                                          │  ← app shell
│  Root layout, routing, route guards, theming, configuration     │
└─────────────────────────────────────────────────────────────────┘
```

### Dependency Rule

- `features` compose pages from `shared` building blocks and consume `data` services.
- `data` is the **only** layer allowed to talk to `HttpClient` — features never call the API directly.
- `shared` is presentational and has no knowledge of features or the API.
- `core` wires the shell, guards, and interceptors together at bootstrap.

This keeps the UI testable, the API surface in one place, and every feature independently loadable.

## Features

| Feature            | Folder                   | Backend context consumed                                        |
| ------------------ | ------------------------ | --------------------------------------------------------------- |
| Auth               | `features/auth`          | `identity` — password login and user registration               |
| Dashboard          | `features/dashboard`     | `reporting` — cash-flow summary for a date range                |
| Companies          | `features/companies`     | `company` — tenant registration and profile                     |
| Financial accounts | `features/accounts`      | `accounting` — accounts and income/expense categories           |
| Transactions       | `features/transactions`  | `accounting` — income, expenses, transfers, and recurring rules |
| Budgets            | `features/budgets`       | `accounting` — monthly budgets with spent/remaining status      |
| Billing            | `features/billing`       | `billing` — customers, suppliers, invoices, and installments    |
| Notifications      | `features/notifications` | `notification` — in-app feed populated from domain events       |

## 🛠️ Technology Stack

| Layer           | Technology                                         |
| --------------- | -------------------------------------------------- |
| Language        | TypeScript, HTML5, CSS3                            |
| Framework       | Angular 22, generated with Angular CLI 22.0.8      |
| Component model | Standalone components, signals, lazy-loaded routes |
| HTTP & state    | `HttpClient`, RxJS, HTTP interceptors              |
| Styling         | SCSS with a shared design-token layer              |
| Unit testing    | Vitest through `ng test`                           |
| E2E testing     | Runner of your choice through `ng e2e`             |
| Build           | Angular CLI (esbuild + Vite dev server)            |
| Local tooling   | Node.js 22 LTS                                     |

## 🔌 Backend Integration

The frontend consumes the LedgerX backend REST API, versioned under `/api/v1`. In local development the dev server proxies `/api` and `/oauth2` to `https://localhost:8080` (see [Running Locally](#-running-locally)).

Endpoints consumed by the UI:

### Identity & Company

| Method | Path                           | Used for                              |
| ------ | ------------------------------ | ------------------------------------- |
| POST   | `/api/v1/auth/login`           | Password login — returns a signed JWT |
| POST   | `/api/v1/users`                | User registration                     |
| PATCH  | `/api/v1/users/{userId}/roles` | Role management                       |
| POST   | `/api/v1/companies`            | Company onboarding                    |

### Accounting

| Method     | Path                                                                | Used for                        |
| ---------- | ------------------------------------------------------------------- | ------------------------------- |
| GET / POST | `/api/v1/companies/{companyId}/financial-accounts`                  | Account list and creation       |
| GET / POST | `/api/v1/companies/{companyId}/categories`                          | Income and expense categories   |
| POST       | `/api/v1/transactions`                                              | Record income or expense        |
| POST       | `/api/v1/transfers`                                                 | Move funds between accounts     |
| GET / POST | `/api/v1/companies/{companyId}/budgets`                             | Budget planning                 |
| GET        | `/api/v1/companies/{companyId}/budgets/{budgetId}/status`           | Spent vs. remaining amount      |
| POST       | `/api/v1/companies/{companyId}/recurring-transactions/generate-due` | Materialize currently due rules |

### Billing, Reporting & Notifications

| Method     | Path                                              | Used for                         |
| ---------- | ------------------------------------------------- | -------------------------------- |
| GET / POST | `/api/v1/companies/{companyId}/parties`           | Customers and suppliers          |
| POST       | `/api/v1/invoices`                                | Issue invoices with installments |
| PATCH      | `/api/v1/invoices/{invoiceId}/payments`           | Register payments                |
| GET        | `/api/v1/companies/{companyId}/reports/cash-flow` | Dashboard cash-flow summary      |
| GET        | `/api/v1/notifications?unreadOnly=true`           | Notification badge and feed      |
| PATCH      | `/api/v1/notifications/{notificationId}/read`     | Mark a notification as read      |

## API Documentation

Every backend endpoint is documented with springdoc-openapi:

| Resource     | URL                                          |
| ------------ | -------------------------------------------- |
| Swagger UI   | https://localhost:8080/swagger-ui/index.html |
| OpenAPI JSON | https://localhost:8080/v3/api-docs           |

Both paths are accessible without authentication during local development — handy when wiring a new screen to an endpoint.

## Authentication

The backend ships an idempotent bootstrap account for local development:

- **Email:** `admin@ledgerx.local`
- **Password:** `ChangeMe@2026`

⚠️ Change this password before deploying anywhere other than local development.

The frontend supports both backend mechanisms.

### 1. Password Login with JWT

`POST /api/v1/auth/login` exchanges email and password for an access token. The frontend:

- stores the token for the duration of the session,
- attaches it on every request through an HTTP interceptor: `Authorization: Bearer <token>`,
- treats the token as **opaque** — Ed25519 signing is a backend concern,
- redirects to `/login` on any `401 Unauthorized`.

### 2. OAuth2 Authorization Code + PKCE

For deployments where the SPA must not handle passwords directly, LedgerX Frontend can act as a **public client** against the backend's first-party authorization server:

- no client secret — `client_authentication_method=none`,
- PKCE is mandatory (`requireProofKey(true)`),
- flows through `/oauth2/authorize` and `/oauth2/token`, with keys published on `/oauth2/jwks`.

Route guards in `core/` check authentication state before activating protected routes, and role-based UI visibility mirrors the backend's `DEVELOPER`, `ADMINISTRATOR`, `MANAGER`, and `COLLABORATOR` roles.

## 🚀 Running Locally

### Prerequisites

- Node.js 22 LTS or newer
- npm 10+
- A running [LedgerX backend](https://github.com/nischor/ledgerx-backend) — `docker compose up -d` starts the API, PostgreSQL, RabbitMQ, and Grafana LGTM
- Angular CLI, optional if you use the npm scripts

### Setup

```bash
git clone https://github.com/nischor/ledgerx-frontend.git
cd ledgerx-frontend
npm install
```

### Start the development server

```bash
npm start
# or, with a global Angular CLI:
ng serve --proxy-config proxy.conf.json
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

### Dev proxy

`proxy.conf.json` forwards API calls to the backend and accepts its self-signed development certificate:

```json
{
    "/api": { "target": "https://localhost:8080", "secure": false, "changeOrigin": true },
    "/oauth2": { "target": "https://localhost:8080", "secure": false, "changeOrigin": true }
}
```

> `secure: false` is intentional: the backend generates a fresh self-signed TLS certificate on every startup. Never use this setting against a production host.

## 🧩 Environment Configuration

Runtime settings live in `src/environments/`:

```ts
// environment.ts — used by `ng serve`
export const environment = {
    production: false,
    apiUrl: "/api/v1",
};
```

`ng build` swaps in `environment.prod.ts` through file replacements, pointing `apiUrl` at the deployed API. Keep secrets out of both files — anything shipped to the browser is public.

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

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

Components are exercised through `TestBed`; API services are covered with `HttpTestingController`, so no real network is involved.

### End-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## 📦 Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed — tree-shaking, code splitting per lazy route, and hashed filenames ready for long-term caching.

## 📁 Repository Structure

```
ledgerx-frontend/
 ├── src/
 │   ├── app/
 │   │   ├── core/                # shell, routing, guards, interceptors, theming
 │   │   ├── shared/              # presentational components, pipes, validators
 │   │   ├── data/                # API services, DTO models, token storage
 │   │   └── features/            # lazy-loaded features, one per bounded context
 │   │       ├── auth/
 │   │       ├── dashboard/
 │   │       ├── accounts/
 │   │       ├── transactions/
 │   │       ├── budgets/
 │   │       ├── billing/
 │   │       └── notifications/
 │   ├── assets/
 │   ├── environments/            # environment.ts / environment.prod.ts
 │   ├── styles/                  # global SCSS and design tokens
 │   ├── index.html
 │   └── main.ts
 ├── angular.json
 ├── package.json
 ├── proxy.conf.json              # dev proxy to https://localhost:8080
 ├── tsconfig.json
 └── README.md
```

## 🤝 Contributing

Contributions are welcome.

Before opening a pull request:

- Read the backend's [BUSINESS_RULES.md](https://github.com/nischor/ledgerx-backend/blob/main/BUSINESS_RULES.md) — the 127 documented rules are the source of truth, and the UI must respect them rather than re-implement them.
- Preserve the architecture:
    - features never call `HttpClient` directly — go through a `data` service;
    - keep `shared` presentational and feature-agnostic;
    - new screens belong to the feature that matches their bounded context.
- Ensure the build passes:

```bash
ng build
ng test
```

- Surface backend failures with the structured `ApiError` payload — never a raw stack trace.
- Keep tests meaningful and aligned with the existing architecture.

## 📄 License

This project is open-source. See the [LICENSE](LICENSE.md) file for details.

## 📖 Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

<p align="center">
<sub>Built with Angular 22, TypeScript, and the LedgerX backend.</sub>
</p>
