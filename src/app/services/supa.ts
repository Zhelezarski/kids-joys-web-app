import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../config';

@Injectable({ providedIn: 'root' })
export class Supa {
  readonly client: SupabaseClient | null =
    SUPABASE_URL && SUPABASE_ANON_KEY
      ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            // Brez zaklepanja prek navigator.locks (ena zavihek-aplikacija je dovolj).
            lock: async <R>(_ime: string, _cas: number, fn: () => Promise<R>): Promise<R> => fn(),
          },
        })
      : null;

  get povezan(): boolean {
    return this.client !== null;
  }
}
