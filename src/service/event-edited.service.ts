import { Inject, Injectable } from '@nestjs/common';
import type { EventEditedRepository } from '../repository/event-edited/event-edited.repo';
import { TYPES } from '../../common/Types';

@Injectable()
export class EventEditedService {
    constructor(
        @Inject(TYPES.EventEditedRepository)
        private readonly eventEditedRepo: EventEditedRepository,
    ) { }

    // イベントIDから編集情報一覧取得（RAG処理結果）
    async getByEventId(eventId: string) {
        return await this.eventEditedRepo.findByEventId(eventId);
    }
}
