import { Controller, Get, Param, Query } from '@nestjs/common';
import { EventService } from '../service/event.service';
import { EventEditedService } from '../service/event-edited.service';

@Controller('api/events')
export class EventController {
  constructor(
    private readonly eventService: EventService,
    private readonly eventEditedService: EventEditedService,
  ) { }

  /**
   * GET /api/events?mbti=[mbti]
   * イベント一覧を取得する
   * ホーム画面遷移した時
   * detail_editedのみ返す
   */
  @Get()
  async list(@Query('mbti') mbti: string) {
    if (!mbti) {
      return {
        error: 'MBTIパラメータが必要です',
      };
    }
    const events = await this.eventService.list(mbti);

    // 各イベントにdetail_editedを追加
    const eventsWithEdited = await Promise.all(
      events.map(async (event: any) => {
        const editedList = await this.eventEditedService.getByEventId(event.id);
        const filtered = editedList.filter((item: any) => item.mbti_type === mbti);

        return {
          title: event.title,
          place: event.place,
          detail_edited: filtered.length > 0 ? filtered[0].detail_edited : null,
        };
      })
    );

    return eventsWithEdited;
  }

  /**
   * GET /api/events/[event_mbti_id]
   * イベント情報を取得する
   * イベントを選択したとき
   * detail_editedのみ返す
   */
  @Get(':event_mbti_id')
  async get(@Param('event_mbti_id') eventMbtiId: string, @Query('mbti') mbti?: string) {
    const event = await this.eventService.get(eventMbtiId);
    if (!event) {
      return {
        error: 'イベントが見つかりません',
      };
    }

    // detail_editedを取得
    let detailEdited = null;
    if (mbti) {
      const editedList = await this.eventEditedService.getByEventId(eventMbtiId);
      const filtered = editedList.filter((item: any) => item.mbti_type === mbti);
      detailEdited = filtered.length > 0 ? filtered[0].detail_edited : null;
    }

    return {
      title: event.title,
      place: event.place,
      detail_edited: detailEdited,
    };
  }
}