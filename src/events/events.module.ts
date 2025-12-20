import { Module } from '@nestjs/common';
import { EventsService } from './events.service';

@Module({
  providers: [EventsService],
  exports: [EventsService], // ScrapingModuleから使えるように公開
})
export class EventsModule {}
