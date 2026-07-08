import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Une erreur est survenue",
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className,
      )}
    >
      <div className="text-danger mb-4">
        <AlertTriangle size={48} strokeWidth={1.5} />
      </div>
      <h3 className="text-text font-medium text-lg mb-1">{title}</h3>
      {message && (
        <p className="text-muted text-sm max-w-sm mb-4">{message}</p>
      )}
      {onRetry && (
        <Button variant="primary" onClick={onRetry}>
          Réessayer
        </Button>
      )}
    </div>
  );
}
