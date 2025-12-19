import { Inject, Injectable } from '@nestjs/common';
import { EventRepository } from '../repository/event/event.repo';
import { TYPES } from '../../common/Types';

@Injectable()
export class EventService {
  constructor(
    @Inject(TYPES.EventRepository)
    private readonly eventRepo: EventRepository,
  ) {}
 // MBTI別イベント一覧取得
  async list(mbtiType: string) {
    return await this.eventRepo.findByMBTI(mbtiType);
  }

  // イベント取得
  async get(id: string) {
    return await this.eventRepo.findById(id);
  }
}