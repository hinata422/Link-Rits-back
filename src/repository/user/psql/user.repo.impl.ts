import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { UserRepository } from '../user.repo';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  private readonly client: SupabaseClient;
  constructor(supabaseClient: SupabaseClient) {
    this.client = supabaseClient;
  }

  async create(user: any) {
    const { data, error } = await this.client
      .from('User')
      .insert(user)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findByAuth0Id(auth0Id: string) {
    const { data, error } = await this.client
      .from('User')
      .select('*')
      .eq('auth0Id', auth0Id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async update(auth0Id: string, userData: any) {
    const { data, error } = await this.client
      .from('User')
      .update(userData)
      .eq('auth0Id', auth0Id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}