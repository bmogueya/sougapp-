import { useState, useCallback } from 'react';

interface PaginationState { page: number; pageSize: number; total: number; }

export function usePagination(initialPageSize: number = 20) {
  const [pagination, setPagination] = useState<PaginationState>({ page: 0, pageSize: initialPageSize, total: 0 });
  const setPage = useCallback((page: number) => setPagination(prev => ({ ...prev, page })), []);
  const setTotal = useCallback((total: number) => setPagination(prev => ({ ...prev, total })), []);
  const nextPage = useCallback(() => setPagination(prev => ({ ...prev, page: prev.page + 1 })), []);
  const prevPage = useCallback(() => setPagination(prev => ({ ...prev, page: Math.max(0, prev.page - 1) })), []);
  const from = pagination.page * pagination.pageSize;
  const to = from + pagination.pageSize - 1;
  const hasMore = to < pagination.total - 1;
  return { ...pagination, from, to, hasMore, setPage, setTotal, nextPage, prevPage };
}
