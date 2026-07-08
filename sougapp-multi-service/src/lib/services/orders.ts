import { supabase } from '../supabase';
import { getCached, setCache, invalidateCache } from '../cache';

export async function getOrders(options?: { page?: number; pageSize?: number; status?: string }) {
  const { page = 0, pageSize = 50, status } = options || {};
  const cacheKey = `orders:${page}:${pageSize}:${status || 'all'}`;
  const cached = getCached<{ data: any[]; count: number }>(cacheKey);
  if (cached) return cached;

  const from = page * pageSize;
  const to = from + pageSize - 1;
  let query = supabase.from('orders').select('*, stores(name)', { count: 'exact' });
  if (status) query = query.eq('status', status);
  query = query.order('created_at', { ascending: false }).range(from, to);

  const { data, error, count } = await query;
  if (error) return { data: null, error };
  const result = { data: data || [], count: count || 0 };
  setCache(cacheKey, result, 15000);
  return result;
}

export async function updateOrderStatus(orderId: string, status: string) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);
  invalidateCache('orders:');
  return { data, error };
}
