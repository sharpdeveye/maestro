import { AudioLines } from "lucide-react";

export function Header() {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <AudioLines className="h-5 w-5 text-primary" />
      <span className="font-heading text-sm font-bold tracking-tight">
        Maestro
      </span>
    </div>
  );
}
