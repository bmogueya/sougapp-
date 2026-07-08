import { supabase } from '../supabase';
import { getCached, setCache, invalidateCache } from '../cache';

export async function getStores() {
  const cacheKey = 'stores';
  const cached = getCached<{ data: any[] }>(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('stores')
    .select('*, profiles(first_name, last_name)')
    .order('created_at', { ascending: false });

  if (error) return { data: null, error };
  const result = { data: data || [] };
  setCache(cacheKey, result, 15000);
  return result;
}

export async function updateStore(id: string, updates: Record<string, any>) {
  const { data, error } = await supabase.from('stores').update(updates).eq('id', id);
  invalidateCache('stores');
  return { data, error };
}
