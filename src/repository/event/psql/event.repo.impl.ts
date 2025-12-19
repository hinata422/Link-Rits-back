import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { EventRepository } from '../event.repo';

@Injectable()
export class EventRepositoryImpl implements EventRepository {
  private readonly client: SupabaseClient;
  constructor(supabaseClient: SupabaseClient) {
    this.client = supabaseClient;
  }

  async findAll() {
    const { data, error } = await this.client
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async findById(id: string) {
    const { data, error } = await this.client
      .from('events')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async findByMBTI(mbtiType: string) {
    // MVPでは全イベントを返す（後でMBTI別フィルタリングロジックを追加可能）
    // TODO: event_mbti_id テーブルを使った関連付けを実装
    const { data, error } = await this.client
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async bulkInsert(events: any[]): Promise<void> {
    const { error } = await this.client
      .from('events')
      .insert(events);

    if (error) throw error;
  }
}