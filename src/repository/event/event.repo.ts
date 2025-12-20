export interface EventRepository {
  // MVP用の基本機能のみ
  findAll(): Promise<any[]>;
  findById(id: string): Promise<any | null>;
  findByMBTI(mbtiType: string): Promise<any[]>;
  bulkInsert(events: any[]): Promise<void>;
}