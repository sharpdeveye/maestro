import { Header } from "@/components/header";
import { ModeToggle } from "@/components/mode-toggle";
import { CommandList } from "@/components/command-list";
import { ContextStatus } from "@/components/context-status";
import { Separator } from "@/components/ui/separator";
import { useVsCode } from "@/hooks/use-vscode";
import { ExternalLink, Settings } from "lucide-react";

export default function App() {
  const { state, runCommand, toggleMode, initContext, openLink } = useVsCode();

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
        <CommandList skills={state.skills} onRunCommand={runCommand} />

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
    </div>
  );
}
