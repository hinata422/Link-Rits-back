export  interface EventRepository  {
  bulkInsert(events: any[]): Promise<void>;
  findAll(): Promise<any[]>;
  findById(event_id: number): Promise<any>;
}