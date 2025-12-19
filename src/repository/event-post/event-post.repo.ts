export interface EventPostRepository {
    // イベント投稿の基本機能
    create(eventPost: any): Promise<any>;
    findById(id: string): Promise<any | null>;
    findByUserId(userId: string): Promise<any[]>;
    findByEventId(eventId: string): Promise<any[]>;
    update(id: string, data: any): Promise<any>;
    delete(id: string): Promise<void>;
}
