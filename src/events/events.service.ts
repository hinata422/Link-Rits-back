import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventPostDto } from '../scraping/dto/event-post.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  // システムユーザーの固定ID (デフォルト)
  private readonly SYSTEM_USER_UID = '00000000-0000-0000-0000-000000000000';

  constructor(private readonly prisma: PrismaService) { }

  async saveEvents(eventDtos: CreateEventPostDto[]): Promise<void> {
    if (eventDtos.length === 0) return;
    this.logger.log(`Saving ${eventDtos.length} events to DB via Prisma...`);

    for (const dto of eventDtos) {
      // トランザクション: 全て成功するか、全て失敗してロールバックするかのどちらか
      // Prisma Clientの型定義不整合(EPERMによる更新失敗)のため、as anyキャストを使用
      // また、トランザクション内でのサイレントエラー回避のため、一時的に順次実行に変更
      try {
        const tx = this.prisma; // Use main client instead of tx

        // 1. システムユーザー
        const systemUserId = this.SYSTEM_USER_UID;
        const existingUser = await tx.user.findUnique({ where: { id: systemUserId } });

        if (!existingUser) {
          await tx.user.create({
            data: {
              id: systemUserId,
              displayName: 'System Admin',
              linkUserCode: 'system_admin_code',
              // auth0Id, gender等を削除済
            } as any,
          });
        }

        // 2. イベントマスタ
        const existingEvent = await tx.event.findFirst({
          where: {
            title: dto.title,
            startAt: dto.postTime,
          },
        });

        let eventId = existingEvent?.id;
        if (!existingEvent) {
          const newEvent = await tx.event.create({
            data: {
              title: dto.title,
              place: dto.place || '未定',
              detail: dto.detail,
              scrapedAt: new Date(),
              startAt: dto.postTime,
              endAt: dto.postLimit,
              dateText: dto.postTime.toISOString(),
            },
          });
          eventId = newEvent.id;
        }

        // 3. イベント投稿
        const existingPost = await tx.eventPost.findFirst({
          where: {
            userId: systemUserId,
            eventId: eventId,
          },
        });

        if (!existingPost && eventId) {
          // DBには title, place, detail, chatRoomId が NOT NULL で存在するが、ERDにはない。
          // 整合性を取るため、ダミー値またはイベント情報を転記して埋める。
          await tx.eventPost.create({
            data: {
              userId: systemUserId,
              eventId: eventId,
              postTime: new Date(),
              postLimit: dto.postLimit,

              // --- DB制約対応 (ERD外) ---
              title: dto.title, // イベントタイトルをコピー
              place: dto.place || '未定',
              detail: dto.detail || '',
              chatRoomId: uuidv4(), // チャットルームID生成
            } as any,
          });
        }
      } catch (error) {
        this.logger.error(`❌ Failed to save event "${dto.title}"`);
        if (error instanceof Error) {
          this.logger.error(`   Message: ${error.message}`);
        } else {
          this.logger.error(`   Error object: ${JSON.stringify(error)}`);
        }
      }
    }
    this.logger.log('Events save process completed.');
  }
}
