-- ── Reminder rules: how long before each Key date a reminder comes ───────────────────────
-- A record's own rules, which start as its Type's defaults. Records made before this change
-- keep none until the user sets them (no backfill: it would need Type-specific SQL).
ALTER TABLE "record" ADD COLUMN "reminder_rules" JSONB NOT NULL DEFAULT '[]';

-- Each Key date carries the lead times of its reminder rules, so reminders read only the
-- Key-date collection (spec, Records core).
ALTER TABLE "key_date" ADD COLUMN "reminder_days_before" INTEGER[] NOT NULL DEFAULT '{}';

-- ── Scheduling & Reminders (ADR 0012) ─────────────────────────────────────────────────────

-- CreateEnum
CREATE TYPE "reminder_handling_status" AS ENUM ('handled', 'snoozed');

-- The derived schedule of due notices, rebuilt from Key dates, their reminder rules, what was
-- delivered and how the user handled each reminder (ADR 0008). It can be emptied and rebuilt
-- at any time, so it holds nothing the exactly-once guarantee depends on.
-- CreateTable
CREATE TABLE "reminder_notice" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "field_key" TEXT NOT NULL,
    "occurs_on" DATE NOT NULL,
    "days_before" INTEGER NOT NULL,
    "remind_on" DATE NOT NULL,
    "lapses_on" DATE NOT NULL,

    CONSTRAINT "reminder_notice_pkey" PRIMARY KEY ("id")
);

-- Every due notice delivered, under the unique key of its Key date, occurrence and rule, so
-- no retry can deliver it twice (ADR 0012). Not derived: it is what makes the guarantee.
-- CreateTable
CREATE TABLE "reminder_delivery" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "field_key" TEXT NOT NULL,
    "occurs_on" DATE NOT NULL,
    "days_before" INTEGER NOT NULL,
    "is_urgent" BOOLEAN NOT NULL,
    "delivered_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminder_delivery_pkey" PRIMARY KEY ("id")
);

-- What the user did about a Key date's reminder, for the date it had then.
-- CreateTable
CREATE TABLE "reminder_handling" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "field_key" TEXT NOT NULL,
    "occurs_on" DATE NOT NULL,
    "status" "reminder_handling_status" NOT NULL,
    "snoozed_until" DATE,
    "changed_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminder_handling_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reminder_notice_once" ON "reminder_notice"("record_id", "field_key", "occurs_on", "days_before");

-- CreateIndex
CREATE INDEX "reminder_notice_remind_on_idx" ON "reminder_notice"("remind_on");

-- CreateIndex
CREATE INDEX "reminder_notice_workspace_id_remind_on_idx" ON "reminder_notice"("workspace_id", "remind_on");

-- CreateIndex
CREATE UNIQUE INDEX "reminder_delivery_once" ON "reminder_delivery"("record_id", "field_key", "occurs_on", "days_before");

-- CreateIndex
CREATE INDEX "reminder_delivery_workspace_id_record_id_idx" ON "reminder_delivery"("workspace_id", "record_id");

-- CreateIndex
CREATE UNIQUE INDEX "reminder_handling_once" ON "reminder_handling"("record_id", "field_key", "occurs_on");

-- CreateIndex
CREATE INDEX "reminder_handling_workspace_id_idx" ON "reminder_handling"("workspace_id");

-- AddForeignKey
ALTER TABLE "reminder_notice" ADD CONSTRAINT "reminder_notice_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminder_notice" ADD CONSTRAINT "reminder_notice_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "record"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminder_delivery" ADD CONSTRAINT "reminder_delivery_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminder_delivery" ADD CONSTRAINT "reminder_delivery_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "record"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminder_handling" ADD CONSTRAINT "reminder_handling_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminder_handling" ADD CONSTRAINT "reminder_handling_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "record"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- A reminder is snoozed exactly when it has a day the snooze ends.
ALTER TABLE "reminder_handling" ADD CONSTRAINT "reminder_handling_snooze_has_end" CHECK (("status" = 'snoozed') = ("snoozed_until" IS NOT NULL));

-- ── Row-level security for the new workspace-owned tables, as for the others (ADR 0009) ───
ALTER TABLE "reminder_notice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reminder_notice" FORCE ROW LEVEL SECURITY;
CREATE POLICY "reminder_notice_isolation" ON "reminder_notice"
    USING ("workspace_id" = current_setting('app.workspace_id', true))
    WITH CHECK ("workspace_id" = current_setting('app.workspace_id', true));

-- The worker's minute check finds which workspaces have reminders due (ADR 0012) in a
-- transaction that names this task instead of a workspace; it may read this table alone and
-- write nothing (ADR 0021).
CREATE POLICY "reminder_notice_find_due" ON "reminder_notice" FOR SELECT
    USING (current_setting('app.task', true) = 'reminders.find-due');

ALTER TABLE "reminder_delivery" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reminder_delivery" FORCE ROW LEVEL SECURITY;
CREATE POLICY "reminder_delivery_isolation" ON "reminder_delivery"
    USING ("workspace_id" = current_setting('app.workspace_id', true))
    WITH CHECK ("workspace_id" = current_setting('app.workspace_id', true));

ALTER TABLE "reminder_handling" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reminder_handling" FORCE ROW LEVEL SECURITY;
CREATE POLICY "reminder_handling_isolation" ON "reminder_handling"
    USING ("workspace_id" = current_setting('app.workspace_id', true))
    WITH CHECK ("workspace_id" = current_setting('app.workspace_id', true));
