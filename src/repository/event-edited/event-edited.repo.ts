export interface EventEditedRepository {
    // イベントIDから編集情報を取得（RAGバッチ処理で使用）
    findByEventId(eventId: string): Promise<any[]>;
}
