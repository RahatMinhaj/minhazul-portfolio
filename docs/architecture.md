# Application architecture

The application uses feature-oriented layering for commands and a CQRS-style
read model for page queries.

## Write flow

```text
Admin form or HTTP request
  -> Server Action or Route Handler (controller)
  -> Feature service (use case and business rules)
  -> Feature repository (Prisma persistence)
  -> PostgreSQL
```

Controllers in `src/server/actions` and `src/app/api` are responsible for:

- authenticating and authorizing the request;
- parsing transport values such as `FormData` or JSON;
- validating input;
- invoking one application service;
- translating the result into an action or HTTP response;
- revalidating affected Next.js paths.

Services in `src/features/*/*.service.ts` own use cases and business rules.
Examples include preserving a blog post's first publication date, preventing
the default theme from being disabled, contact rate limiting, password
verification, and analytics anonymization.

Repositories in `src/features/*/*.repository.ts` are the persistence boundary.
They own Prisma calls and expose operations expressed in the language of their
feature.

## Read flow

```text
React Server Component
  -> Authenticated/public query (`src/server/queries`)
  -> Feature repository and/or read-model repository (`src/server/repositories`)
  -> Prisma
  -> PostgreSQL
```

Public and admin query entry points live in `src/server/queries`. Shared page
read models live in `src/server/repositories`. Feature-owned admin lists (job
applications, chat sessions, saved emails) are loaded through queries that call
feature repositories after `requireAdmin()`.

## Allowed imports

| From | May import | Must not import |
|------|------------|-----------------|
| `app/**`, `components/**`, `server/actions/**` | services, queries, validation, UI | `@/lib/db/client`, `features/**/*.repository` |
| `features/**/*.service.ts` | feature repositories, domain helpers | `@/lib/db/client` |
| `features/**/*.repository.ts`, `server/repositories/**` | `@/lib/db/client`, Prisma | Next.js cache/cookies APIs |
| `server/queries/**` | repositories (feature or read-model), `requireAdmin` | — |

ESLint enforces the UI/action and service rules in `eslint.config.mjs`.

## Auth gates

- `src/proxy.ts` is a **soft** edge gate: missing admin cookie → redirect to login.
  Cookie presence alone is not a valid session.
- `requireAdmin()` in the protected layout and every mutating Server Action is
  the **authoritative** check (DB session hash verification).

## Admin UI conventions

- Tables: shared `AdminDataTable` (`@tanstack/react-table`) for list screens.
- Complex forms: `react-hook-form` + zod where helpful; Server Actions remain
  the submit transport.
- Rich text: Lexical via `RichTextEditor` (document and email variants).

## NestJS decision

A NestJS API extract is **deferred**. This product is a single Next.js deploy
with Server Actions and a small public API surface (`/api/chat`, analytics,
resume, media). Nest becomes appropriate when a second client, heavy async
workers (AI/email queues), or multi-tenant auth requires a separate backend.

Planned extract (when justified):

```text
apps/web (Next UI/BFF) -> apps/api (Nest modules) -> packages/db (Prisma)
```

Modules would map 1:1 from `src/features/*`. Prefer an httpOnly cookie bridge
for admin auth and BullMQ for long-running generate/send jobs.

## Infrastructure

The shared Prisma client and PostgreSQL adapter live in `src/lib/db/client.ts`.
Validated secrets and config live in `src/config/env.ts` (`AUTH_SECRET`, SMTP,
AI keys, admin identity).
