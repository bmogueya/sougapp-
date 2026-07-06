import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

/** Small toggle pill used for filter rows. */
export function Chip({ active, className, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5",
        "text-sm font-medium transition-colors focus-visible:outline-none",
        active
          ? "border-primary/30 bg-primary/12 text-primary"
          : "border-border bg-surface text-muted hover:bg-surface-2 hover:text-text",
        className,
      )}
      {...props}
    />
  );
}
