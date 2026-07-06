import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Merchant {
  id: string;
  name: string;
  description: string;
  address: string;
  status: string;
  created_at: string;
}

interface EditMerchantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  merchant: Merchant | null;
}

export function EditMerchantModal({ isOpen, onClose, onSuccess, merchant }: EditMerchantModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    status: 'pending'
  });

  useEffect(() => {
    if (merchant) {
      setFormData({
        name: merchant.name || '',
        description: merchant.description || '',
        address: merchant.address || '',
        status: merchant.status || 'pending'
      });
    }
  }, [merchant]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !merchant) return;
    
    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('merchants')
      .update({ 
        name: formData.name, 
        description: formData.description,
        address: formData.address,
        status: formData.status
      })
      .eq('id', merchant.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    onSuccess();
    onClose();
  };

  if (!merchant) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier le Marchand">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nom de la boutique/restaurant</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Adresse / Zone</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none bg-white"
          >
            <option value="pending">En attente (Pending)</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
