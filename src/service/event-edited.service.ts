import { Inject, Injectable } from '@nestjs/common';
import type { EventEditedRepository } from '../repository/event-edited/event-edited.repo';
import { TYPES } from '../../common/Types';

@Injectable()
export class EventEditedService {
    constructor(
        @Inject(TYPES.EventEditedRepository)
        private readonly eventEditedRepo: EventEditedRepository,
    ) { }

    // イベント編集情報作成
    async create(data: any) {
        return await this.eventEditedRepo.create(data);
    }

    // イベント編集情報取得（ID指定）
    async get(id: string) {
        return await this.eventEditedRepo.findById(id);
    }

    // イベントIDから編集情報一覧取得
    async getByEventId(eventId: string) {
        return await this.eventEditedRepo.findByEventId(eventId);
    }

    // MBTIタイプから編集情報一覧取得
    async getByMbtiType(mbtiType: string) {
        return await this.eventEditedRepo.findByMbtiType(mbtiType);
    }

    // イベント編集情報更新
    async update(id: string, data: any) {
        return await this.eventEditedRepo.update(id, data);
    }

    // イベント編集情報削除
    async delete(id: string) {
        return await this.eventEditedRepo.delete(id);
    }
}
