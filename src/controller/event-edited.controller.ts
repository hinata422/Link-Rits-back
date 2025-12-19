import { Controller, Get, Query } from '@nestjs/common';
import { EventEditedService } from '../service/event-edited.service';

@Controller('api/events-edited')
export class EventEditedController {
    constructor(private readonly eventEditedService: EventEditedService) { }

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
