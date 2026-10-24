/**
 * Lazuardi Security Management System (LSMS)
 * Supabase Client Singleton with Dual-Mode Support
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LSMSStorage } from './storage-adapter';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const config = LSMSStorage.getSupabaseConfig();
  if (config.url && config.anonKey) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      return supabaseInstance;
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return null;
}

export function resetSupabaseClient(): void {
  supabaseInstance = null;
}
