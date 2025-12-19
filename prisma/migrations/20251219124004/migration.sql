/*
  Warnings:

  - You are about to drop the `Event` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Event";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "uid" UUID NOT NULL,
    "link_user_code" VARCHAR(255) NOT NULL,
    "name" VARCHAR(36) NOT NULL,
    "mbti_type" VARCHAR(10),

    CONSTRAINT "users_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL,
    "title" VARCHAR(256) NOT NULL,
    "place" VARCHAR(256) NOT NULL,
    "detail" TEXT NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_posts" (
    "id" UUID NOT NULL,
    "uid" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "post_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "post_limit" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events_edited" (
    "id" UUID NOT NULL,
    "events_id" UUID NOT NULL,
    "mbti_type" VARCHAR(36) NOT NULL,
    "detail_edited" TEXT NOT NULL,

    CONSTRAINT "events_edited_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_link_user_code_key" ON "users"("link_user_code");

-- CreateIndex
CREATE UNIQUE INDEX "events_edited_events_id_mbti_type_key" ON "events_edited"("events_id", "mbti_type");

-- AddForeignKey
ALTER TABLE "event_posts" ADD CONSTRAINT "event_posts_uid_fkey" FOREIGN KEY ("uid") REFERENCES "users"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_posts" ADD CONSTRAINT "event_posts_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events_edited" ADD CONSTRAINT "events_edited_events_id_fkey" FOREIGN KEY ("events_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
