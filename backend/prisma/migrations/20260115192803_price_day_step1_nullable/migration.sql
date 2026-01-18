/*
  Warnings:

  - A unique constraint covering the columns `[cardId,source,currency,kind,day]` on the table `Price` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Price" ADD COLUMN     "day" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Price_cardId_source_currency_kind_day_key" ON "Price"("cardId", "source", "currency", "kind", "day");
