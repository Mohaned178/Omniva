-- ── Key dates: the one collection reminders, the calendar and the Overview read (ADR 0008) ──

-- CreateEnum
CREATE TYPE "key_date_precision" AS ENUM ('exact', 'month', 'missing');

-- CreateTable
CREATE TABLE "key_date" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "field_key" TEXT NOT NULL,
    "precision" "key_date_precision" NOT NULL,
    "date" DATE,

    CONSTRAINT "key_date_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "key_date_record_id_field_key_key" ON "key_date"("record_id", "field_key");

-- CreateIndex
CREATE INDEX "key_date_workspace_id_date_idx" ON "key_date"("workspace_id", "date");

-- AddForeignKey
ALTER TABLE "key_date" ADD CONSTRAINT "key_date_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "key_date" ADD CONSTRAINT "key_date_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "record"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- A date is missing exactly when it has no day.
ALTER TABLE "key_date" ADD CONSTRAINT "key_date_missing_has_no_date" CHECK (("precision" = 'missing') = ("date" IS NULL));

-- Row-level security for the new workspace-owned table, as for the others (ADR 0009).
ALTER TABLE "key_date" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "key_date" FORCE ROW LEVEL SECURITY;
CREATE POLICY "key_date_isolation" ON "key_date"
    USING ("workspace_id" = current_setting('app.workspace_id', true))
    WITH CHECK ("workspace_id" = current_setting('app.workspace_id', true));
