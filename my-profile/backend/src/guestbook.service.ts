import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class GuestbookService {
  private supabase;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_KEY')!
    );
  }

  async findAll() {
    const { data, error } = await this.supabase
      .from('guestbook')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async create(dto: any) {
    const { data, error } = await this.supabase
      .from('guestbook')
      .insert([dto])
      .select();

    if (error) throw error;
    return data;
  }

  async update(id: string, dto: any) {
    const { data, error } = await this.supabase
      .from('guestbook')
      .update(dto)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data;
  }

  async delete(id: string) {
    const { error } = await this.supabase
      .from('guestbook')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Deleted successfully' };
  }
}