import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { EventRepository } from '../event.repo';


@Injectable()
export class EventRepositoryImpl implements EventRepository {
  private readonly client: SupabaseClient;
  constructor(supabaseClient: SupabaseClient) {
    this.client = supabaseClient;
  }

  async bulkInsert(events: any[]): Promise<void> {
    const { error } = await this.client
      .from('events')
      .insert(events);
    
    if (error) throw error;
  }
  async findAll() {
    const { data, error } = await this.client
      .from('events')
      .select('*');

    if (error) throw error;
    return data;
  }

  async findById(event_id: number) {
    const { data, error } = await this.client
      .from('events')
      .select('*')
      .eq('event_id', event_id)
      .single();

    if (error) throw error;
    return data;
  }
}