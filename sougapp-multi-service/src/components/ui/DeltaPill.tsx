import { TrendingDown, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatDelta } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface DeltaPillProps {
  value: number;
  className?: string;
  subtle?: boolean;
}

/** Signed percentage change with directional color + icon. */
export function DeltaPill({ value, className, subtle }: DeltaPillProps) {
  const { i18n } = useTranslation();
  const positive = value >= 0;
  const Icon = positive ? TrendingUp : TrendingDown;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-semibold tabular-nums",
        positive ? "text-success" : "text-danger",
        subtle && "opacity-90",
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {formatDelta(value, i18n.language)}
    </span>
  );
}
