-- CreateTable
CREATE TABLE "aura_user" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "mfa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aura_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_user_session" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "ip_address" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_active" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aura_user_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aura_audit_log" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "metadata" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aura_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "aura_user_email_key" ON "aura_user"("email");

-- CreateIndex
CREATE INDEX "aura_user_tenant_id_idx" ON "aura_user"("tenant_id");

-- CreateIndex
CREATE INDEX "aura_user_session_user_id_idx" ON "aura_user_session"("user_id");

-- CreateIndex
CREATE INDEX "aura_audit_log_tenant_id_idx" ON "aura_audit_log"("tenant_id");

-- CreateIndex
CREATE INDEX "aura_audit_log_user_id_idx" ON "aura_audit_log"("user_id");

-- CreateIndex
CREATE INDEX "aura_audit_log_entity_type_entity_id_idx" ON "aura_audit_log"("entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "aura_user" ADD CONSTRAINT "aura_user_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "aura_tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_user_session" ADD CONSTRAINT "aura_user_session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "aura_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_audit_log" ADD CONSTRAINT "aura_audit_log_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "aura_tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aura_audit_log" ADD CONSTRAINT "aura_audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "aura_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
