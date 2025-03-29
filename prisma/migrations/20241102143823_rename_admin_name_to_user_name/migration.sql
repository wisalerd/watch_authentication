/*
  Warnings:

  - You are about to drop the column `adminName` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `adminName`,
    ADD COLUMN `userName` VARCHAR(191) NOT NULL DEFAULT '';
