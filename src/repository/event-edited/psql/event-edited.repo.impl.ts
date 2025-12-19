import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { EventEditedRepository } from '../event-edited.repo';

@Injectable()
export class EventEditedRepositoryImpl implements EventEditedRepository {
    private readonly client: SupabaseClient;
    constructor(supabaseClient: SupabaseClient) {
        this.client = supabaseClient;
    }

    async create(eventEdited: any) {
        const { data, error } = await this.client
            .from('events_edited')
            .insert(eventEdited)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async findById(id: string) {
        const { data, error } = await this.client
            .from('events_edited')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    async findByEventId(eventId: string) {
        const { data, error } = await this.client
            .from('events_edited')
            .select('*')
            .eq('events_id', eventId);

        if (error) throw error;
        return data || [];
    }

    async findByMbtiType(mbtiType: string) {
        const { data, error } = await this.client
            .from('events_edited')
            .select('*')
            .eq('mbti_type', mbtiType);

        if (error) throw error;
        return data || [];
    }

    async update(id: string, updateData: any) {
        const { data, error } = await this.client
            .from('events_edited')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async delete(id: string): Promise<void> {
        const { error } = await this.client
            .from('events_edited')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
}
