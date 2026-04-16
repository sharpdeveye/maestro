import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Tooltip } from "@/components/ui/tooltip";

interface CommandCardProps {
  name: string;
  description: string;
  isNew?: boolean;
  onClick: () => void;
}

export function CommandCard({
  name,
  description,
  isNew,
  onClick,
}: CommandCardProps) {
  return (
    <Tooltip content={description}>
      <button
        type="button"
        onClick={onClick}
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
        <div className="relative flex items-center gap-2 rounded-md px-3 py-2">
          <span className="font-mono text-xs font-medium text-foreground">
            /{name}
          </span>
          {isNew && <Badge variant="default">New</Badge>}
        </div>
      </button>
    </Tooltip>
  );
}
