import { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Search, Tag, Edit, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/Modal";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  image_url: string | null;
  module_id: string;
  is_active: boolean;
  created_at: string;
}

const EMPTY_FORM = { name: "", image_url: null as string | null, module_id: "", is_active: true };

export function MerchantCategories() {
  const { session } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user.id) return;
    // On récupère d'abord la boutique du marchand, puis SES catégories
    // (auparavant la page listait les catégories de TOUS les marchands).
    supabase.from("stores").select("id").eq("owner_id", session.user.id).single()
      .then(({ data }) => {
        const sid = data?.id ?? null;
        setStoreId(sid);
        fetchCategories(sid);
      });
  }, [session?.user.id]);

  const fetchCategories = async (sid: string | null) => {
    setLoading(true);
    if (!sid) {
      setCategories([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("store_id", sid)
      .order("created_at", { ascending: false });
    if (data) setCategories(data as Category[]);
    setLoading(false);
  };

  const toggleCategory = async (id: string, current: boolean) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_active: !current } : c)),
    );
    await supabase.from("categories").update({ is_active: !current }).eq("id", id);
  };

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, image_url: cat.image_url, module_id: cat.module_id, is_active: cat.is_active });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) return;
    // module_id est une FK vers modules(id) : "" violerait la contrainte → null.
    const payload = {
      name: form.name,
      image_url: form.image_url,
      is_active: form.is_active,
      module_id: form.module_id || null,
      store_id: storeId,
    };
    if (editing) {
      await supabase.from("categories").update(payload).eq("id", editing.id);
      setCategories((prev) => prev.map((c) => (c.id === editing.id ? { ...c, ...payload } as Category : c)));
    } else {
      if (!storeId) {
        alert("Créez d'abord votre boutique dans Paramètres avant d'ajouter des catégories.");
        return;
      }
      const { data } = await supabase.from("categories").insert(payload).select().single();
      if (data) setCategories((prev) => [data as Category, ...prev]);
    }
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer cette catégorie ?")) return;
    await supabase.from("categories").delete().eq("id", id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const filteredCategories = useMemo(
    () => categories.filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()),
    ),
    [categories, searchTerm],
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Catégories</h1>
          <p className="mt-1 text-sm text-muted">
            Organisez vos produits par rayons ou catégories.
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-strong"
        >
          <Plus size={16} />
          Nouvelle Catégorie
        </button>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-4 border-b border-border p-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" size={18} />
            <input
              type="text"
              placeholder="Rechercher une catégorie..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full rounded-xl bg-bg pl-10 pr-4 py-2.5 text-sm text-text border border-border placeholder:text-faint focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right">
            <thead className="border-b border-border text-xs font-medium text-muted">
              <tr>
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Nom</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-muted">Chargement...</td></tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Tag className="mx-auto text-faint mb-3" size={48} />
                    <p className="font-medium text-text">Aucune catégorie trouvée.</p>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="border-b border-border transition-colors hover:bg-surface-2">
                    <td className="px-6 py-4">
                      {cat.image_url ? (
                        <img loading="lazy" src={cat.image_url} alt={cat.name} className="h-10 w-10 rounded-full border border-border object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {cat.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-text">{cat.name}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleCategory(cat.id, cat.is_active)}
                        className={cn(
                          "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                          cat.is_active
                            ? "bg-success/10 text-success hover:bg-success/20"
                            : "bg-surface-2 text-muted hover:bg-border",
                        )}
                      >
                        <span className={cn("h-1.5 w-1.5 rounded-full", cat.is_active ? "bg-success" : "bg-border")} />
                        {cat.is_active ? "Active" : "Désactivée"}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-3">
                        <button onClick={() => openEdit(cat)} className="text-faint hover:text-primary transition-colors">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(cat.id)} className="text-faint hover:text-danger transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Modifier la catégorie" : "Nouvelle catégorie"}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Nom *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl bg-bg border border-border px-3 py-2.5 text-sm text-text focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="Ex: Fast Food" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Image URL (optionnel)</label>
            <input value={form.image_url ?? ""} onChange={(e) => setForm({ ...form, image_url: e.target.value || null })}
              className="w-full rounded-xl bg-bg border border-border px-3 py-2.5 text-sm text-text focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="https://exemple.com/category.jpg" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)}
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-2">
              Annuler
            </button>
            <button onClick={handleSave} disabled={!form.name}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-strong disabled:opacity-50">
              {editing ? "Mettre à jour" : "Créer"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}