import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModeToggleProps {
  active: boolean;
  onToggle: () => void;
}

export function ModeToggle({ active, onToggle }: ModeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "group relative mx-4 flex w-[calc(100%-2rem)] items-center justify-between rounded-lg border px-3 py-2.5 text-xs font-medium transition-all duration-200",
        active
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border/50 bg-card text-muted-foreground hover:border-border hover:text-foreground"
      )}
    >
      <span className="flex items-center gap-2">
        <Shield
          className={cn(
            "h-3.5 w-3.5 transition-colors",
            active ? "text-primary" : "text-muted-foreground"
          )}
        />
        Zero-Defect Mode
      </span>
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all",
          active
            ? "bg-primary/20 text-primary"
            : "bg-muted text-muted-foreground"
        )}
      >
        {active ? "ON" : "OFF"}
      </span>
    </button>
  );
}
