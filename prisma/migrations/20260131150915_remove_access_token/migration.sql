/*
  Warnings:

  - You are about to drop the `access_tokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "access_tokens" DROP CONSTRAINT "access_tokens_userId_fkey";

-- DropTable
DROP TABLE "access_tokens";
