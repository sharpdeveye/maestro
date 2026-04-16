import { useState } from "react";
import { Header } from "@/components/header";
import { ModeToggle } from "@/components/mode-toggle";
import { CommandList } from "@/components/command-list";
import { ContextStatus } from "@/components/context-status";
import { Separator } from "@/components/ui/separator";
import { useVsCode } from "@/hooks/use-vscode";
import { ExternalLink, Settings, MessageCircleQuestionMark } from "lucide-react";

export default function App() {
  const { state, runCommand, toggleMode, initContext, openLink } = useVsCode();
  const [hoveredDescription, setHoveredDescription] = useState<string | null>(null);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto pb-4">
        {/* Zero-Defect Mode Toggle */}
        <ModeToggle
          active={state.zeroDefectActive}
          onToggle={() => toggleMode("zero-defect")}
        />

        <Separator />

        {/* Command List */}
        <CommandList
          skills={state.skills}
          onRunCommand={runCommand}
          onHover={setHoveredDescription}
          onLeave={() => setHoveredDescription(null)}
        />

        <Separator />

        {/* Context File Status */}
        <ContextStatus
          detected={state.contextDetected}
          info={state.contextInfo}
          onInit={initContext}
        />

        <Separator />

        {/* Footer Links */}
        <div className="flex flex-col gap-1 px-4">
          <button
            type="button"
            onClick={() => openLink("vscode:settings/maestro")}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <Settings className="h-3.5 w-3.5" />
            Preferences
          </button>
          <button
            type="button"
            onClick={() => openLink("https://maestroskills.dev")}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            maestroskills.dev
          </button>
        </div>
      </div>

      {/* Global Hover Description Footer */}
      <div className="border-t px-3 h-[80px] flex items-center transition-colors shrink-0">
        <MessageCircleQuestionMark className="min-w-[14px] h-3.5 w-3.5 mr-2 shrink-0 text-muted-foreground" />
        <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-4">
          {hoveredDescription || "Hover over any command to see its description."}
        </p>
      </div>
    </div>
  );
}
