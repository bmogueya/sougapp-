import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

interface PopoverProps {
  /** Render-prop trigger; receives open state + toggle. */
  trigger: (args: { open: boolean; toggle: () => void }) => ReactNode;
  children: (args: { close: () => void }) => ReactNode;
  align?: "start" | "end";
  className?: string;
}

/** Minimal accessible popover: click-outside + Escape to close. */
export function Popover({
  trigger,
  children,
  align = "end",
  className,
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle: () => setOpen((v) => !v) })}
      {open && (
        <div
          className={cn(
            "absolute z-40 mt-2 min-w-[12rem] overflow-hidden rounded-xl border border-border",
            "bg-overlay p-1 shadow-raised animate-fade-in-up",
            align === "end" ? "end-0" : "start-0",
            className,
          )}
          role="menu"
        >
          {children({ close: () => setOpen(false) })}
        </div>
      )}
    </div>
  );
}

interface PopoverItemProps {
  onClick?: () => void;
  active?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

export function PopoverItem({
  onClick,
  active,
  icon,
  children,
}: PopoverItemProps) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-start text-sm",
        "transition-colors hover:bg-surface-2",
        active ? "font-medium text-primary" : "text-text",
      )}
    >
      {icon && <span className="shrink-0 text-muted">{icon}</span>}
      <span className="flex-1 truncate">{children}</span>
      {active && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
    </button>
  );
}
