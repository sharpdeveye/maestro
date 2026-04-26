import { useState } from "react";
import { Header } from "@/components/header";
import { CommandList } from "@/components/command-list";
import { ContextStatus } from "@/components/context-status";
import { TokenBudget } from "@/components/token-budget";
import { WaveProgress } from "@/components/wave-progress";
import { useVsCode } from "@/hooks/use-vscode";
import { ExternalLink, Settings, MessageCircleQuestionMark } from "lucide-react";

export default function App() {
  const { state, runCommand, toggleMode, initContext, openLink } = useVsCode();
  const [hoveredDescription, setHoveredDescription] = useState<string | null>(null);

  return (
    <div
      className="flex h-screen flex-col overflow-hidden transition-colors duration-500"
      data-mode={state.zeroDefectActive ? "strict" : "default"}
    >
      <Header
        zeroDefectActive={state.zeroDefectActive}
        onToggle={() => toggleMode("zero-defect")}
        onHover={setHoveredDescription}
        onLeave={() => setHoveredDescription(null)}
      />

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto pb-4">
        {/* Wave Progress — shown when a wave is active */}
        {state.activeWave && (
          <WaveProgress
            phases={state.activeWave.phases}
            currentPhase={state.activeWave.currentPhase}
          />
        )}

        {/* Command List */}
        <CommandList
          skills={state.skills}
          usedCommands={state.recentCommands}
          onRunCommand={runCommand}
          onHover={setHoveredDescription}
          onLeave={() => setHoveredDescription(null)}
        />
      </div>

      {/* Sticky bottom section */}
      <div className="mt-auto shrink-0 border-t border-border/50">
        {/* Token Budget */}
        {state.tokenBudget && (
          <div className="px-4 py-2 border-b border-border/30">
            <TokenBudget {...state.tokenBudget} />
          </div>
        )}

        {/* Context File Status */}
        <div className="py-2">
          <ContextStatus
            detected={state.contextDetected}
            info={state.contextInfo}
            onInit={initContext}
          />
        </div>

        {/* Footer Links */}
        <div className="flex flex-col gap-0.5 border-t border-border/30 px-4 py-2">
          <button
            type="button"
            onClick={() => openLink("vscode:settings/maestro")}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Settings className="h-3.5 w-3.5" />
            Preferences
          </button>
          <button
            type="button"
            onClick={() => openLink("https://maestroskills.dev")}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            maestroskills.dev
          </button>
        </div>

        {/* Global Hover Description Footer */}
        <div className="border-t border-border/30 px-3 h-[80px] flex items-center transition-colors shrink-0">
          <MessageCircleQuestionMark className="min-w-[14px] h-3.5 w-3.5 mr-2 shrink-0 text-muted-foreground" />
          <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-4">
            {hoveredDescription || "Hover over any command to see its description."}
          </p>
        </div>
      </div>
    </div>
  );
}
