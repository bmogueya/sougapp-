import { useTranslation } from "react-i18next";
import { Banknote, CreditCard, Smartphone, type LucideIcon } from "lucide-react";
import { PAYMENT_LABELS, type PaymentMethod } from "@/data/orders";

const ICONS: Record<PaymentMethod, LucideIcon> = {
  bankily: Smartphone,
  sedad: Smartphone,
  masrivi: Smartphone,
  cash: Banknote,
  card: CreditCard,
};

export function PaymentBadge({ method }: { method: PaymentMethod }) {
  const { t } = useTranslation();
  const Icon = ICONS[method];
  const label = PAYMENT_LABELS[method] ?? t(`orders.payment.${method}`);

  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm text-muted">
      <Icon className="h-4 w-4 text-faint" aria-hidden />
      {label}
    </span>
  );
}
