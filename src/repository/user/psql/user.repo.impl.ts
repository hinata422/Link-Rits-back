import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { UserRepository } from '../user.repo';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  private readonly client: SupabaseClient;
  constructor(@Inject(SupabaseClient) supabaseClient: SupabaseClient) {
    this.client = supabaseClient;
  }

  async create(user: any) {
    const { data, error } = await this.client
      .from('users')
      .insert(user)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findByAuth0Id(linkUserCode: string) {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('link_user_code', linkUserCode)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async update(linkUserCode: string, userData: any) {
    const { data, error } = await this.client
      .from('users')
      .update(userData)
      .eq('link_user_code', linkUserCode)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}