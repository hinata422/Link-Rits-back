export interface EventEditedRepository {
    // イベントIDから編集情報を取得（RAGバッチ処理で使用）
    findByEventId(eventId: string): Promise<any[]>;

    // MBTI別イベント情報を保存/更新
    upsert(data: { events_id: string; mbti_type: string; detail_edited: string }): Promise<any>;
}
