CREATE TYPE "OrderStatus" AS ENUM ('RESERVED', 'PAID', 'CANCELLED');

CREATE TABLE "Order" (
  "id" UUID PRIMARY KEY,
  "status" "OrderStatus" NOT NULL DEFAULT 'RESERVED',
  "paymentId" TEXT UNIQUE,
  "confirmationUrl" TEXT,
  "requestHash" TEXT NOT NULL,
  "amountKopecks" INTEGER NOT NULL CHECK ("amountKopecks" > 0),
  "deliveryKopecks" INTEGER NOT NULL CHECK ("deliveryKopecks" >= 0),
  "customer" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notifiedAt" TIMESTAMP(3)
);

CREATE TABLE "OrderItem" (
  "orderId" UUID NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "productId" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "priceKopecks" INTEGER NOT NULL CHECK ("priceKopecks" >= 0),
  "quantity" INTEGER NOT NULL CHECK ("quantity" > 0),
  PRIMARY KEY ("orderId", "productId")
);
