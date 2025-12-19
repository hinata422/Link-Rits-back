import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { EventPostRepository } from '../event-post.repo';

@Injectable()
export class EventPostRepositoryImpl implements EventPostRepository {
    private readonly client: SupabaseClient;
    constructor(supabaseClient: SupabaseClient) {
        this.client = supabaseClient;
    }

    async create(eventPost: any) {
        const { data, error } = await this.client
            .from('event_posts')
            .insert(eventPost)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async findById(id: string) {
        const { data, error } = await this.client
            .from('event_posts')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    async findByUserId(userId: string) {
        const { data, error } = await this.client
            .from('event_posts')
            .select('*')
            .eq('uid', userId)
            .order('post_time', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async findByEventId(eventId: string) {
        const { data, error } = await this.client
            .from('event_posts')
            .select('*')
            .eq('event_id', eventId)
            .order('post_time', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async update(id: string, updateData: any) {
        const { data, error } = await this.client
            .from('event_posts')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async delete(id: string): Promise<void> {
        const { error } = await this.client
            .from('event_posts')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
}
