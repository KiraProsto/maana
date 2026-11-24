ALTER TABLE "Product" ADD COLUMN "deletionToken" UUID;
CREATE INDEX "Product_deletionToken_idx" ON "Product"("deletionToken");
