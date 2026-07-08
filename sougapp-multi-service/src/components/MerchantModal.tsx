import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { storeSchema } from '../lib/schemas';

interface MerchantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function MerchantModal({ isOpen, onClose, onSuccess }: MerchantModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [merchants, setMerchants] = useState<{id: string, first_name: string, last_name: string}[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    is_open: true,
    owner_id: '',
    module_id: 'food' // fallback
  });

  useEffect(() => {
    if (isOpen) {
      // Fetch users with merchant role
      supabase.from('profiles').select('id, first_name, last_name').eq('role', 'merchant')
        .then(({ data }) => {
          if (data) {
            setMerchants(data);
            if (data.length > 0) setFormData(prev => ({ ...prev, owner_id: data[0].id }));
          }
        });
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError(null);

    const result = storeSchema.safeParse(formData);
    if (!result.success) {
      setError(result.error.issues[0].message);
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from('stores')
      .insert([
        { 
          name: formData.name, 
          description: formData.description,
          address: formData.address,
          is_open: formData.is_open,
          owner_id: formData.owner_id,
          module_id: formData.module_id
        }
      ]);

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Créer une Boutique">
      {error && (
        <div className="bg-danger/10 text-danger p-3 rounded-lg mb-6 text-sm" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1">Propriétaire (Marchand)</label>
          <select
            name="owner_id"
            value={formData.owner_id}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-border bg-surface text-text rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
            required
          >
            {merchants.map(m => (
              <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
            ))}
            {merchants.length === 0 && <option value="">Aucun marchand disponible</option>}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1">Nom de la boutique</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-border bg-surface text-text rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1">Description</label>
          <textarea
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-border bg-surface text-text rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1">Adresse / Zone</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-border bg-surface text-text rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="is_open"
              checked={formData.is_open}
              onChange={handleChange}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-text">Boutique Ouverte</span>
          </label>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-muted hover:bg-surface-2 rounded-lg text-sm font-medium transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading || !formData.owner_id}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary-strong transition-colors disabled:opacity-50"
          >
            {loading ? 'Création...' : 'Créer la boutique'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
