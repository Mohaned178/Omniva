# Coding Standards

The rules every change to Omniva follows. `/code-review` checks diffs against this file. Where a rule cites an ADR, the ADR holds the reasoning. When two rules pull against each other, resolve by Omniva's principle order: **trust & control → reliability → low effort & calm → connection → breadth**.

## 1. Domain language

- Name code after `GLOSSARY.md` terms: `Record` for any entry, `Item` only for the possession block, `Member`, `KeyDate`, `Capture`, `Obligation`, `MoneyRecord` (projected or recorded), `Link`, `InferredConnection`, `Holder`.
- "Account" names only a financial account. A person who signs in is a `User`.
- A concept the glossary lacks is a signal: add it through `/domain-modeling` before naming code after it.
- Test names read as domain sentences: `reminds once when a month-only expiry approaches`.

## 2. Architecture boundaries

- Code lives in one of the capability modules (ADR 0006): Identity & Access, Workspaces & Membership, Records core, Life modules, Capture & Ingestion, Files, Scheduling & Reminders, Notifications & Digest, Automation, Insights & Inferred connections, Search, History, Portability.
- A module reaches another only through that module's exported service interface. Its tables, Prisma models and internal services stay private to it.
- Life modules are **type packs** (ADR 0007): a new Type is a new definition in its pack, plugged into Records core, with no edits to core branching logic.
- Records are the source of truth (ADR 0008). Reminder schedules, the search index, Insights and inferred connections are derived and rebuildable from records.
- A change to a record writes its Activity Timeline entry and its change notification **in the same transaction** as the change.
- Pure domain rules (recurrence, Key-date precision, reminder timing, quiet hours, inferred-connection rules, money arithmetic) live in the domain-rules package with no framework or I/O imports.

## 3. SOLID, applied here

- **Single responsibility.** Controllers handle HTTP only: parse input, rely on guards for authorization, call one application service, map the result. Application services orchestrate one use case. Domain rules decide. Repositories persist.
- **Open/closed.** Extend by registering: Types, reminder rules, capture-suggestion rules and inferred-connection rules are registered strategies. Adding one adds a file; it leaves existing switch statements untouched.
- **Liskov substitution.** Every implementation of a port is interchangeable: MinIO and R2 file storage, the local key fake and AWS KMS, Mailpit and Mailgun. A shared contract test suite runs against each implementation.
- **Interface segregation.** Ports are small and shaped by their consumer (a `KeyDateReader` for the calendar, a `KeyDateWriter` for Records core) rather than one wide service.
- **Dependency inversion.** Domain and application code depend on ports injected through NestJS DI. Infrastructure (Prisma, Redis, pg-boss, Mailgun, R2, KMS, ClamAV, the clock) sits behind those ports.

Prefer **deep modules**: a small interface hiding substantial behaviour. Add an abstraction when the third concrete case appears, not before.

## 4. TypeScript

- `strict` everywhere. Input from outside the process is `unknown` until a Zod schema parses it.
- Types for API inputs, Type definitions and forms are inferred from the shared Zod schemas, so each shape is defined once.
- Exhaustive `switch` over unions ends in a `never` check.
- Data is `readonly` by default; build new values rather than mutating shared ones.
- Errors are typed domain errors (`RecordNotFound`, `WorkspaceAccessDenied`), mapped to HTTP responses in one exception filter with one error shape.
- Values that may be absent are handled explicitly with narrowing.

## 5. Clean code

- Names reveal intent in domain terms; booleans read as questions (`isAutoRenewing`, `hasHolder`).
- Functions do one thing at one level of abstraction and stay short enough to read without scrolling.
- Guard clauses handle edge cases first; the main path stays unindented.
- Pass an options object or split the function where a boolean flag would switch behaviour.
- Name every magic value as a constant next to the rule that uses it (`TRIP_DOCUMENT_MARGIN_MONTHS = 6`).
- Comments explain **why** (a decision, a gotcha, an ADR reference); the code says what.
- Delete dead code and unused exports; git keeps history.
- Keep files focused: one main export per file, named after it.

## 6. Data, isolation and time

- Every workspace-owned query runs through the workspace-scoped Prisma client, which sets the workspace for the transaction (ADR 0009, ADR 0016).
- Every new workspace-owned table ships with its row-level security policy **in the same migration** and an isolation test.
- Every new endpoint ships with an isolation test: a user from another workspace is refused (ADR 0018).
- Identifiers are random and non-guessable.
- Money is integer minor units plus a currency code. Conversions record rate, date and source, and are labelled approximate.
- Key dates are calendar dates with precision (exact or month-only) or missing, stored without time or time zone. Timed Events store an instant plus their time zone.
- Time comes from the injected `Clock` port, so tests control it.
- Migrations are forward-only and expand–contract: add, switch, then remove in a later change.

## 7. Privacy and security

- Logs, errors, metrics, Sentry events and Redis keys carry IDs and technical detail only, never user content (titles, file names, amounts, dates of records).
- Redis holds only rate limits, session lookups and non-personal cache, every key with an expiry, and the app keeps working without it (ADR 0020).
- Secrets come from the environment or the managed secrets store. The repository is public.
- Authorization lives in guards; every action checks membership and role in the target workspace.
- Sensitive actions (export, email, password or two-factor change, account deletion) require re-authentication.
- **Ask, never assume:** Omniva marks a real-world commitment ended, cancelled or paid only after the user confirms. There is no "paid" state (ADR 0003).
- Files and designated sensitive fields go through the per-workspace encryption port (ADR 0013). No wording implies end-to-end encryption.

## 8. Reliability

- Every job and every side effect is idempotent under a unique key, so retries never duplicate and never skip (ADR 0012).
- Work that must happen is a durable job; reliability never depends on an in-memory promise surviving.
- Reminder-related code keeps the guarantees provable: exactly-once delivery, attention items persisting until handled, daily reconciliation.

## 9. API

- REST under `/v1`; changes within a version are additive only.
- Request and response shapes come from the shared Zod schemas; the OpenAPI document and the web client are generated from them.

## 10. Web app

- The Next.js server has no database access and renders no personal data (ADR 0019). App data flows through the generated API client and TanStack Query.
- Forms use React Hook Form with the shared Zod schemas.
- UI is built from shadcn/ui (Radix) components with Tailwind.
- Every user-facing string comes from next-intl translation files. Layout uses direction-neutral utilities (`ms-`/`me-`, `ps-`/`pe-`, `start`/`end`) so Arabic can follow.
- User-facing wording follows the J6 decisions: "Recurring", "Costs", "Important dates", "Plan", "Inbox", "People", "At a glance". Internal block names stay in code.
- Accessible to WCAG 2.2 AA: every control labelled, fully keyboard-operable, visible focus, sufficient contrast. Responsive from phone width up.

## 11. Testing

- Test-first with `/tdd`: each acceptance criterion gets a test that goes red, then green.
- Test behaviour at the highest fitting seam (spec 0001, Testing Decisions): Seam 1 is the `/v1` API and worker on real PostgreSQL and Redis; Seam 2 is the pure domain-rules package, with property-based tests for scheduling; Seam 3 is Playwright journeys with axe.
- Tests use the real database, the controllable clock and the mail catcher. Assertions target what a user or external system observes.
- Ports with several implementations share one contract test suite.

## 12. Git and pull requests

- One branch per ticket: `ticket/NN-short-slug`.
- Small commits with imperative messages that say why.
- A pull request closes exactly one ticket (`Closes #N`), follows the `/pr` skill's shape, and is green in CI before review.
