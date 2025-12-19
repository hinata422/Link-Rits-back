import { Inject, Injectable } from '@nestjs/common';
import type { EventPostRepository } from '../repository/event-post/event-post.repo';
import { TYPES } from '../../common/Types';

@Injectable()
export class EventPostService {
    constructor(
        @Inject(TYPES.EventPostRepository)
        private readonly eventPostRepo: EventPostRepository,
    ) { }

    // イベント投稿作成
    async create(data: any) {
        return await this.eventPostRepo.create(data);
    }

    // イベント投稿取得（ID指定）
    async get(id: string) {
        return await this.eventPostRepo.findById(id);
    }

    // ユーザーの投稿一覧取得
    async getByUserId(userId: string) {
        return await this.eventPostRepo.findByUserId(userId);
    }

    // イベントの投稿一覧取得
    async getByEventId(eventId: string) {
        return await this.eventPostRepo.findByEventId(eventId);
    }

    // イベント投稿更新
    async update(id: string, data: any) {
        return await this.eventPostRepo.update(id, data);
    }

    // イベント投稿削除
    async delete(id: string) {
        return await this.eventPostRepo.delete(id);
    }
}
