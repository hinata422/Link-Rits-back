import { Injectable } from '@nestjs/common';
import { supabaseClient } from '../../../lib/supabase/supabase.client';

@Injectable()
export class UserRepositoryImpl {
  private supabase = supabaseClient(); // ← supabase の初期化をここで行う

  async findBySub(sub: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('auth0Id', sub)
      .single();

    if (error) throw error;
    return data;
  }

  async create(user: any) {
    const { data, error } = await this.supabase
      .from('users')
      .insert(user)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(sub: string, user: any) {
    const { data, error } = await this.supabase
      .from('users')
      .update(user)
      .eq('auth0Id', sub)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}