import { useState, useEffect, useCallback } from "react";
import vscode from "@/lib/vscode";

/** Message types from extension host to webview */
export interface ExtensionMessage {
  type:
    | "skills"
    | "state"
    | "history"
    | "context-status";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

/** Message types from webview to extension host */
export type WebviewMessage =
  | { type: "run-command"; command: string }
  | { type: "toggle-mode"; mode: string }
  | { type: "init-context" }
  | { type: "open-link"; url: string }
  | { type: "ready" };

/** State managed by the extension host, synced to webview */
export interface MaestroState {
  zeroDefectActive: boolean;
  contextDetected: boolean;
  contextInfo: string | null;
  skills: SkillInfo[];
  recentCommands: string[];
}

export interface SkillInfo {
  name: string;
  description: string;
  category: string;
  userInvocable: boolean;
}

const DEFAULT_STATE: MaestroState = {
  zeroDefectActive: false,
  contextDetected: false,
  contextInfo: null,
  skills: [],
  recentCommands: [],
};

/**
 * Hook for communicating with the VS Code extension host.
 */
export function useVsCode() {
  const [state, setState] = useState<MaestroState>(DEFAULT_STATE);

  useEffect(() => {
    const handler = (event: MessageEvent<ExtensionMessage>) => {
      const msg = event.data;
      switch (msg.type) {
        case "state":
          setState((prev) => ({ ...prev, ...msg.data }));
          break;
        case "skills":
          setState((prev) => ({ ...prev, skills: msg.data }));
          break;
        case "history":
          setState((prev) => ({ ...prev, recentCommands: msg.data }));
          break;
        case "context-status":
          setState((prev) => ({
            ...prev,
            contextDetected: msg.data.detected,
            contextInfo: msg.data.info,
          }));
          break;
      }
    };

    window.addEventListener("message", handler);
    // Signal readiness to the extension host
    vscode.postMessage({ type: "ready" });

    return () => window.removeEventListener("message", handler);
  }, []);

  const runCommand = useCallback((command: string) => {
    vscode.postMessage({ type: "run-command", command } satisfies WebviewMessage);
  }, []);

  const toggleMode = useCallback((mode: string) => {
    vscode.postMessage({ type: "toggle-mode", mode } satisfies WebviewMessage);
  }, []);

  const initContext = useCallback(() => {
    vscode.postMessage({ type: "init-context" } satisfies WebviewMessage);
  }, []);

  const openLink = useCallback((url: string) => {
    vscode.postMessage({ type: "open-link", url } satisfies WebviewMessage);
  }, []);

  return {
    state,
    runCommand,
    toggleMode,
    initContext,
    openLink,
  };
}
