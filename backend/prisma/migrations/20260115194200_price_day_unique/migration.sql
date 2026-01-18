/*
  Warnings:

  - Made the column `day` on table `Price` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Price" ALTER COLUMN "day" SET NOT NULL;
