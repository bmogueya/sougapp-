import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Merchant {
  id: string;
  name: string;
  description: string;
  address: string;
  is_open: boolean;
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
    is_open: true
  });

  useEffect(() => {
    if (merchant) {
      setFormData({
        name: merchant.name || '',
        description: merchant.description || '',
        address: merchant.address || '',
        is_open: merchant.is_open ?? true
      });
    }
  }, [merchant]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !merchant) return;
    
    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('stores')
      .update({ 
        name: formData.name, 
        description: formData.description,
        address: formData.address,
        is_open: formData.is_open
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
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier la Boutique">
      {error && (
        <div className="bg-danger/10 text-danger p-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
            disabled={loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary-strong transition-colors disabled:opacity-50"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
