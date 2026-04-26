import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { GlowingEffect } from "@/components/ui/glowing-effect";

interface CommandCardProps {
  name: string;
  description: string;
  isNew?: boolean;
  used?: boolean;
  onClick: () => void;
  onHover: (desc: string) => void;
  onLeave: () => void;
}

export function CommandCard({
  name,
  description,
  isNew,
  used,
  onClick,
  onHover,
  onLeave,
}: CommandCardProps) {
  const [executing, setExecuting] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        setExecuting(true);
        setTimeout(() => setExecuting(false), 1200);
        onClick();
      }}
      onMouseEnter={() => onHover(description)}
      onMouseLeave={onLeave}
      className={cn(
        "relative w-full rounded-lg border bg-card p-1 text-left transition-all duration-150",
        isNew
          ? "border-primary/30 ring-1 ring-primary/15"
          : "border-border/40 hover:border-border/60"
      )}
    >
      <GlowingEffect
        spread={30}
        glow
        disabled={false}
        proximity={48}
        inactiveZone={0.01}
        borderWidth={1.5}
        blur={0}
        movementDuration={0.8}
      />

      {/* Ripple animation on execute */}
      <AnimatePresence>
        {executing && (
          <motion.div
            className="absolute inset-0 rounded-lg bg-primary/10"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.05, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      <div className="relative flex items-center gap-2 rounded-md px-3 py-2">
        <span
          className={cn(
            "inline-block h-1.5 w-1.5 shrink-0 rounded-full transition-colors",
            used ? "bg-emerald-500" : "bg-muted-foreground/20"
          )}
          title={used ? "Used this session" : ""}
        />
        <span className="font-mono text-xs font-medium text-foreground">
          /{name}
        </span>
        {isNew && <Badge variant="default">New</Badge>}
      </div>
    </button>
  );
}
