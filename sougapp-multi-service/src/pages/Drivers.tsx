import { useState, useEffect, useCallback } from 'react';
import { Search, UserPlus, MapPin, CheckCircle2, XCircle, Car } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { useDebounce } from '../lib/hooks/useDebounce';
import { usePagination } from '../lib/hooks/usePagination';

interface Driver {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  status: 'active' | 'inactive';
  zone_id: number | null;
  created_at: string;
}

export function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { page, total, from, to, hasMore, setTotal, setPage, nextPage, prevPage } = usePagination(20);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchDrivers();
  }, [debouncedSearch, page]);

  const fetchDrivers = async () => {
    setLoading(true);
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .eq('role', 'driver');

    if (debouncedSearch) {
      query = query.or(`first_name.ilike.%${debouncedSearch}%,last_name.ilike.%${debouncedSearch}%`);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (!error && data) {
      setDrivers(data as any[]);
      if (count !== null) setTotal(count);
    }
    setLoading(false);
  };

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-text">Livreurs</h1>
        <button 
          className="bg-primary hover:bg-primary-strong text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <UserPlus size={16} />
          Nouveau Livreur
        </button>
      </div>

      <div className="bg-surface rounded-2xl shadow-card border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-faint" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un livreur..." 
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full ltr:pl-10 rtl:pr-10 ltr:pr-4 rtl:pl-4 py-2 border border-border bg-surface text-text rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right">
            <thead className="bg-surface-2 text-muted font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">Nom Complet</th>
                <th className="px-6 py-4">Téléphone</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Zone</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted">Chargement...</td>
                </tr>
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Car size={40} className="text-faint" />
                      <p className="text-muted">Aucun livreur trouvé.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                drivers.map((driver) => (
                  <tr key={driver.id} className="border-b border-border hover:bg-surface-2 transition-colors">
                    <td data-label="Nom" className="px-6 py-4">
                      <span className="sm:hidden text-xs text-muted font-medium block mb-1">Nom</span>
                      <span className="font-medium text-text">{driver.first_name} {driver.last_name}</span>
                    </td>
                    <td data-label="Téléphone" className="px-6 py-4">
                      <span className="sm:hidden text-xs text-muted font-medium block mb-1">Téléphone</span>
                      <span className="text-muted">{driver.phone || '-'}</span>
                    </td>
                    <td data-label="Statut" className="px-6 py-4">
                      <span className="sm:hidden text-xs text-muted font-medium block mb-1">Statut</span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                        ${driver.status === 'active' ? 'bg-success/10 text-success' : 'bg-surface-2 text-muted'}`}
                      >
                        {driver.status === 'active' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        {driver.status === 'active' ? 'En ligne' : 'Hors ligne'}
                      </span>
                    </td>
                    <td data-label="Zone" className="px-6 py-4">
                      <span className="sm:hidden text-xs text-muted font-medium block mb-1">Zone</span>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={16} className="text-faint shrink-0" />
                        <span>{driver.zone_id ? `Zone ${driver.zone_id}` : 'Non assigné'}</span>
                      </div>
                    </td>
                    <td data-label="Actions" className="px-6 py-4 text-center">
                      <button className="text-primary hover:text-primary-strong text-sm font-medium min-h-[44px] min-w-[44px] inline-flex items-center justify-center">
                        Détails
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <span className="text-sm text-muted">{total} résultats</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={prevPage} disabled={page === 0}>Précédent</Button>
            <Button variant="outline" size="sm" onClick={nextPage} disabled={!hasMore}>Suivant</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
