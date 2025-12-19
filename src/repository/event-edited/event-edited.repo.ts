export interface EventEditedRepository {
    // イベント編集情報の基本機能
    create(eventEdited: any): Promise<any>;
    findById(id: string): Promise<any | null>;
    findByEventId(eventId: string): Promise<any[]>;
    findByMbtiType(mbtiType: string): Promise<any[]>;
    update(id: string, data: any): Promise<any>;
    delete(id: string): Promise<void>;
}
