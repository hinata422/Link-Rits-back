import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { EventEditedService } from '../service/event-edited.service';
import { randomUUID } from 'crypto';

@Controller('api/events-edited')
export class EventEditedController {
    constructor(private readonly eventEditedService: EventEditedService) { }

    /**
     * POST /api/events-edited
     * MBTI別イベント説明を作成/更新
     */
    @Post()
    async create(@Body() body: {
        event_id: string;
        mbti_type: string;
        detail_edited: string;
    }) {
        if (!body.event_id || !body.mbti_type || !body.detail_edited) {
            return {
                error: 'event_id, mbti_type, detail_edited パラメータが必要です',
            };
        }

        const result = await this.eventEditedService.upsert({
            id: randomUUID(), // UUIDを自動生成
            event_id: body.event_id,
            mbti_type: body.mbti_type as any, // MBTITypeにキャスト
            detail_edited: body.detail_edited,
        } as any);

        return {
            success: true,
            data: result,
        };
    }

    /**
     * GET /api/events-edited?event_id=xxx&mbti_type=xxx
     * RAG処理されたイベント編集情報を取得
     * イベント詳細をMBTIタイプに合わせてカスタマイズした内容を返す
     */
    @Get()
    async get(@Query('event_id') eventId?: string, @Query('mbti_type') mbtiType?: string) {
        if (!eventId || !mbtiType) {
            return {
                error: 'event_id と mbti_type パラメータが必要です',
            };
        }

        // event_idとmbti_typeの両方で検索
        const editedList = await this.eventEditedService.getByEventId(eventId);
        const filtered = editedList.filter((item: any) => item.mbti_type === mbtiType);

        if (filtered.length === 0) {
            return {
                detail_edited: null,
            };
        }

        // 最初の一致するものを返す
        return {
            detail_edited: filtered[0].detail_edited,
        };
    }
}
