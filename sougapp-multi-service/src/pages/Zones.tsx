import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { Map, Plus } from 'lucide-react';
import { ZoneModal } from '../components/ZoneModal';
import { EditZoneModal } from '../components/EditZoneModal';

interface Zone {
  id: number;
  name: string;
  status: string;
  created_at: string;
}

export function Zones() {
  const { t } = useTranslation();
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('zones')
      .select('*')
      .order('name', { ascending: true });

    if (!error && data) {
      setZones(data);
    } else {
      setZones([
        { id: 1, name: 'Nouakchott', status: 'active', created_at: new Date().toISOString() },
        { id: 2, name: 'Nouadhibou', status: 'inactive', created_at: new Date().toISOString() },
      ]);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-text">{t('zones')}</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-strong text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Nouvelle Zone
        </button>
      </div>

      <div className="bg-surface rounded-2xl shadow-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right">
            <thead className="bg-surface-2 text-muted font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">Nom de la Zone</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-muted">
                    Chargement...
                  </td>
                </tr>
              ) : zones.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Map size={40} className="text-faint" />
                      <p className="text-muted">Aucune zone trouvée.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                zones.map((zone) => (
                  <tr key={zone.id} className="border-b border-border hover:bg-surface-2 transition-colors">
                    <td data-label="Zone" className="px-6 py-4">
                      <span className="sm:hidden text-xs text-muted font-medium block mb-1">Zone</span>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-faint shrink-0">
                          <Map size={18} />
                        </div>
                        <div className="font-medium text-text">{zone.name}</div>
                      </div>
                    </td>
                    <td data-label="Statut" className="px-6 py-4">
                      <span className="sm:hidden text-xs text-muted font-medium block mb-1">Statut</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                        ${zone.status === 'active' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}
                      >
                        {zone.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td data-label="Actions" className="px-6 py-4 text-center">
                      <button 
                        onClick={() => {
                          setSelectedZone(zone);
                          setIsEditModalOpen(true);
                        }}
                        className="text-primary hover:text-primary-strong text-sm font-medium min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
                      >
                        Modifier
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ZoneModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchZones}
      />

      <EditZoneModal 
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedZone(null);
        }}
        onSuccess={fetchZones}
        zone={selectedZone}
      />
    </div>
  );
}
