import { FileText, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ContextStatusProps {
  detected: boolean;
  info: string | null;
  onInit: () => void;
}

export function ContextStatus({ detected, info, onInit }: ContextStatusProps) {
  return (
    <div className="mx-4 flex flex-col gap-1.5">
      <div className="flex items-center gap-2 text-xs">
        {detected ? (
          <>
            <FileText className="h-3.5 w-3.5 text-success" />
            <span className="font-medium text-foreground">.maestro.md</span>
            <Badge variant="success" className="ml-auto">
              Detected
            </Badge>
          </>
        ) : (
          <>
            <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">No context file</span>
            <button
              type="button"
              onClick={onInit}
              className={cn(
                "ml-auto rounded-md border border-border/50 bg-card px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors",
                "hover:border-primary/40 hover:text-primary"
              )}
            >
              Initialize
            </button>
          </>
        )}
      </div>
      {detected && info && (
        <p className="pl-5.5 text-[11px] leading-relaxed text-muted-foreground">
          {info}
        </p>
      )}
    </div>
  );
}
