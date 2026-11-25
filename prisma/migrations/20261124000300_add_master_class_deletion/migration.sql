ALTER TABLE "MasterClass" ADD COLUMN "deletionToken" UUID;
CREATE INDEX "MasterClass_deletionToken_idx" ON "MasterClass"("deletionToken");
