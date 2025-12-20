import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { PlainTextToMbtiLikeConverter } from '../service/plain-text-to-mbti-like-converter.service';
import { EventEditedService } from '../service/event-edited.service';
import { EventService } from '../service/event.service';
import { MBTIType } from '../../lib/mbti/mbti-profiles';
import { randomUUID } from 'crypto';

@Controller('api/test-mbti')
export class TestMbtiController {
    constructor(
        private readonly converter: PlainTextToMbtiLikeConverter,
        private readonly eventEditedService: EventEditedService,
        private readonly eventService: EventService,
    ) { }

    /**
     * POST /api/test-mbti/generate
     * Postmanで使用: イベントIDを指定してMBTI別文言を生成＆Supabaseに保存
     */
    @Post('generate')
    async generateAndSave(@Body('event_id') eventId: string) {
        try {
            // 1. イベント取得
            const event = await this.eventService.get(eventId);
            if (!event) {
                return { success: false, error: `イベントが見つかりません: ${eventId}` };
            }

            console.log(`📝 イベント取得: ${event.title}`);

            // 2. OpenAI APIでMBTI別文言を生成（16種類）
            console.log('🤖 OpenAI APIでMBTI別文言を生成中...');
            const mbtiDescriptions = await this.converter.convertAll(event.title, event.detail);
            console.log(`✅ ${Object.keys(mbtiDescriptions).length}種類の文言を生成完了`);

            // 3. Supabaseに保存
            const saved = [];
            for (const [mbtiType, detailEdited] of Object.entries(mbtiDescriptions)) {
                await this.eventEditedService.upsert({
                    id: randomUUID(), // UUIDを自動生成
                    event_id: eventId,
                    mbti_type: mbtiType as MBTIType,
                    detail_edited: detailEdited,
                } as any);
                saved.push(mbtiType);
                console.log(`💾 保存完了: ${mbtiType}`);
            }

            return {
                success: true,
                event: { id: event.id, title: event.title },
                saved_count: saved.length,
                saved_mbti_types: saved,
            };
        } catch (error: any) {
            console.error('❌ エラー:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * GET /api/test-mbti/verify?event_id=xxx
     * 保存されたデータを確認
     */
    @Get('verify')
    async verify(@Query('event_id') eventId: string) {
        const editedList = await this.eventEditedService.getByEventId(eventId);
        return {
            success: true,
            event_id: eventId,
            saved_count: editedList.length,
            data: editedList.map((item: any) => ({
                mbti_type: item.mbti_type,
                preview: item.detail_edited.substring(0, 80) + '...',
            })),
        };
    }
}
