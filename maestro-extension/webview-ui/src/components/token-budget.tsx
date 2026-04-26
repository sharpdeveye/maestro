import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Gauge } from "lucide-react";

interface TokenBudgetProps {
  lastEstimate: number;
  fullEstimate: number;
  savings: number;
}

/**
 * Compact token budget widget.
 * Shows how many tokens were injected vs the full context,
 * with a visual bar and savings percentage.
 */
export function TokenBudget({ lastEstimate, fullEstimate, savings }: TokenBudgetProps) {
  // Color based on injection size relative to a ~128k window
  const ratio = lastEstimate / 128000;
  const color = ratio < 0.02
    ? "text-success"
    : ratio < 0.08
      ? "text-yellow-500"
      : "text-destructive";

  const barColor = ratio < 0.02
    ? "bg-success"
    : ratio < 0.08
      ? "bg-yellow-500"
      : "bg-destructive";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 text-xs">
        <Gauge className={cn("h-3.5 w-3.5", color)} />
        <span className="text-muted-foreground">Last injection</span>
        <span className={cn("ml-auto font-mono font-medium tabular-nums", color)}>
          ~{formatTokenCount(lastEstimate)}
        </span>
      </div>

      {/* Visual bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-muted/50">
        <motion.div
          className={cn("h-full rounded-full", barColor)}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(ratio * 100 * 12, 100)}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      {/* Savings */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>
          Full context: ~{formatTokenCount(fullEstimate)}
        </span>
        {savings > 0 && (
          <motion.span
            initial={{ opacity: 0, x: 4 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-medium text-success"
          >
            {savings}% saved
          </motion.span>
        )}
      </div>
    </div>
  );
}

/**
 * Format token count for display (e.g., 1240 → "1.2k", 350 → "350").
 */
function formatTokenCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return `${count}`;
}
