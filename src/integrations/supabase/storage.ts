import { supabase } from './client';

export async function uploadJson(bucket: string, path: string, data: any) {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, JSON.stringify(data), {
      contentType: 'application/json',
      upsert: true,
    });
  return { error };
}

export async function downloadJson<T = unknown>(bucket: string, path: string) {
  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error || !data) {
    return { data: null as T | null, error };
  }
  try {
    const text = await data.text();
    return { data: JSON.parse(text) as T, error: null };
  } catch (err) {
    return { data: null as T | null, error: err as Error };
  }
}
