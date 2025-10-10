/*
  Warnings:

  - You are about to drop the `ChatBot` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChatBotUserSession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ChatBot" DROP CONSTRAINT "ChatBot_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."ChatBot" DROP CONSTRAINT "ChatBot_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ChatBotUserSession" DROP CONSTRAINT "ChatBotUserSession_chatbotId_fkey";

-- DropTable
DROP TABLE "public"."ChatBot";

-- DropTable
DROP TABLE "public"."ChatBotUserSession";
