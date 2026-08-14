# Developer portfolio

A modular, database-ready portfolio built with Next.js App Router, React,
TypeScript, and Tailwind CSS.

The controller, service, repository, and read-model boundaries are documented
in [docs/architecture.md](docs/architecture.md).

## Local configuration

Requirements:

- Node.js 20.19+, 22.13+, or 24+
- npm
- PostgreSQL 15+ (PostgreSQL 16 is recommended)

Create the local environment file:

```bash
npm install
cp .env.example .env
```

Populate `.env`:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DATABASE_URL=postgresql://portfolio_user:your_password@localhost:5432/minhazul_portfolio
ADMIN_NAME=Minhazul Islam
ADMIN_USERNAME=admin
ADMIN_EMAIL=your-admin-email@example.com
ADMIN_PASSWORD=choose-a-strong-password
AUTH_SECRET=replace-with-a-random-secret-of-at-least-32-characters
GEMINI_API_KEY=your-google-ai-studio-api-key
GEMINI_MODEL=gemini-3.1-flash-lite
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODEL=openrouter/free
```

Generate a suitable authentication secret with:

```bash
openssl rand -base64 48
```

The administrator variables configure the login and seed workflows. The
password is stored as a bcrypt hash and is never stored as plain text in
PostgreSQL. Use a strong password outside local development.

Create the PostgreSQL database and make sure the account in `DATABASE_URL` can
create tables and indexes. Then initialize the application:

```bash
npm run db:generate
npm run db:deploy
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The portfolio is available at `/` and the administrator login is available at
`/admin/login`.

For a provider-neutral production setup with Docker, PostgreSQL, automatic
HTTPS, and an external custom domain, follow
[docs/deployment.md](docs/deployment.md).

For a production deployment, set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS
domain, use a managed PostgreSQL connection string, generate a separate
`AUTH_SECRET`, and run `npm run db:deploy` followed by `npm run db:seed` during
initial provisioning.

## Portfolio chatbot

The floating portfolio assistant is enabled automatically when
`GEMINI_API_KEY`, `AUTH_SECRET`, and `DATABASE_URL` are configured. Create a
free-tier API key in Google AI Studio and keep it server-side. The browser calls
only `/api/chat`; it never receives the Gemini credential.

Answers are grounded in public profile, experience, project, skill, education,
certification, article, tool, and social-link records. Requests are limited to
12 per client per hour, and chat transcripts are not persisted by this
application.

OpenRouter is optional. When configured, Gemini remains the primary provider.
Quota, rate-limit, timeout, and temporary Gemini failures fall back to
`openrouter/free`, which routes the request across currently available free
models. Create a server-side OpenRouter key and never expose it with a
`NEXT_PUBLIC_` prefix.

## Résumé file

The CV content is seeded into PostgreSQL, but a local `Downloads` path cannot be
used by a deployed website. To enable the résumé download:

1. Copy the approved PDF to `public/resume/minhazul-islam-cv.pdf`.
2. Set the profile résumé URL to `/resume/minhazul-islam-cv.pdf` from the admin
   profile screen.

Only publish the PDF if its phone numbers and email address are intended to be
publicly downloadable.

## Quality gates

```bash
npm run lint
npm run typecheck
npm run build
```

Run all three with `npm run validate`.

## Seed data

The Prisma seed contains CV-verified profile details, social links, two
experience records, four projects, technical skills, two certifications, and
three education records. It uses upserts and can be run repeatedly without
duplicating those records. Missing dates remain null; the unspecified English
degree is marked “Needs confirmation.”
