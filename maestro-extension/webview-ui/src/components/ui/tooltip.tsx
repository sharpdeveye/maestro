import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Lightweight tooltip using CSS-only approach for webview performance.
 * No Radix dependency needed — keeps the bundle small.
 */
function Tooltip({ content, children, className }: TooltipProps) {
  return (
    <div className={cn("group relative inline-flex", className)}>
      {children}
      <div
        role="tooltip"
        className="pointer-events-none absolute left-1/2 bottom-full z-50 mb-1.5 -translate-x-1/2 scale-95 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-card-foreground opacity-0 shadow-md transition-all duration-150 group-hover:scale-100 group-hover:opacity-100"
      >
        <span className="whitespace-nowrap">{content}</span>
      </div>
    </div>
  );
}

export { Tooltip };
