import { useEffect, useRef } from "react";
import { AudioLinesIcon, type AudioLinesIconHandle } from "@/components/ui/audio-lines";

export function Header() {
  const iconRef = useRef<AudioLinesIconHandle>(null);

  useEffect(() => {
    iconRef.current?.startAnimation();
  }, []);

  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <AudioLinesIcon ref={iconRef} size={20} className="text-primary" />
      <span className="font-heading text-sm font-bold tracking-tight">
        Maestro
      </span>
    </div>
  );
}
