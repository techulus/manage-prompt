/*
  Warnings:

  - You are about to drop the column `spendLimit` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the `Stripe` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Stripe" DROP CONSTRAINT "Stripe_ownerId_fkey";

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "spendLimit";

-- DropTable
DROP TABLE "Stripe";
