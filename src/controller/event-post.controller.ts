import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { EventPostService } from '../service/event-post.service';

@Controller('api/event-posts')
export class EventPostController {
    constructor(private readonly eventPostService: EventPostService) { }

    /**
     * POST /api/event-posts/
     * イベント投稿を作成
     */
    @Post()
    async create(@Body() body: {
        uid: string;
        event_id: string;
        post_limit: string;
    }) {
        const eventPostData = {
            uid: body.uid,
            event_id: body.event_id,
            post_limit: new Date(body.post_limit),
        };
        return await this.eventPostService.create(eventPostData);
    }

    /**
     * GET /api/event-posts/:id
     * イベント投稿を取得
     */
    @Get(':id')
    async get(@Param('id') id: string) {
        const eventPost = await this.eventPostService.get(id);
        if (!eventPost) {
            return {
                error: 'イベント投稿が見つかりません',
            };
        }
        return eventPost;
    }

    /**
     * GET /api/event-posts?user_id=xxx
     * ユーザーの投稿一覧を取得
     */
    @Get()
    async list(@Query('user_id') userId?: string, @Query('event_id') eventId?: string) {
        if (userId) {
            return await this.eventPostService.getByUserId(userId);
        }
        if (eventId) {
            return await this.eventPostService.getByEventId(eventId);
        }
        return {
            error: 'user_id または event_id パラメータが必要です',
        };
    }

    /**
     * PUT /api/event-posts/:id
     * イベント投稿を更新
     */
    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() body: {
            post_limit?: string;
        },
    ) {
        const updateData: any = {};
        if (body.post_limit) {
            updateData.post_limit = new Date(body.post_limit);
        }
        return await this.eventPostService.update(id, updateData);
    }

    /**
     * DELETE /api/event-posts/:id
     * イベント投稿を削除
     */
    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.eventPostService.delete(id);
        return {
            message: 'イベント投稿を削除しました',
        };
    }
}
