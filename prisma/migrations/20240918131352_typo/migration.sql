/*
  Warnings:

  - You are about to drop the column `cheked` on the `ContactForm` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ContactForm" DROP COLUMN "cheked",
ADD COLUMN     "checked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
