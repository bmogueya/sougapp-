import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Image as ImageIcon,
  Edit,
  Trash2,
  Package,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/Modal";
import { cn, formatMRU } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_price: number | null;
  image_url: string | null;
  in_stock: boolean;
  is_active: boolean;
  category_id: string;
  module_id: string;
}

interface Category {
  id: string;
  name: string;
}

const EMPTY_FORM = {
  name: "",
  description: "",
  price: 0,
  discount_price: null as number | null,
  image_url: null as string | null,
  in_stock: true,
  is_active: true,
  category_id: "",
};

export function MerchantProducts() {
  const { session } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user.id) {
      fetchProducts();
      supabase.from("categories").select("id, name").then(({ data }) => {
        if (data) setCategories(data as Category[]);
      });
      // Boutique du marchand : requise pour que les produits soient visibles
      // côté client (StoreView/Search filtrent par store_id).
      supabase.from("stores").select("id").eq("owner_id", session.user.id).single()
        .then(({ data }) => { if (data) setStoreId(data.id); });
    }
  }, [session?.user.id]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("merchant_id", session!.user.id)
      .order("created_at", { ascending: false });
    if (data) setProducts(data as Product[]);
    setLoading(false);
  };

  const toggleStock = async (id: string, current: boolean) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, in_stock: !current } : p)),
    );
    await supabase.from("products").update({ in_stock: !current }).eq("id", id);
  };

  const filteredProducts = useMemo(
    () =>
      products.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [products, searchTerm],
  );

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      discount_price: product.discount_price,
      image_url: product.image_url,
      in_stock: product.in_stock,
      is_active: product.is_active,
      category_id: product.category_id,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!session?.user.id || !form.name) return;
    setSaving(true);
    const payload = { ...form, merchant_id: session.user.id, store_id: storeId };
    if (editing) {
      const { error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", editing.id);
      if (!error) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editing.id ? { ...p, ...payload } as Product : p)),
        );
      }
    } else {
      const { data, error } = await supabase
        .from("products")
        .insert(payload)
        .select()
        .single();
      if (!error && data) {
        setProducts((prev) => [data as Product, ...prev]);
      }
    }
    setSaving(false);
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer ce produit définitivement ?")) return;
    await supabase.from("products").delete().eq("id", id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-text">Catalogue Produits</h1>
          <p className="mt-1 text-sm text-muted">
            Gérez vos articles, prix et disponibilités.
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-strong"
        >
          <Plus size={16} />
          Ajouter un produit
        </button>
      </div>

      {/* Table card */}
      <Card className="overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-faint"
              size={18}
            />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl bg-bg pl-10 pr-4 py-2.5 text-sm text-text border border-border placeholder:text-faint focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            />
          </div>
          {categories.length > 0 && (
            <select className="rounded-xl bg-bg border border-border px-3 py-2.5 text-sm text-text focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
              <option value="all">Toutes les catégories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right">
            <thead className="border-b border-border text-xs font-medium text-muted">
              <tr>
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Nom du produit</th>
                <th className="px-6 py-4">Prix</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted">
                    Chargement de votre catalogue...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Package className="mx-auto text-faint mb-3" size={48} />
                    <p className="font-medium text-text">
                      Aucun produit trouvé.
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      Commencez par ajouter votre premier article.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-border transition-colors hover:bg-surface-2"
                  >
                    <td className="px-6 py-4">
                      {product.image_url ? (
                        <img
                          loading="lazy"
                          src={product.image_url}
                          alt={product.name}
                          className="h-12 w-12 rounded-xl border border-border object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface text-faint">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-text">
                        {product.name}
                      </div>
                      {product.description && (
                        <div className="mt-0.5 max-w-xs truncate text-xs text-muted">
                          {product.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold tabular-nums text-text">
                      {product.discount_price ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-success">
                            {formatMRU(product.discount_price, "fr")}
                          </span>
                          <span className="text-xs text-faint line-through">
                            {formatMRU(product.price, "fr")}
                          </span>
                        </div>
                      ) : (
                        formatMRU(product.price, "fr")
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStock(product.id, product.in_stock)}
                        className={cn(
                          "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                          product.in_stock
                            ? "bg-success/10 text-success hover:bg-success/20"
                            : "bg-danger/10 text-danger hover:bg-danger/20",
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            product.in_stock ? "bg-success" : "bg-danger",
                          )}
                        />
                        {product.in_stock ? "En Stock" : "Épuisé"}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => openEdit(product)}
                          className="text-faint hover:text-primary transition-colors"
                          title="Modifier"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-faint hover:text-danger transition-colors"
                          title="Supprimer"
                        >
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Modifier le produit" : "Nouveau produit"}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Nom du produit *
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl bg-bg border border-border px-3 py-2.5 text-sm text-text placeholder:text-faint focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="Ex: Poulet braisé"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              className="w-full rounded-xl bg-bg border border-border px-3 py-2.5 text-sm text-text placeholder:text-faint focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
              placeholder="Description du produit..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Prix (MRU) *
              </label>
              <input
                type="number"
                min={0}
                value={form.price || ""}
                onChange={(e) =>
                  setForm({ ...form, price: Number(e.target.value) })
                }
                className="w-full rounded-xl bg-bg border border-border px-3 py-2.5 text-sm text-text focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Prix promo (optionnel)
              </label>
              <input
                type="number"
                min={0}
                value={form.discount_price ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    discount_price: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
                className="w-full rounded-xl bg-bg border border-border px-3 py-2.5 text-sm text-text focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Image URL
            </label>
            <input
              value={form.image_url ?? ""}
              onChange={(e) =>
                setForm({ ...form, image_url: e.target.value || null })
              }
              className="w-full rounded-xl bg-bg border border-border px-3 py-2.5 text-sm text-text placeholder:text-faint focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="https://exemple.com/image.jpg"
            />
          </div>

          {categories.length > 0 && (
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Catégorie
              </label>
              <select
                value={form.category_id}
                onChange={(e) =>
                  setForm({ ...form, category_id: e.target.value })
                }
                className="w-full rounded-xl bg-bg border border-border px-3 py-2.5 text-sm text-text focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="">Sélectionner...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={form.in_stock}
                onChange={(e) =>
                  setForm({ ...form, in_stock: e.target.checked })
                }
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-text">En stock</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm({ ...form, is_active: e.target.checked })
                }
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-text">Actif</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-2"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.name}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-strong disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : editing ? "Mettre à jour" : "Ajouter"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}