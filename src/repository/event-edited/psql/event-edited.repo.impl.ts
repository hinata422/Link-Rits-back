import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { EventEditedRepository } from '../event-edited.repo';
import { MBTIType } from '../../../../lib/mbti/mbti-profiles';

@Injectable()
export class EventEditedRepositoryImpl implements EventEditedRepository {
    private readonly client: SupabaseClient;
    constructor(@Inject(SupabaseClient) supabaseClient: SupabaseClient) {
        this.client = supabaseClient;
    }

    async findByEventId(eventId: string) {
        const { data, error } = await this.client
            .from('events_mbti')
            .select('*')
            .eq('event_id', eventId);

        if (error) throw error;
        return data || [];
    }

    async upsert(data: { event_id: string; mbti_type: MBTIType; detail_edited: string }) {
        const { data: result, error } = await this.client
            .from('events_mbti')
            .upsert(data, {
                onConflict: 'event_id,mbti_type',
            })
            .select()
            .single();

        if (error) throw error;
        return result;
    }
}
