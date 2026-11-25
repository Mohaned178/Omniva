-- CreateEnum
CREATE TYPE "workspace_kind" AS ENUM ('personal', 'shared');

-- CreateEnum
CREATE TYPE "member_role" AS ENUM ('owner', 'editor', 'viewer');

-- CreateEnum
CREATE TYPE "block" AS ENUM ('item', 'document', 'money_record', 'obligation', 'event', 'task', 'person', 'note', 'plan', 'measurement');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL,
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_credential" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider_subject_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "password" TEXT,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "access_token_expires_at" TIMESTAMP(3),
    "refresh_token_expires_at" TIMESTAMP(3),
    "scope" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace" (
    "id" TEXT NOT NULL,
    "kind" "workspace_kind" NOT NULL,
    "personal_owner_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "member_role" NOT NULL,
    "person_record_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "record" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "block" "block" NOT NULL,
    "type_key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "record_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_user_id_idx" ON "session"("user_id");

-- CreateIndex
CREATE INDEX "user_credential_user_id_idx" ON "user_credential"("user_id");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_personal_owner_user_id_key" ON "workspace"("personal_owner_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "member_person_record_id_key" ON "member"("person_record_id");

-- CreateIndex
CREATE INDEX "member_user_id_idx" ON "member"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "member_workspace_id_user_id_key" ON "member"("workspace_id", "user_id");

-- CreateIndex
CREATE INDEX "record_workspace_id_idx" ON "record"("workspace_id");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_credential" ADD CONSTRAINT "user_credential_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_person_record_id_fkey" FOREIGN KEY ("person_record_id") REFERENCES "record"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record" ADD CONSTRAINT "record_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ── Row-level security for workspace-owned tables (ADR 0009) ──────────────────────────────
-- Each transaction names its workspace (and, to find a user's memberships, its user) in the
-- settings below; anything else is refused. A missing setting reads as NULL, which matches
-- no row. FORCE applies the policies to the table owner too.

ALTER TABLE "workspace" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workspace" FORCE ROW LEVEL SECURITY;
CREATE POLICY "workspace_isolation" ON "workspace"
    USING (
        "id" = current_setting('app.workspace_id', true)
        OR "personal_owner_user_id" = current_setting('app.user_id', true)
    )
    WITH CHECK ("id" = current_setting('app.workspace_id', true));

ALTER TABLE "member" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "member" FORCE ROW LEVEL SECURITY;
CREATE POLICY "member_isolation" ON "member"
    USING (
        "workspace_id" = current_setting('app.workspace_id', true)
        OR "user_id" = current_setting('app.user_id', true)
    )
    WITH CHECK ("workspace_id" = current_setting('app.workspace_id', true));

ALTER TABLE "record" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "record" FORCE ROW LEVEL SECURITY;
CREATE POLICY "record_isolation" ON "record"
    USING ("workspace_id" = current_setting('app.workspace_id', true))
    WITH CHECK ("workspace_id" = current_setting('app.workspace_id', true));
