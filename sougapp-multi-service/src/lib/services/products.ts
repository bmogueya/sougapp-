import { supabase } from '../supabase';
import { getCached, setCache, invalidateCache } from '../cache';

export async function getProducts(storeId?: string) {
  const cacheKey = `products:${storeId || 'all'}`;
  const cached = getCached<{ data: any[] }>(cacheKey);
  if (cached) return cached;

  let query = supabase.from('products').select('*, categories(name)');
  if (storeId) query = query.eq('store_id', storeId);
  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) return { data: null, error };
  const result = { data: data || [] };
  setCache(cacheKey, result, 15000);
  return result;
}

export async function createProduct(product: any) {
  const { data, error } = await supabase.from('products').insert(product);
  invalidateCache('products:');
  return { data, error };
}

export async function updateProduct(id: string, updates: any) {
  const { data, error } = await supabase.from('products').update(updates).eq('id', id);
  invalidateCache('products:');
  return { data, error };
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  invalidateCache('products:');
  return { error };
}
