import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Megaphone,
  Ticket,
  Plus,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/Modal";
import { cn } from "@/lib/utils";
import { MODULE_MAP } from "@/data/modules";

interface Banner {
  id: string;
  title: string;
  image_url: string;
  module_id: string | null;
  is_active: boolean;
}

interface Coupon {
  id: string;
  code: string;
  discount_type: "amount" | "percentage";
  discount_value: number;
  is_active: boolean;
  used_count: number;
}

const EMPTY_BANNER = { title: "", image_url: "", module_id: null as string | null, is_active: true };
const EMPTY_COUPON = { code: "", discount_type: "percentage" as const, discount_value: 0, is_active: true };

export function Promotions() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"banners" | "coupons">("banners");
  const [banners, setBanners] = useState<Banner[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | Coupon | null>(null);

  useEffect(() => {
    if (activeTab === "banners") fetchBanners();
    else fetchCoupons();
  }, [activeTab]);

  const fetchBanners = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("banners")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setBanners(data as Banner[]);
    setLoading(false);
  };

  const fetchCoupons = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setCoupons(data as Coupon[]);
    setLoading(false);
  };

  const toggleBanner = async (id: string, current: boolean) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, is_active: !current } : b)),
    );
    await supabase.from("banners").update({ is_active: !current }).eq("id", id);
  };

  const toggleCoupon = async (id: string, current: boolean) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_active: !current } : c)),
    );
    await supabase.from("coupons").update({ is_active: !current }).eq("id", id);
  };

  const deleteBanner = async (id: string) => {
    if (!window.confirm("Supprimer cette bannière ?")) return;
    await supabase.from("banners").delete().eq("id", id);
    setBanners((prev) => prev.filter((b) => b.id !== id));
  };

  const deleteCoupon = async (id: string) => {
    if (!window.confirm("Supprimer ce coupon ?")) return;
    await supabase.from("coupons").delete().eq("id", id);
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  };

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (item: Banner | Coupon) => {
    setEditing(item);
    setModalOpen(true);
  };

  const handleSave = useCallback(
    async (form: any) => {
      if (activeTab === "banners") {
        if (editing) {
          await supabase.from("banners").update(form).eq("id", editing.id);
          setBanners((prev) =>
            prev.map((b) => (b.id === editing.id ? { ...b, ...form } as Banner : b)),
          );
        } else {
          const { data } = await supabase.from("banners").insert(form).select().single();
          if (data) setBanners((prev) => [data as Banner, ...prev]);
        }
      } else {
        if (editing) {
          await supabase.from("coupons").update(form).eq("id", editing.id);
          setCoupons((prev) =>
            prev.map((c) => (c.id === editing.id ? { ...c, ...form } as Coupon : c)),
          );
        } else {
          const { data } = await supabase.from("coupons").insert({ ...form, used_count: 0 }).select().single();
          if (data) setCoupons((prev) => [data as Coupon, ...prev]);
        }
      }
      setModalOpen(false);
    },
    [activeTab, editing],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-text">
            {t("promotions_nav")} & Bannières
          </h1>
          <p className="mt-1 text-sm text-muted">
            Gérez les promotions de votre plateforme
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-strong"
        >
          <Plus size={16} />
          {activeTab === "banners" ? "Nouvelle Bannière" : "Nouveau Coupon"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-border">
        {[
          { key: "banners" as const, label: "Bannières", icon: Megaphone },
          { key: "coupons" as const, label: "Coupons", icon: Ticket },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              "flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors",
              activeTab === key
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-text",
            )}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted">Chargement...</div>
        ) : activeTab === "banners" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left rtl:text-right">
              <thead className="border-b border-border text-xs font-medium text-muted">
                <tr>
                  <th className="px-6 py-4">Bannière</th>
                  <th className="px-6 py-4">Titre</th>
                  <th className="px-6 py-4">Module</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {banners.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted">
                      Aucune bannière configurée.
                    </td>
                  </tr>
                ) : (
                  banners.map((banner) => (
                    <tr
                      key={banner.id}
                      className="border-b border-border transition-colors hover:bg-surface-2"
                    >
                      <td className="px-6 py-4">
                        {banner.image_url ? (
                          <img
                            loading="lazy"
                            src={banner.image_url}
                            alt={banner.title}
                            className="h-12 w-24 rounded-lg border border-border object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-24 items-center justify-center rounded-lg border border-border bg-surface text-faint">
                            <ImageIcon size={20} />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-text">
                        {banner.title}
                      </td>
                      <td className="px-6 py-4 text-muted">
                        {banner.module_id
                          ? t(`modules.${banner.module_id}`)
                          : "Global"}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleBanner(banner.id, banner.is_active)}
                          className={cn(
                            "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                            banner.is_active
                              ? "bg-success/10 text-success hover:bg-success/20"
                              : "bg-surface-2 text-muted hover:bg-border",
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              banner.is_active ? "bg-success" : "bg-border",
                            )}
                          />
                          {banner.is_active ? "Active" : "Désactivée"}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEdit(banner)}
                            className="text-sm font-medium text-primary hover:text-primary-strong transition-colors"
                          >
                            Éditer
                          </button>
                          <button
                            onClick={() => deleteBanner(banner.id)}
                            className="text-faint hover:text-danger transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left rtl:text-right">
              <thead className="border-b border-border text-xs font-medium text-muted">
                <tr>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Réduction</th>
                  <th className="px-6 py-4">Utilisations</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted">
                      Aucun coupon configuré.
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr
                      key={coupon.id}
                      className="border-b border-border transition-colors hover:bg-surface-2"
                    >
                      <td className="px-6 py-4">
                        <code className="rounded-lg bg-surface-2 px-2 py-1 font-mono text-xs font-bold text-text">
                          {coupon.code}
                        </code>
                      </td>
                      <td className="px-6 py-4 font-semibold text-text">
                        {coupon.discount_type === "percentage"
                          ? `${coupon.discount_value}%`
                          : `${coupon.discount_value} MRU`}
                      </td>
                      <td className="px-6 py-4 text-muted">
                        {coupon.used_count} fois
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleCoupon(coupon.id, coupon.is_active)}
                          className={cn(
                            "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                            coupon.is_active
                              ? "bg-success/10 text-success hover:bg-success/20"
                              : "bg-surface-2 text-muted hover:bg-border",
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              coupon.is_active ? "bg-success" : "bg-border",
                            )}
                          />
                          {coupon.is_active ? "Actif" : "Désactivé"}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEdit(coupon)}
                            className="text-sm font-medium text-primary hover:text-primary-strong transition-colors"
                          >
                            Éditer
                          </button>
                          <button
                            onClick={() => deleteCoupon(coupon.id)}
                            className="text-faint hover:text-danger transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create/Edit Modal */}
      {activeTab === "banners" ? (
        <BannerModal
          key={editing?.id ?? "new"}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          initial={editing as Banner | null}
        />
      ) : (
        <CouponModal
          key={editing?.id ?? "new"}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          initial={editing as Coupon | null}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Banner create / edit modal
 * ───────────────────────────────────────────────────────────── */
function BannerModal({
  isOpen,
  onClose,
  onSave,
  initial,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (form: any) => void;
  initial: Banner | null;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState(initial ?? { ...EMPTY_BANNER });

  useEffect(() => {
    setForm(initial ?? { ...EMPTY_BANNER });
  }, [initial, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;
    onSave(form);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initial ? "Modifier la bannière" : "Nouvelle bannière"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Titre *
          </label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-xl bg-bg border border-border px-3 py-2.5 text-sm text-text focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="Ex: Ramadan 2025"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Image URL
          </label>
          <input
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            className="w-full rounded-xl bg-bg border border-border px-3 py-2.5 text-sm text-text focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="https://exemple.com/banner.jpg"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Module cible (optionnel)
          </label>
          <select
            value={form.module_id ?? ""}
            onChange={(e) =>
              setForm({ ...form, module_id: e.target.value || null })
            }
            className="w-full rounded-xl bg-bg border border-border px-3 py-2.5 text-sm text-text focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
          >
            <option value="">Tous les modules (Global)</option>
            {Object.keys(MODULE_MAP).map((key) => (
              <option key={key} value={key}>
                {t(`modules.${key}`)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-2"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={!form.title}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-strong disabled:opacity-50"
          >
            {initial ? "Mettre à jour" : "Créer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Coupon create / edit modal
 * ───────────────────────────────────────────────────────────── */
function CouponModal({
  isOpen,
  onClose,
  onSave,
  initial,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (form: any) => void;
  initial: Coupon | null;
}) {
  const [form, setForm] = useState<any>(initial ?? { ...EMPTY_COUPON });

  useEffect(() => {
    setForm(initial ?? { ...EMPTY_COUPON });
  }, [initial, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.discount_value) return;
    onSave(form);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initial ? "Modifier le coupon" : "Nouveau coupon"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Code *
          </label>
          <input
            value={form.code}
            onChange={(e) =>
              setForm({ ...form, code: e.target.value.toUpperCase() })
            }
            className="w-full rounded-xl bg-bg border border-border px-3 py-2.5 text-sm font-mono text-text focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none uppercase"
            placeholder="Ex: RAMADAN25"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Type
            </label>
            <select
              value={form.discount_type}
              onChange={(e) =>
                setForm({
                  ...form,
                  discount_type: e.target.value as "amount" | "percentage",
                })
              }
              className="w-full rounded-xl bg-bg border border-border px-3 py-2.5 text-sm text-text focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="percentage">Pourcentage (%)</option>
              <option value="amount">Montant (MRU)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Valeur *
            </label>
            <input
              type="number"
              min={1}
              value={form.discount_value || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  discount_value: Number(e.target.value),
                })
              }
              className="w-full rounded-xl bg-bg border border-border px-3 py-2.5 text-sm text-text focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-2"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={!form.code || !form.discount_value}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-strong disabled:opacity-50"
          >
            {initial ? "Mettre à jour" : "Créer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}