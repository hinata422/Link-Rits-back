-- ========================================================
-- 1. リセット処理 (既存テーブルの削除)
-- ========================================================
-- 依存関係があるため、子供(外部キーを持つ側)から順に消します。

DROP TABLE IF EXISTS "events_edited";
DROP TABLE IF EXISTS "event_posts";
DROP TABLE IF EXISTS "events";
DROP TABLE IF EXISTS "users";

-- 旧設計のテーブル名(PascalCase)が残っている場合も念のため削除
DROP TABLE IF EXISTS "EventEdited";
DROP TABLE IF EXISTS "EventPost";
DROP TABLE IF EXISTS "Event";
DROP TABLE IF EXISTS "User";


-- ========================================================
-- 2. 新しいテーブルの作成 (画像準拠・PostgreSQL最適化版)
-- ========================================================

-- A. ユーザーテーブル (users)
CREATE TABLE "users" (
    "uid" UUID NOT NULL,          -- CHAR(36)よりUUID型が高速
    "link_user_code" VARCHAR(255) NOT NULL,
    "display_name" VARCHAR(36) NOT NULL,
    "email" VARCHAR(256) NOT NULL,
    "mbti_type" VARCHAR(10),      -- 文字列として保存 (例: "INFP")

    CONSTRAINT "users_pkey" PRIMARY KEY ("uid"),
    CONSTRAINT "users_link_user_code_key" UNIQUE ("link_user_code"),
    CONSTRAINT "users_email_key" UNIQUE ("email")
);

-- B. イベント情報 (events)
CREATE TABLE "events" (
    "id" UUID NOT NULL,
    "title" VARCHAR(256) NOT NULL,
    "category" UUID NOT NULL,     -- カテゴリIDもUUIDと想定
    "place" VARCHAR(256) NOT NULL,
    "detail" TEXT NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- C. 投稿管理 (event_posts)
CREATE TABLE "event_posts" (
    "id" UUID NOT NULL,
    "uid" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "post_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, -- ハイフンをアンダースコアに変更
    "post_limit" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_posts_pkey" PRIMARY KEY ("id"),
    
    -- 外部キー制約 (ユーザーが消えたら投稿も消す)
    CONSTRAINT "event_posts_uid_fkey" FOREIGN KEY ("uid") 
        REFERENCES "users"("uid") ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- 外部キー制約 (イベントが消えたら投稿も消す)
    CONSTRAINT "event_posts_event_id_fkey" FOREIGN KEY ("event_id") 
        REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- D. MBTI別加工データ (events_edited)
CREATE TABLE "events_edited" (
    "id" UUID NOT NULL,
    "events_id" UUID NOT NULL,
    "mbti_type" VARCHAR(36) NOT NULL,
    "detail_edited" TEXT NOT NULL,

    CONSTRAINT "events_edited_pkey" PRIMARY KEY ("id"),

    -- 外部キー制約
    CONSTRAINT "events_edited_events_id_fkey" FOREIGN KEY ("events_id") 
        REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE,

    -- 重複防止 (同じイベントの同じMBTI記事は1つだけ)
    CONSTRAINT "events_edited_unique_event_mbti" UNIQUE ("events_id", "mbti_type")
);