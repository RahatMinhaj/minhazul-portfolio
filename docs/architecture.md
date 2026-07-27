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
  -> Authenticated/public query
  -> Read-model repository
  -> Prisma
  -> PostgreSQL
```

Public and admin query entry points live in `src/server/queries`. Read-model
repositories live in `src/server/repositories`. Admin query entry points perform
server-side authorization before invoking their repositories.

## Boundary enforcement

ESLint prevents pages, components, route handlers, and Server Actions from
importing the database client or feature repositories directly. It also
prevents services from importing the database client. This keeps future changes
from silently collapsing the layers again.

The shared Prisma client and PostgreSQL adapter are infrastructure concerns in
`src/lib/db/client.ts`.
