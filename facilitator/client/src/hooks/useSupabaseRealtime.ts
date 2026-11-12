import { useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Browser-safe optional Supabase Realtime client
let supabaseBrowserClient: SupabaseClient | null = null;

export function getBrowserSupabaseClient(): SupabaseClient | null {
  if (supabaseBrowserClient) return supabaseBrowserClient;

  // Check window or Vite env
  const url = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const anonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  if (url && anonKey && !url.includes('your-project')) {
    try {
      supabaseBrowserClient = createClient(url, anonKey);
    } catch {
      supabaseBrowserClient = null;
    }
  }
  return supabaseBrowserClient;
}

export function useSupabaseRealtime(
  table: 'quiz_attempts' | 'topic_mastery' | 'interventions' | 'textbooks',
  onUpdate: (payload: any) => void
) {
  useEffect(() => {
    const client = getBrowserSupabaseClient();
    if (!client) return;

    const channel = client
      .channel(`realtime_${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          onUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [table, onUpdate]);
}

