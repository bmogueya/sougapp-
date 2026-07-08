import { supabase } from '../supabase';
import { getCached, setCache } from '../cache';

export async function getUsers(options?: { page?: number; pageSize?: number }) {
  const { page = 0, pageSize = 50 } = options || {};
  const cacheKey = `users:${page}:${pageSize}`;
  const cached = getCached<{ data: any[]; count: number }>(cacheKey);
  if (cached) return cached;

  const from = page * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) return { data: null, error };
  const result = { data: data || [], count: count || 0 };
  setCache(cacheKey, result, 15000);
  return result;
}

export async function getDrivers() {
  const cacheKey = 'drivers';
  const cached = getCached<{ data: any[] }>(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'driver')
    .order('created_at', { ascending: false });

  if (error) return { data: null, error };
  const result = { data: data || [] };
  setCache(cacheKey, result, 15000);
  return result;
}
