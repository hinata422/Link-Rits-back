import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { EventEditedService } from '../service/event-edited.service';

@Controller('api/events-edited')
export class EventEditedController {
    constructor(private readonly eventEditedService: EventEditedService) { }

    /**
     * POST /api/events-edited/
     * イベント編集情報を作成
     */
    @Post()
    async create(@Body() body: {
        events_id: string;
        detail_edited: string;
        mbti_type: string;
    }) {
        const eventEditedData = {
            events_id: body.events_id,
            detail_edited: body.detail_edited,
            mbti_type: body.mbti_type,
        };
        return await this.eventEditedService.create(eventEditedData);
    }

    /**
     * GET /api/events-edited/:id
     * イベント編集情報を取得
     */
    @Get(':id')
    async get(@Param('id') id: string) {
        const eventEdited = await this.eventEditedService.get(id);
        if (!eventEdited) {
            return {
                error: 'イベント編集情報が見つかりません',
            };
        }
        return eventEdited;
    }

    /**
     * GET /api/events-edited?event_id=xxx&mbti_type=xxx
     * イベント編集情報一覧を取得
     */
    @Get()
    async list(@Query('event_id') eventId?: string, @Query('mbti_type') mbtiType?: string) {
        if (eventId) {
            return await this.eventEditedService.getByEventId(eventId);
        }
        if (mbtiType) {
            return await this.eventEditedService.getByMbtiType(mbtiType);
        }
        return {
            error: 'event_id または mbti_type パラメータが必要です',
        };
    }

    /**
     * PUT /api/events-edited/:id
     * イベント編集情報を更新
     */
    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() body: {
            detail_edited?: string;
            mbti_type?: string;
        },
    ) {
        const updateData: any = {};
        if (body.detail_edited) updateData.detail_edited = body.detail_edited;
        if (body.mbti_type) updateData.mbti_type = body.mbti_type;

        return await this.eventEditedService.update(id, updateData);
    }

    /**
     * DELETE /api/events-edited/:id
     * イベント編集情報を削除
     */
    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.eventEditedService.delete(id);
        return {
            message: 'イベント編集情報を削除しました',
        };
    }
}
