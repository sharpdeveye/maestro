import * as vscode from 'vscode';
import { SkillLoader } from './core/skills';
import { ContextManager } from './core/context';
import { StateManager } from './core/state';
import { StatusBarManager } from './statusbar/manager';
import { SidebarProvider } from './sidebar/provider';
import {
  detectEditor,
  syncCursorRules,
  syncClaudeMd,
} from './adapters/editor';
import { registerChatParticipant } from './chat/participant';

let statusBar: StatusBarManager;
let sidebarProvider: SidebarProvider;

export async function activate(
  context: vscode.ExtensionContext
): Promise<void> {
  // --- Core services ---
  const skills = new SkillLoader();
  const state = new StateManager(context);
  const ctxManager = new ContextManager();

  await ctxManager.initialize();

  // --- Status Bar ---
  statusBar = new StatusBarManager();
  statusBar.update(state.isZeroDefectActive(), ctxManager.isDetected());
  context.subscriptions.push(statusBar);

  // --- Sidebar ---
  sidebarProvider = new SidebarProvider(
    context.extensionUri,
    skills,
    state,
    ctxManager
  );

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'maestro.commandCenter',
      sidebarProvider
    )
  );

  // --- Context change listener ---
  ctxManager.onChange(() => {
    statusBar.update(state.isZeroDefectActive(), ctxManager.isDetected());
    sidebarProvider.syncState();
  });

  // --- Commands ---

  // Toggle zero-defect mode
  context.subscriptions.push(
    vscode.commands.registerCommand('maestro.toggleZeroDefect', async () => {
      const active = await state.toggleZeroDefect();
      statusBar.update(active, ctxManager.isDetected());
      sidebarProvider.syncState();

      // Sync to editor-specific files
      const zeroDefectContent = skills.getContent('zero-defect') || '';
      const editor = detectEditor();

      if (editor === 'cursor') {
        await syncCursorRules(zeroDefectContent, active);
      }
      // Always sync CLAUDE.md if it exists or if activating
      await syncClaudeMd(zeroDefectContent, active);

      const label = active ? 'activated' : 'deactivated';
      vscode.window.showInformationMessage(
        `Maestro: Zero-Defect mode ${label}.`
      );
    })
  );

  // Open Command Center (focuses the sidebar)
  context.subscriptions.push(
    vscode.commands.registerCommand('maestro.openCommandCenter', () => {
      vscode.commands.executeCommand('maestro.commandCenter.focus');
    })
  );

  // Initialize .maestro.md — opens chat with teach-maestro prompt
  context.subscriptions.push(
    vscode.commands.registerCommand('maestro.initContext', async () => {
      const teachContent = skills.getContent('teach-maestro');
      if (!teachContent) return;

      // Prepend .maestro.md context if available
      const maestroContext = ctxManager.getContent();
      let fullContent = teachContent;
      if (maestroContext) {
        fullContent = `## Project Context\n\n${maestroContext}\n\n---\n\n${teachContent}`;
      }

      await insertIntoChat(fullContent);
    })
  );

  // Register all skill commands
  const invocableSkills = skills.getInvocable();
  for (const skill of invocableSkills) {
    const commandId = `maestro.${toCamelCase(skill.name)}`;
    context.subscriptions.push(
      vscode.commands.registerCommand(commandId, async () => {
        let fullContent = skill.content;

        // Prepend .maestro.md context if available
        const maestroContext = ctxManager.getContent();
        if (maestroContext) {
          fullContent = `## Project Context\n\n${maestroContext}\n\n---\n\n${fullContent}`;
        }

        await insertIntoChat(fullContent);
      })
    );
  }

  // --- Chat Participant (@maestro) ---
  registerChatParticipant(context, skills, ctxManager, state);

  // --- Context cleanup ---
  context.subscriptions.push(ctxManager);
}

/**
 * Insert text into the active AI chat panel.
 * Uses workbench.action.chat.open with { query } — works in VS Code and Antigravity.
 */
async function insertIntoChat(content: string): Promise<void> {
  await vscode.commands.executeCommand('workbench.action.chat.open', {
    query: content,
    isPartialQuery: true,
  });
}

function toCamelCase(name: string): string {
  return name.replace(/-([a-z])/g, (_match, letter) => letter.toUpperCase());
}

export function deactivate(): void {
  // Cleanup handled by disposables
}


