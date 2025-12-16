import { Injectable } from '@nestjs/common';
import type{ EventRepository } from '../repository/event/event.repo';

@Injectable()
export class EventService {
  private readonly eventRepo: EventRepository;
  constructor(eventRepo: EventRepository) {
    this.eventRepo = eventRepo;
  }

  async getAll() {
    return await this.eventRepo.findAll();
  }

  async get(event_id: number) {
    return await this.eventRepo.findById(event_id);
  }
}