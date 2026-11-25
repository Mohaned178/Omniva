-- ── The role the application acts as (ADR 0009) ──────────────────────────────────────────
-- The API and the worker switch to omniva_app on every database connection (DatabaseClient),
-- whatever role they log in as. It is not a superuser, cannot bypass row-level security and
-- owns no table, so the workspace isolation policies always apply to it. Migrations keep
-- running as the owner of the tables.

DO $$
BEGIN
    CREATE ROLE "omniva_app" NOLOGIN NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE;
EXCEPTION
    -- Roles belong to the whole server: another database on it may have created it already.
    WHEN duplicate_object THEN NULL;
END
$$;

-- The role that runs migrations also logs the application in, and must be able to switch.
GRANT "omniva_app" TO CURRENT_USER;

GRANT USAGE ON SCHEMA public TO "omniva_app";
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO "omniva_app";
-- Prisma's migration history belongs to the owner alone.
REVOKE ALL ON "_prisma_migrations" FROM "omniva_app";

-- Tables that later migrations create get the same grants. Their row-level security policies
-- still ship in the migration that creates them (CODING_STANDARDS §6).
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "omniva_app";
