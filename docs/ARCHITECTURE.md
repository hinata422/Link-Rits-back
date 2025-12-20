# Link-Rits-back アーキテクチャ

## システム概要

立命館大学のイベント情報を、ユーザーのMBTIタイプに合わせてパーソナライズして提供するバックエンドシステム。

## 技術スタック

```mermaid
graph TB
    subgraph "Frontend"
        A[React/Next.js]
    end
    
    subgraph "Backend - NestJS"
        B[Controllers]
        C[Services]
        D[Repositories]
    end
    
    subgraph "External Services"
        E[OpenAI API]
        F[Supabase PostgreSQL]
    end
    
    A -->|REST API| B
    B --> C
    C --> D
    D --> F
    C -->|AI生成| E
```

### 使用技術
- **Framework**: NestJS (TypeScript)
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT API
- **Authentication**: Auth0 (予定)
- **Scraping**: (別ブランチ実装済み)

## システムアーキテクチャ

### レイヤー構成

```mermaid
graph LR
    subgraph "Presentation Layer"
        A1[UserController]
        A2[EventController]
        A3[EventEditedController]
        A4[TestMbtiController]
    end
    
    subgraph "Business Logic Layer"
        B1[UserService]
        B2[EventService]
        B3[EventEditedService]
        B4[PlainTextToMbtiLikeConverter]
    end
    
    subgraph "Data Access Layer"
        C1[UserRepository]
        C2[EventRepository]
        C3[EventEditedRepository]
    end
    
    subgraph "Database"
        D1[(users)]
        D2[(events)]
        D3[(events_mbti)]
    end
    
    A1 --> B1 --> C1 --> D1
    A2 --> B2 --> C2 --> D2
    A3 --> B3 --> C3 --> D3
    A4 --> B2
    A4 --> B3
    A4 --> B4
```

## データフロー

### 1. イベント取得フロー

```mermaid
sequenceDiagram
    participant Client
    participant EventController
    participant EventService
    participant EventRepository
    participant Supabase
    
    Client->>EventController: GET /api/events?mbti=INTJ
    EventController->>EventService: list(mbti)
    EventService->>EventRepository: findByMBTI(mbti)
    EventRepository->>Supabase: SELECT * FROM events
    Supabase-->>EventRepository: event data
    EventRepository-->>EventService: events[]
    EventService-->>EventController: events[]
    EventController-->>Client: JSON response
```

### 2. MBTI生成＆保存フロー

```mermaid
sequenceDiagram
    participant Client
    participant TestMbtiController
    participant EventService
    participant PlainTextConverter
    participant OpenAI
    participant EventEditedService
    participant Supabase
    
    Client->>TestMbtiController: POST /api/test-mbti/generate
    TestMbtiController->>EventService: get(event_id)
    EventService-->>TestMbtiController: event data
    
    TestMbtiController->>PlainTextConverter: convertAll(title, detail)
    PlainTextConverter->>OpenAI: Generate MBTI texts (16 types)
    OpenAI-->>PlainTextConverter: MBTI descriptions
    PlainTextConverter-->>TestMbtiController: mbtiDescriptions
    
    loop For each MBTI type
        TestMbtiController->>EventEditedService: upsert(event_id, mbti_type, detail_edited)
        EventEditedService->>Supabase: INSERT/UPDATE events_mbti
        Supabase-->>EventEditedService: success
    end
    
    TestMbtiController-->>Client: Success response
```

### 3. ユーザー作成フロー

```mermaid
sequenceDiagram
    participant Client
    participant UserController
    participant UserService
    participant UserRepository
    participant Supabase
    
    Client->>UserController: POST /api/users
    Note over UserController: Generate UUID<br/>Set default values
    UserController->>UserService: create(userData)
    UserService->>UserRepository: create(user)
    UserRepository->>Supabase: INSERT INTO users
    Supabase-->>UserRepository: user data
    UserRepository-->>UserService: created user
    UserService-->>UserController: user
    UserController-->>Client: JSON response
```

## データベーススキーマ

```mermaid
erDiagram
    users ||--o{ event_posts : "投稿"
    events ||--o{ event_posts : "関連"
    events ||--o{ events_mbti : "MBTI説明"
    
    users {
        uuid uid PK
        varchar link_user_code UK
        varchar name
        enum mbti_type
    }
    
    events {
        uuid id PK
        varchar title
        text detail
        varchar place
        datetime scraped_at
        datetime start_at
        datetime end_at
    }
    
    events_mbti {
        uuid id PK
        uuid event_id FK
        text detail_edited
        enum mbti_type
    }
    
    event_posts {
        uuid id PK
        uuid uid FK
        uuid event_id FK
        datetime post_time
        datetime post_limit
    }
```

## API エンドポイント

### Users API
- `POST /api/users` - ユーザー作成
- `GET /api/users/:link_user_code` - ユーザー取得
- `PUT /api/users/:link_user_code` - ユーザー更新

### Events API
- `GET /api/events?mbti=XXXX` - イベント一覧取得
- `GET /api/events/:event_id` - イベント詳細取得

### Events_mbti API
- `POST /api/events-edited` - MBTI別説明作成
- `GET /api/events-edited?event_id=XXX&mbti_type=XXX` - MBTI別説明取得

### Test/MBTI API
- `POST /api/test-mbti/generate` - AI生成＆保存（統合フロー）
- `GET /api/test-mbti/verify?event_id=XXX` - 保存データ確認

## 全体フロー（スクレイピング → AI生成 → 配信）

```mermaid
graph TB
    A[Web Scraping<br/>別ブランチ] -->|イベントデータ| B[(events テーブル)]
    
    B -->|GET| C[Event API]
    C -->|イベント情報| D[MBTI生成API]
    
    D -->|OpenAI API| E[AI Text Generation<br/>16種類のMBTI別説明]
    E -->|生成完了| F[EventEditedService]
    
    F -->|UPSERT| G[(events_mbti テーブル)]
    
    H[ユーザー<br/>MBTI: INTJ] -->|ログイン| I[Frontend]
    I -->|GET /api/events?mbti=INTJ| C
    I -->|GET /api/events-edited| J[EventEditedController]
    
    J -->|INTJ用説明取得| G
    G -->|パーソナライズ済み<br/>イベント情報| I
    
    style B fill:#e1f5ff
    style G fill:#e1f5ff
    style E fill:#fff4e1
```

## 実装済み機能

✅ **Core Infrastructure**
- SupabaseClient DI (Dependency Injection)
- Repository Pattern実装
- Service Layer実装

✅ **API Endpoints**
- User CRUD
- Event取得
- Events_mbti CRUD
- MBTI生成統合フロー

✅ **AI Integration**
- OpenAI GPT連携
- MBTI 16種類別文言生成
- バッチ処理（全MBTIタイプ一括生成）

## 今後の拡張

🔄 **予定機能**
- スクレイピング機能のマージ
- Auth0認証統合
- イベント投稿機能（event_posts）
- レコメンデーション機能強化
