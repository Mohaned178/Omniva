-- ── Records core: the record anatomy (ADR 0011) ───────────────────────────────────────────

-- CreateEnum
CREATE TYPE "life_module" AS ENUM ('productivity', 'finance', 'health', 'knowledge', 'career', 'assets', 'social', 'travel', 'home', 'subscriptions', 'documents', 'entertainment');

-- CreateEnum
CREATE TYPE "lifecycle_state" AS ENUM ('owned', 'disposed', 'active', 'ending', 'ended', 'valid', 'expired', 'open', 'done', 'upcoming', 'in_progress', 'past');

-- CreateEnum
CREATE TYPE "activity_action" AS ENUM ('created', 'updated', 'archived', 'unarchived');

-- Every record so far is a Me: a Person, whose home is the People directory (Social &
-- Relationships). A column default fills them in, because an UPDATE would be filtered by
-- row-level security and silently change nothing; the default then goes, so every new record
-- names its own home module.
ALTER TABLE "record" ADD COLUMN     "fields" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "home_module" "life_module" NOT NULL DEFAULT 'social',
ADD COLUMN     "is_archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lifecycle_state" "lifecycle_state";

ALTER TABLE "record" ALTER COLUMN "home_module" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "record_workspace_id_home_module_idx" ON "record"("workspace_id", "home_module");

-- ── History: the Activity Timeline (ADR 0008) ─────────────────────────────────────────────

-- CreateTable
CREATE TABLE "activity_entry" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "record_id" TEXT,
    "action" "activity_action" NOT NULL,
    "actor_user_id" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "recorded_at" TIMESTAMP(6) NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT "activity_entry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_entry_workspace_id_occurred_at_idx" ON "activity_entry"("workspace_id", "occurred_at");

-- CreateIndex
CREATE INDEX "activity_entry_record_id_idx" ON "activity_entry"("record_id");

-- AddForeignKey
ALTER TABLE "activity_entry" ADD CONSTRAINT "activity_entry_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_entry" ADD CONSTRAINT "activity_entry_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "record"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Row-level security for the new workspace-owned table, as for the others (ADR 0009).
ALTER TABLE "activity_entry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "activity_entry" FORCE ROW LEVEL SECURITY;
CREATE POLICY "activity_entry_isolation" ON "activity_entry"
    USING ("workspace_id" = current_setting('app.workspace_id', true))
    WITH CHECK ("workspace_id" = current_setting('app.workspace_id', true));

-- ── Change notifications queued in the change's own transaction (ADR 0008, ADR 0015) ─────
-- Records core queues each change notification as a pg-boss job inside the transaction that
-- makes the change, so the application role must be able to add jobs. pg-boss creates its
-- schema when it first starts, which is after migrations on a new database, so the schema is
-- made here and the grants cover the tables pg-boss creates in it later as well (pg-boss logs
-- in as the role that runs migrations). Jobs carry identifiers only, never record content
-- (CODING_STANDARDS §7); reading back the id of the job it added needs SELECT.
CREATE SCHEMA IF NOT EXISTS "pgboss";
GRANT USAGE ON SCHEMA "pgboss" TO "omniva_app";
GRANT SELECT, INSERT ON ALL TABLES IN SCHEMA "pgboss" TO "omniva_app";
ALTER DEFAULT PRIVILEGES IN SCHEMA "pgboss" GRANT SELECT, INSERT ON TABLES TO "omniva_app";
