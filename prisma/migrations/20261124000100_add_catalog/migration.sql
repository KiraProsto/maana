BEGIN;

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "PublicationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'HIDDEN');

-- CreateEnum
CREATE TYPE "MediaKind" AS ENUM ('IMAGE', 'VIDEO');

-- CreateTable
CREATE TABLE "Category" (
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "categoryKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceKopecks" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "mainImage" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "advantages" TEXT NOT NULL DEFAULT '',
    "characteristics" TEXT NOT NULL DEFAULT '',
    "status" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "position" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "productId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "src" TEXT NOT NULL,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("productId","position")
);

-- CreateTable
CREATE TABLE "MasterClass" (
    "id" SERIAL NOT NULL,
    "legacyKey" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "age" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "priceKopecks" INTEGER,
    "mainImage" TEXT NOT NULL,
    "status" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "position" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterClassMedia" (
    "masterClassId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "kind" "MediaKind" NOT NULL,
    "src" TEXT NOT NULL,

    CONSTRAINT "MasterClassMedia_pkey" PRIMARY KEY ("masterClassId","position")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "marqueeText" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "telegramUrl" TEXT NOT NULL DEFAULT '',
    "vkUrl" TEXT NOT NULL DEFAULT '',
    "maxUrl" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Product_categoryKey_position_idx" ON "Product"("categoryKey", "position");

-- CreateIndex
CREATE UNIQUE INDEX "MasterClass_legacyKey_key" ON "MasterClass"("legacyKey");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryKey_fkey" FOREIGN KEY ("categoryKey") REFERENCES "Category"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterClassMedia" ADD CONSTRAINT "MasterClassMedia_masterClassId_fkey" FOREIGN KEY ("masterClassId") REFERENCES "MasterClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;


ALTER TABLE "Product"
    ADD CONSTRAINT "Product_stock_check" CHECK ("stock" >= 0),
    ADD CONSTRAINT "Product_priceKopecks_check" CHECK ("priceKopecks" >= 0);

ALTER TABLE "MasterClass"
    ADD CONSTRAINT "MasterClass_priceKopecks_check" CHECK ("priceKopecks" >= 0);

ALTER TABLE "SiteSettings"
    ADD CONSTRAINT "SiteSettings_id_check" CHECK ("id" = 1);

COMMIT;
