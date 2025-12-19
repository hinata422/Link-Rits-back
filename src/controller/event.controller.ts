import { Controller, Get, Param, Query } from '@nestjs/common';
import { EventService } from '../service/event.service';

@Controller('api/events')
export class EventController {
  constructor(private readonly eventService: EventService) { }

  /**
   * GET /api/events?mbti=[mbti]
   * イベント一覧を取得する
   * ホーム画面遷移した時
   */
  @Get()
  async list(@Query('mbti') mbti: string) {
    if (!mbti) {
      return {
        error: 'MBTIパラメータが必要です',
      };
    }
    const events = await this.eventService.list(mbti);
    return events;
  }

  /**
   * GET /api/events/[event_mbti_id]
   * イベント情報を取得する
   * イベントを選択したとき
   */
  @Get(':event_mbti_id')
  async get(@Param('event_mbti_id') eventMbtiId: string) {
    const event = await this.eventService.get(eventMbtiId);
    if (!event) {
      return {
        error: 'イベントが見つかりません',
      };
    }
    return event;
  }
}