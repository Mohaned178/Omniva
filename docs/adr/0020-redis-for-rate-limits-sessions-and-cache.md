# Redis for rate limits, sessions and non-personal cache; jobs stay in PostgreSQL

Reversing the earlier "no separate data store" assumption at the user's request, the MVP uses Redis (or the compatible Valkey) for three roles: shared rate limiting across API instances, a fast secondary store for session lookups (PostgreSQL remains the source of truth for sessions), and a short-lived cache of non-personal data such as exchange rates, the service catalog and Type definitions. The reminder schedule, change notifications and all background jobs stay on pg-boss in PostgreSQL, because they must be saved in the same transaction as the change (ADR 0008, ADR 0015) and Redis can lose its latest writes on restart.

## Rules

- No record content in Redis: no titles, documents, amounts or dates of users' records, which keeps deletion and encryption guarantees simple (ADR 0004, ADR 0013).
- Every key has an expiry; connections are encrypted; EU region only.
- Redis is disposable: if it is down or loses its data, the app keeps working (slower, with rate limits falling back to PostgreSQL) and nothing is lost.

## Considered Options

- No Redis at all, with PostgreSQL covering every role: simpler and cheaper, preferred by Claude; the user chose to use Redis.
- Moving background jobs to BullMQ on Redis: richer tooling, but two queue systems and a weaker guarantee for reminder-related work.
