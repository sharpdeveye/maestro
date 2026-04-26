import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AudioLinesIcon, type AudioLinesIconHandle } from "@/components/ui/audio-lines";
import { Toggle, GooeyFilter } from "@/components/ui/liquid-toggle";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  zeroDefectActive: boolean;
  onToggle: () => void;
  onHover: (desc: string) => void;
  onLeave: () => void;
}

export function Header({ zeroDefectActive, onToggle, onHover, onLeave }: HeaderProps) {
  const iconRef = useRef<AudioLinesIconHandle>(null);

  useEffect(() => {
    iconRef.current?.startAnimation();
  }, []);

  return (
    <div className="flex items-center gap-2 px-4 py-3 shrink-0">
      <GooeyFilter />
      <AudioLinesIcon ref={iconRef} size={20} className="text-primary" />
      <span className="font-heading text-sm font-bold tracking-tight">
        Maestro
      </span>

      {/* Animated Strict Mode badge */}
      <AnimatePresence>
        {zeroDefectActive && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8, x: -4 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -4 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="rounded-sm bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary"
          >
            Strict
          </motion.span>
        )}
      </AnimatePresence>

      {/* Zero-Defect toggle pushed to the right */}
      <div
        className="ml-auto flex items-center gap-1.5"
        onMouseEnter={() =>
          onHover(
            zeroDefectActive
              ? "Zero-Defect Mode is ON — 8 precision rules are injected into every AI prompt. Click to deactivate."
              : "Zero-Defect Mode — Activate maximum precision. Injects 8 strict rules into every AI prompt to prevent mistakes."
          )
        }
        onMouseLeave={onLeave}
      >
        <Shield
          className={cn(
            "h-3 w-3 transition-colors duration-300",
            zeroDefectActive ? "text-primary" : "text-muted-foreground"
          )}
        />
        <Toggle
          checked={zeroDefectActive}
          onCheckedChange={() => onToggle()}
          variant={zeroDefectActive ? "warning" : "default"}
          size="sm"
        />
      </div>
    </div>
  );
}
