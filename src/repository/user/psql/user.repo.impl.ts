import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { UserRepository } from '../user.repo';


@Injectable()
export class UserRepositoryImpl implements UserRepository {
  private readonly client: SupabaseClient;
  constructor(supabaseClient: SupabaseClient) {
    this.client = supabaseClient;
  }

  async findByAuth0Id(id: string) {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('auth0Id', id)
      .single();

    if (error) throw error;
    return data;
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

  async update(sub: string, user: any) {
    const { data, error } = await this.client
      .from('users')
      .update(user)
      .eq('auth0Id', sub)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}