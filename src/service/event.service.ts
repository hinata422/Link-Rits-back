import { Inject, Injectable } from '@nestjs/common';
import type { EventRepository } from '../repository/event/event.repo';
import { EVENT_REPOSITORY } from '../tokens';

@Injectable()
export class EventService {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepo: EventRepository,
  ) {}
  async getAll() {
    return await this.eventRepo.findAll();
  }

  async get(event_id: number) {
    return await this.eventRepo.findById(event_id);
  }
}