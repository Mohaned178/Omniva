# Omniva

A connected Personal Life Management Platform. Product and design decisions live in
`omniva-product-definition.html`, `omniva-system-design.html`, `GLOSSARY.md` and `docs/adr/`.
Coding rules are in `CODING_STANDARDS.md`.

## Run it locally

You need Node.js 24, pnpm 11 and Docker.

```sh
pnpm install
pnpm dev
```

`pnpm dev` starts PostgreSQL, Redis (Valkey), MinIO, Mailpit and ClamAV in Docker, applies the
database migrations, and runs the API (port 4000), the worker and the web app (port 3000).
Open <http://localhost:3000/health> to see whether each part is reachable.

| Service         | Address                          |
| --------------- | -------------------------------- |
| Web app         | http://localhost:3000            |
| API             | http://localhost:4000/v1         |
| Mailpit (email) | http://localhost:58025           |
| MinIO console   | http://localhost:59001           |
| PostgreSQL      | localhost:55432 (omniva/omniva)  |
| Redis           | localhost:56379                  |

Host ports avoid the defaults so a natively installed PostgreSQL or Redis keeps working. Change
them, or the API settings in `.env.example`, by copying values into a `.env` file.

## Layout

| Path                    | What it is                                                         |
| ----------------------- | ------------------------------------------------------------------ |
| `apps/api`              | NestJS API and worker: one codebase, two processes (ADR 0006)      |
| `apps/web`              | Next.js web app; holds no user data (ADR 0019)                     |
| `packages/domain-types` | Shared domain types                                                |
| `packages/schemas`      | Shared Zod schemas: the one definition of every API shape          |
| `packages/domain-rules` | Pure domain rules, no framework or I/O                             |
| `packages/api-client`   | Typed API client, generated from the API's OpenAPI document        |

## Checks

| Command                 | What it does                                                        |
| ----------------------- | ------------------------------------------------------------------- |
| `pnpm lint`             | ESLint                                                              |
| `pnpm typecheck`        | TypeScript in every package                                         |
| `pnpm test:seam2`       | Seam 2: domain rules, including property-based tests                |
| `pnpm test:seam1`       | Seam 1: the /v1 API and worker on real PostgreSQL and Redis (Docker) |
| `pnpm test:seam3`       | Seam 3: browser journeys with axe; builds the web app and starts the API and worker on ports 3100 and 4100 (Docker services must be up) |
| `pnpm generate`         | Regenerates the Prisma client, OpenAPI document and API client      |
| `pnpm check:generated`  | Fails if the committed OpenAPI document or client is out of date    |
| `pnpm check:migrations` | Fails if an existing migration was edited (forward-only)            |

CI runs all of these on every pull request.
