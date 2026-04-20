import { FileText, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StarButton } from "@/components/ui/star-button";

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
            <StarButton
              onClick={onInit}
              className="ml-auto h-6 px-2.5 border border-border/50 bg-card"
              lightColor="var(--color-primary)"
              backgroundColor="var(--color-card)"
              duration={4}
              lightWidth={80}
              borderWidth={1}
            >
              Initialize
            </StarButton>
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
