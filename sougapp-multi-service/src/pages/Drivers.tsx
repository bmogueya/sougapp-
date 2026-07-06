import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, UserPlus, MapPin, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

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
  const { t } = useTranslation();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'driver')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      setDrivers(data as any[]);
    } else {
      // Mock data if no drivers exist
      setDrivers([
        { id: '1', first_name: 'Amadou', last_name: 'Ba', phone: '+222 45 00 11 22', status: 'active', zone_id: 1, created_at: new Date().toISOString() },
        { id: '2', first_name: 'Ousmane', last_name: 'Sow', phone: '+222 45 00 33 44', status: 'inactive', zone_id: 1, created_at: new Date().toISOString() },
        { id: '3', first_name: 'Cheikh', last_name: 'Fall', phone: '+222 45 00 55 66', status: 'active', zone_id: 2, created_at: new Date().toISOString() },
      ]);
    }
    setLoading(false);
  };

  const filteredDrivers = drivers.filter(d => 
    (d.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (d.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Livreurs</h1>
        <button 
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <UserPlus size={16} />
          Nouveau Livreur
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-sm">
            <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un livreur..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full ltr:pl-10 rtl:pr-10 ltr:pr-4 rtl:pl-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
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
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Chargement...</td>
                </tr>
              ) : filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Aucun livreur trouvé.</td>
                </tr>
              ) : (
                filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {driver.first_name} {driver.last_name}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {driver.phone || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                        ${driver.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}
                      >
                        {driver.status === 'active' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        {driver.status === 'active' ? 'En ligne' : 'Hors ligne'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={16} className="text-slate-400" />
                        <span>{driver.zone_id ? `Zone ${driver.zone_id}` : 'Non assigné'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Détails
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
