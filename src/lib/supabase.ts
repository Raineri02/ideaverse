import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://ukaитjbeislmrrctlipx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrYWl0amJlaXNsbXJyY3RsaXB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczODMxODgsImV4cCI6MjA5Mjk1OTE4OH0.FYVPwIxqLv9yJo6JCj6lVD-Cvzv6EW7Fbw6xULHD0qU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export function decode(base64: string): Uint8Array {
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export async function uploadImage(base64: string, path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('project-images')
    .upload(path, decode(base64), { contentType: 'image/jpeg', upsert: true });
  if (error) return null;
  const { data: url } = supabase.storage.from('project-images').getPublicUrl(data.path);
  return url.publicUrl;
}
