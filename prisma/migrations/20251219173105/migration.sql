/*
  Warnings:

  - The primary key for the `event_posts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `events` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `mbti_type` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `events_edited` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[auth0_sub]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `chat_room_id` to the `event_posts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `detail` to the `event_posts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `place` to the `event_posts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `event_posts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `event_posts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date_text` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_at` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scraped_at` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_at` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `age` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `auth0_sub` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `faculty` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MbtiType" AS ENUM ('ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP', 'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'NO_ANSWER');

-- CreateEnum
CREATE TYPE "Faculty" AS ENUM ('BUSINESS', 'POLICY', 'INFO_SCI', 'IMAGE_ARTS', 'PSYCHOLOGY', 'GLA');

-- DropForeignKey
ALTER TABLE "event_posts" DROP CONSTRAINT "event_posts_event_id_fkey";

-- DropForeignKey
ALTER TABLE "event_posts" DROP CONSTRAINT "event_posts_uid_fkey";

-- DropForeignKey
ALTER TABLE "events_edited" DROP CONSTRAINT "events_edited_events_id_fkey";

-- AlterTable
ALTER TABLE "event_posts" DROP CONSTRAINT "event_posts_pkey",
ADD COLUMN     "category" CHAR(36),
ADD COLUMN     "chat_room_id" CHAR(36) NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "detail" TEXT NOT NULL,
ADD COLUMN     "place" VARCHAR(256) NOT NULL,
ADD COLUMN     "title" VARCHAR(256) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" SET DATA TYPE CHAR(36),
ALTER COLUMN "uid" SET DATA TYPE CHAR(36),
ALTER COLUMN "event_id" SET DATA TYPE CHAR(36),
ADD CONSTRAINT "event_posts_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "events" DROP CONSTRAINT "events_pkey",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "date_text" VARCHAR(255) NOT NULL,
ADD COLUMN     "end_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "scraped_at" TIMESTAMP NOT NULL,
ADD COLUMN     "start_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" SET DATA TYPE CHAR(36),
ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ADD COLUMN     "age" INTEGER NOT NULL,
ADD COLUMN     "auth0_sub" VARCHAR(255) NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "device_token" TEXT,
ADD COLUMN     "email" VARCHAR(258) NOT NULL,
ADD COLUMN     "faculty" "Faculty" NOT NULL,
ADD COLUMN     "gender" "Gender" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "uid" SET DATA TYPE CHAR(36),
ALTER COLUMN "link_user_code" DROP NOT NULL,
DROP COLUMN "mbti_type",
ADD COLUMN     "mbti_type" "MbtiType",
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("uid");

-- DropTable
DROP TABLE "events_edited";

-- CreateTable
CREATE TABLE "events_mbti" (
    "id" CHAR(36) NOT NULL,
    "event_id" CHAR(36) NOT NULL,
    "detail_edited" TEXT NOT NULL,
    "mbti_type" "MbtiType" NOT NULL,

    CONSTRAINT "events_mbti_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" CHAR(36) NOT NULL,
    "name" VARCHAR(30) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_of_rooms" (
    "category_id" CHAR(36) NOT NULL,
    "event_posts_id" CHAR(36) NOT NULL,

    CONSTRAINT "category_of_rooms_pkey" PRIMARY KEY ("category_id","event_posts_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "category_name_key" ON "category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_auth0_sub_key" ON "users"("auth0_sub");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "events_mbti" ADD CONSTRAINT "events_mbti_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_posts" ADD CONSTRAINT "event_posts_uid_fkey" FOREIGN KEY ("uid") REFERENCES "users"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_posts" ADD CONSTRAINT "event_posts_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_of_rooms" ADD CONSTRAINT "category_of_rooms_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_of_rooms" ADD CONSTRAINT "category_of_rooms_event_posts_id_fkey" FOREIGN KEY ("event_posts_id") REFERENCES "event_posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
