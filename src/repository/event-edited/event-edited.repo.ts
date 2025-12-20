import { MBTIType } from '../../../lib/mbti/mbti-profiles';

export interface EventEditedRepository {
    // イベントIDから編集情報を取得（RAGバッチ処理で使用）
    findByEventId(eventId: string): Promise<any[]>;

    // MBTI別イベント情報を保存/更新
    upsert(data: { event_id: string; mbti_type: MBTIType; detail_edited: string }): Promise<any>;
}
