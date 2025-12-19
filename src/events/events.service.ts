import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventPostDto } from '../scraping/dto/event-post.dto'; // ディレクトリ名が scraiping の場合は修正してください
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  // システムユーザーの固定ID (環境変数で管理することを推奨)
  private readonly SYSTEM_USER_UID = '00000000-0000-0000-0000-000000000000';

  constructor(private readonly prisma: PrismaService) {}

  async saveEvents(eventDtos: CreateEventPostDto[]): Promise<void> {
    if (eventDtos.length === 0) return;
    this.logger.log(`Saving ${eventDtos.length} events to DB via Prisma...`);

    for (const dto of eventDtos) {
      try {
        // トランザクション: 全て成功するか、全て失敗してロールバックするかのどちらか
        await this.prisma.$transaction(async (tx) => {
          // 1. システムユーザーの存在確認・作成 (Userテーブル)
          await tx.user.upsert({
            where: { id: this.SYSTEM_USER_UID },
            update: {}, // 既にいれば何もしない
            create: {
              id: this.SYSTEM_USER_UID,
              auth0Id: 'system|admin',
              displayName: 'System Admin',
              email: 'system@example.com',
              gender: 'NO_ANSWER',
              age: 99,
              faculty: 'INFO_SCI', // 情報理工学部 (Enum定義に合わせる)
            },
          });

          // 2. イベントマスタの作成 (Eventテーブル)
          const event = await tx.event.create({
            data: {
              title: dto.title,
              place: dto.place || '未定',
              detail: dto.detail,
              scrapedAt: new Date(),
              startAt: dto.postTime, // 開始日時
              endAt: dto.postLimit, // 終了日時
              dateText: dto.postTime.toISOString(),
            },
          });

          // 3. イベント投稿の作成 (EventPostテーブル)
          await tx.eventPost.create({
            data: {
              userId: this.SYSTEM_USER_UID,
              eventId: event.id, // 作成したイベントと紐付け
              title: dto.title,
              place: dto.place || '未定',
              detail: dto.detail,
              postTime: new Date(),
              postLimit: dto.postLimit,
              chatRoomId: dto.chatRoomId || uuidv4(),
            },
          });
        });
      } catch (error) {
        this.logger.error(`Failed to save event "${dto.title}":`, error);
        // 1つの保存失敗で全体を止めないようにここでキャッチ
      }
    }

    this.logger.log('Events save process completed.');
  }
}
