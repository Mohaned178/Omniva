-- ── Reminders: the derived schedule of due notices, and the record of what was delivered and handled (ADR 0008, ADR 0012) ──

-- CreateEnum
CREATE TYPE "reminder_handling_status" AS ENUM ('handled', 'snoozed');

-- AlterTable
ALTER TABLE "record" ADD COLUMN     "reminder_rules" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "key_date" ADD COLUMN     "reminder_days_before" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

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
    "emailed_at" TIMESTAMP(3),

    CONSTRAINT "reminder_delivery_pkey" PRIMARY KEY ("id")
);

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
CREATE INDEX "reminder_notice_remind_on_idx" ON "reminder_notice"("remind_on");

-- CreateIndex
CREATE INDEX "reminder_notice_workspace_id_remind_on_idx" ON "reminder_notice"("workspace_id", "remind_on");

-- CreateIndex
CREATE UNIQUE INDEX "reminder_notice_once" ON "reminder_notice"("record_id", "field_key", "occurs_on", "days_before");

-- CreateIndex
CREATE INDEX "reminder_delivery_workspace_id_record_id_idx" ON "reminder_delivery"("workspace_id", "record_id");

-- CreateIndex
CREATE UNIQUE INDEX "reminder_delivery_once" ON "reminder_delivery"("record_id", "field_key", "occurs_on", "days_before");

-- CreateIndex
CREATE INDEX "reminder_handling_workspace_id_idx" ON "reminder_handling"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "reminder_handling_once" ON "reminder_handling"("record_id", "field_key", "occurs_on");

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


-- A reminder comes a whole number of days before its date, never after it.
ALTER TABLE "reminder_notice" ADD CONSTRAINT "reminder_notice_days_before_not_negative" CHECK ("days_before" >= 0);
ALTER TABLE "reminder_notice" ADD CONSTRAINT "reminder_notice_lapses_after_remind" CHECK ("lapses_on" >= "remind_on");
ALTER TABLE "reminder_delivery" ADD CONSTRAINT "reminder_delivery_days_before_not_negative" CHECK ("days_before" >= 0);

-- A reminder is snoozed exactly when it has a day it is snoozed until.
ALTER TABLE "reminder_handling" ADD CONSTRAINT "reminder_handling_snoozed_has_end" CHECK (("status" = 'snoozed') = ("snoozed_until" IS NOT NULL));

-- Row-level security for the new workspace-owned tables, as for the others (ADR 0009).
ALTER TABLE "reminder_notice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reminder_notice" FORCE ROW LEVEL SECURITY;
CREATE POLICY "reminder_notice_isolation" ON "reminder_notice"
    USING ("workspace_id" = current_setting('app.workspace_id', true))
    WITH CHECK ("workspace_id" = current_setting('app.workspace_id', true));

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

-- The worker's minute check for due reminders names its task instead of a workspace and may
-- only read the schedule, to learn which workspaces have notices due (ADR 0021).
CREATE POLICY "reminder_notice_find_due" ON "reminder_notice" FOR SELECT
    USING (current_setting('app.task', true) = 'reminders.find-due');
