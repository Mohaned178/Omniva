# TypeScript end to end: NestJS, Next.js, Prisma, pg-boss, Better Auth, Zod

Omniva is built mostly by AI coding agents with the user reviewing, so the stack is mainstream, strongly typed and one language throughout: NestJS for the API and worker (its modules map onto the capability modules of ADR 0006), Next.js (React) for the public pages and the app, one pnpm-workspaces repository with shared packages, Prisma for database access, Zod schemas shared from front to back, pg-boss for jobs in PostgreSQL (ADR 0015), and Better Auth so accounts stay in our own database at no cost.

## Consequences

- Prisma has no native support for PostgreSQL row-level security or full-text search (chosen by the user over Drizzle): isolation policies live in hand-written SQL migrations, each request's transaction sets the workspace through a Prisma client extension, and search uses raw SQL queries.
- React keeps a direct path to React Native for the stage-2 mobile app.

## Considered Options

- Drizzle instead of Prisma: closer to SQL with natural row-level security, recommended by Claude; the user preferred Prisma.
- Angular instead of Next.js: similar style to NestJS, but a smaller ecosystem and less reliable for AI agents.
- Managed authentication (Clerk, Auth0): user identities with a third party, and a monthly cost.
