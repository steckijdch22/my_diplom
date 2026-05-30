/*
  Warnings:

  - Added the required column `documentKey` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicKey` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "documentKey" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "publicKey" TEXT NOT NULL;
