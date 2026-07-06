import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  size?: "sm" | "md";
}

export function Switch({ checked, onChange, label, size = "md" }: SwitchProps) {
  const dims =
    size === "sm"
      ? { track: "h-4 w-7", knob: "h-3 w-3", travel: "translate-x-3" }
      : { track: "h-5 w-9", knob: "h-4 w-4", travel: "translate-x-4" };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex shrink-0 items-center rounded-full p-0.5 transition-colors",
        dims.track,
        checked ? "bg-primary" : "bg-border-strong",
      )}
    >
      <span
        className={cn(
          "inline-block rounded-full bg-white shadow-sm transition-transform",
          dims.knob,
          checked ? dims.travel : "translate-x-0",
          "rtl:-scale-x-100",
        )}
      />
    </button>
  );
}
