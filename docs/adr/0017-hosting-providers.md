# Hosting providers for the beta: Neon, Render, Cloudflare R2, Mailgun EU, AWS KMS

From the beta: Neon PostgreSQL in Frankfurt with a 14-day history window; Render in Frankfurt for the web, API and worker services; Cloudflare R2 with an EU-jurisdiction bucket for files; Mailgun EU region for sending and receiving email (Lettermint as fallback); AWS KMS in Frankfurt with one master key protecting per-workspace data keys; ClamAV inside the worker; Sentry EU region and a free uptime monitor. Development is local in Docker and staging uses free tiers with no real data, so cost is $0 until the beta and an estimated $55–80/month after (to confirm at account setup). Everything sits on standard PostgreSQL, S3-compatible storage and ordinary containers, so any provider can be replaced without a rewrite.

## Considered Options

- Render PostgreSQL: recovery window of 3–7 days fails the approved 14-day requirement.
- Vercel for Next.js: free plan limited to non-commercial use.
- Railway: cheaper, but EU availability on the lower plan could not be confirmed.
- Online malware scanners: would send users' documents to a third party.

## Consequences

- Neon is a US company; data stays in Frankfurt. EU-owned providers can be researched if sovereignty becomes a requirement.
