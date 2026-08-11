# Production deployment

This deployment is provider-neutral. It runs the complete Next.js application,
PostgreSQL, database migrations, and an HTTPS reverse proxy with Docker Compose.
It can be hosted on any conventional Linux server with a public IP address.

## Architecture

```text
Internet
  -> External DNS provider
  -> Caddy on ports 80 and 443
  -> Next.js standalone container on the private Docker network
  -> PostgreSQL on the private Docker network
```

Caddy obtains and renews the TLS certificate automatically. PostgreSQL and the
Next.js application port are not published directly to the internet.

## Server requirements

- A Linux server with a stable public IPv4 address
- Docker Engine 24 or later
- Docker Compose v2
- At least 2 GB RAM and 20 GB storage
- Inbound TCP ports 80 and 443 allowed
- Inbound UDP port 443 allowed for HTTP/3, optional but recommended
- SSH restricted to trusted IP addresses or key-based access

## External DNS

Create the DNS record before starting Caddy:

| Record | Name               | Value               | Purpose       |
| ------ | ------------------ | ------------------- | ------------- |
| `A`    | `portfolio` or `@` | Server IPv4 address | Main domain   |
| `AAAA` | Same name          | Server IPv6 address | Optional IPv6 |

For `portfolio.example.com`, set `DOMAIN=portfolio.example.com`. For an apex
domain, set `DOMAIN=example.com`.

If DNS is managed by Cloudflare, use **DNS only** while Caddy obtains the first
certificate. A proxy can be enabled afterward with SSL mode set to **Full
(strict)**.

DNS propagation can be checked with:

```bash
dig +short portfolio.example.com
```

The result must be the deployment server's public IP address.

## Environment configuration

Create `.env.production` from `.env.production.example`, then replace every
placeholder. This file is ignored by Git and must remain only on the server.

Important rules:

- `DOMAIN` contains only the hostname, without `https://` or a trailing slash.
- `AUTH_SECRET` must contain at least 32 characters.
- `POSTGRES_PASSWORD` and the password inside `DATABASE_URL` must match.
- URL-encode reserved password characters inside `DATABASE_URL`.
- `GEMINI_API_KEY` is optional; without it, the chatbot is not rendered.
- Use a unique production administrator password.

Generate strong secrets with:

```bash
openssl rand -base64 48
```

Restrict the environment file after creating it:

```bash
chmod 600 .env.production
```

## First deployment

Build the images with the production domain compiled into Next.js metadata:

```bash
docker compose --env-file .env.production -f compose.production.yml build
```

Start PostgreSQL, apply migrations, and seed the initial content:

```bash
docker compose --env-file .env.production -f compose.production.yml up -d database
docker compose --env-file .env.production -f compose.production.yml run --rm migrate npm run db:deploy
docker compose --env-file .env.production -f compose.production.yml run --rm migrate npm run db:seed
```

The seed command is intended for initial provisioning. It upserts portfolio
content and should not be included in normal deployments after administrators
begin editing production data.

Start the complete stack:

```bash
docker compose --env-file .env.production -f compose.production.yml up -d
```

Inspect service health and certificate issuance:

```bash
docker compose --env-file .env.production -f compose.production.yml ps
docker compose --env-file .env.production -f compose.production.yml logs -f app caddy
```

The public site is available at `https://DOMAIN` and the administrator login is
available at `https://DOMAIN/admin/login`.

## Updating the application

After pulling a new release:

```bash
docker compose --env-file .env.production -f compose.production.yml build
docker compose --env-file .env.production -f compose.production.yml up -d
docker image prune -f
```

The one-shot `migrate` service completes before the application is restarted.
Do not run the seed command during routine updates.

If `DOMAIN` changes, rebuild the application image. The canonical URL is used
both at runtime and during the Next.js build for metadata and social cards.

## Database backups

Create a backup before deployments that contain database migrations:

```bash
docker compose --env-file .env.production -f compose.production.yml exec -T database \
  pg_dump -U portfolio_user -d minhazul_portfolio -Fc > portfolio.dump
```

Store backups outside the deployment server and test restoration periodically.
The `postgres_data` volume persists when containers are replaced, but it is not
a substitute for an external backup.

## Operational checks

- Keep the operating system and Docker patched.
- Monitor free disk space and PostgreSQL volume growth.
- Rotate administrator, database, authentication, and Gemini credentials.
- Review Caddy and application logs without recording chatbot content.
- Never commit `.env.production`, database dumps, or TLS data.
- Back up the database before destructive maintenance.
