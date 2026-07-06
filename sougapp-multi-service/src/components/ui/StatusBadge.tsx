import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/Badge";
import type { OrderStatus } from "@/data/dashboard";

const TONE: Record<OrderStatus, "success" | "info" | "warning" | "neutral" | "danger"> = {
  delivered: "success",
  onTheWay: "info",
  preparing: "warning",
  pending: "neutral",
  cancelled: "danger",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useTranslation();
  return (
    <Badge tone={TONE[status]} dot>
      {t(`status.${status}`)}
    </Badge>
  );
}
