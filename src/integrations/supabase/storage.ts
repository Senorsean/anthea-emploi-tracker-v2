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
