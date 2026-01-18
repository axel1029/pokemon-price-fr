/*
  Warnings:

  - You are about to drop the column `condition` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Price` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cardNumber]` on the table `Card` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cardNumber` to the `Card` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "cardNumber" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "rarity" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Price" DROP COLUMN "condition",
DROP COLUMN "date",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Card_cardNumber_key" ON "Card"("cardNumber");
