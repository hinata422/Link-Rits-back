import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { EventEditedRepository } from '../event-edited.repo';

@Injectable()
export class EventEditedRepositoryImpl implements EventEditedRepository {
    private readonly client: SupabaseClient;
    constructor(supabaseClient: SupabaseClient) {
        this.client = supabaseClient;
    }

    async findByEventId(eventId: string) {
        const { data, error } = await this.client
            .from('events_edited')
            .select('*')
            .eq('events_id', eventId);

        if (error) throw error;
        return data || [];
    }

    async upsert(data: { events_id: string; mbti_type: string; detail_edited: string }) {
        const { data: result, error } = await this.client
            .from('events_edited')
            .upsert(data, {
                onConflict: 'events_id,mbti_type',
            })
            .select()
            .single();

        if (error) throw error;
        return result;
    }
}
