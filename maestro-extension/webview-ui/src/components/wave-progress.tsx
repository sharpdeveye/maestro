import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Check, AlertTriangle, Loader2 } from "lucide-react";

interface WavePhaseInfo {
  name: string;
  status: "pending" | "running" | "passed" | "failed";
}

interface WaveProgressProps {
  phases: WavePhaseInfo[];
  currentPhase: string;
}

/**
 * Premium wave progress visualization.
 * Renders a horizontal pipeline with connected phase indicators.
 */
export function WaveProgress({ phases, currentPhase }: WaveProgressProps) {
  return (
    <div className="mx-4 my-2 rounded-lg border border-border/40 bg-card p-3">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2 text-xs">
        <span className="font-heading font-semibold text-foreground">
          Wave Execution
        </span>
        <span className="ml-auto text-[10px] font-mono text-muted-foreground tabular-nums">
          {phases.filter((p) => p.status === "passed").length}/{phases.length}
        </span>
      </div>

      {/* Phase Pipeline */}
      <div className="flex items-center gap-0">
        {phases.map((phase, i) => (
          <div key={phase.name} className="flex items-center">
            {/* Phase dot + label */}
            <div className="flex flex-col items-center gap-1">
              <PhaseIndicator
                status={phase.status}
                isCurrent={phase.name === currentPhase}
              />
              <span
                className={cn(
                  "text-[9px] font-medium uppercase tracking-wider",
                  phase.status === "running"
                    ? "text-primary"
                    : phase.status === "passed"
                      ? "text-success"
                      : phase.status === "failed"
                        ? "text-destructive"
                        : "text-muted-foreground/50"
                )}
              >
                {phase.name}
              </span>
            </div>

            {/* Connector line */}
            {i < phases.length - 1 && (
              <div
                className={cn(
                  "mx-1 h-px w-6 transition-colors duration-500",
                  phase.status === "passed" ? "bg-success" : "bg-border/40"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Individual phase indicator with animations.
 */
function PhaseIndicator({
  status,
  isCurrent,
}: {
  status: WavePhaseInfo["status"];
  isCurrent: boolean;
}) {
  const baseClasses = "flex h-5 w-5 items-center justify-center rounded-full transition-all duration-300";

  switch (status) {
    case "passed":
      return (
        <motion.div
          className={cn(baseClasses, "bg-success/20")}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Check className="h-3 w-3 text-success" />
        </motion.div>
      );

    case "failed":
      return (
        <motion.div
          className={cn(baseClasses, "bg-destructive/20")}
          animate={{ x: [0, -2, 2, -2, 0] }}
          transition={{ duration: 0.4 }}
        >
          <AlertTriangle className="h-3 w-3 text-destructive" />
        </motion.div>
      );

    case "running":
      return (
        <motion.div
          className={cn(baseClasses, "bg-primary/20")}
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(var(--color-primary), 0)",
              "0 0 0 4px rgba(var(--color-primary), 0.15)",
              "0 0 0 0 rgba(var(--color-primary), 0)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Loader2 className="h-3 w-3 animate-spin text-primary" />
        </motion.div>
      );

    default:
      return (
        <div className={cn(baseClasses, "bg-muted/30")}>
          <div
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              isCurrent ? "bg-muted-foreground" : "bg-muted-foreground/30"
            )}
          />
        </div>
      );
  }
}
