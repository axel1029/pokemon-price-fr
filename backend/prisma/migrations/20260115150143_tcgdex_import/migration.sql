/*
  Warnings:

  - A unique constraint covering the columns `[externalId]` on the table `Card` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `externalId` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kind` to the `Price` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Card_cardNumber_key";

-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "externalId" TEXT NOT NULL,
ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "Price" ADD COLUMN     "kind" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Card_externalId_key" ON "Card"("externalId");

-- CreateIndex
CREATE INDEX "Price_cardId_createdAt_idx" ON "Price"("cardId", "createdAt");
