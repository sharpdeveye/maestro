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
  syncAntigravityRule,
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

  // --- Auto-install Maestro skills into the workspace ---
  await autoInstallSkills(context, skills);

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

      const zeroDefectContent = skills.getContent('zero-defect') || '';
      const editor = detectEditor();

      if (editor === 'cursor') {
        await syncCursorRules(zeroDefectContent, active);
      }
      if (editor === 'antigravity') {
        await syncAntigravityRule(zeroDefectContent, active);
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

  // Initialize .maestro.md
  context.subscriptions.push(
    vscode.commands.registerCommand('maestro.initContext', async () => {
      await injectSlashCommand('teach-maestro');
    })
  );

  // Register all skill commands — each injects its slash command
  const invocableSkills = skills.getInvocable();
  for (const skill of invocableSkills) {
    const commandId = `maestro.${toCamelCase(skill.name)}`;
    context.subscriptions.push(
      vscode.commands.registerCommand(commandId, async () => {
        await injectSlashCommand(skill.name);
      })
    );
  }

  // --- Chat Participant (@maestro) ---
  // registerChatParticipant has its own guard: if (!vscode.chat?.createChatParticipant) return;
  registerChatParticipant(context, skills, ctxManager, state);

  // --- Context cleanup ---
  context.subscriptions.push(ctxManager);
}

/**
 * Install Maestro skills into the workspace on every activation.
 * Writes bundled skill files directly to .agents/skills/ — no CLI, no prompts.
 */
async function autoInstallSkills(
  _context: vscode.ExtensionContext,
  skills: SkillLoader
): Promise<void> {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) return;

  try {
    const allSkills = skills.getAll();
    const fs = await import('fs');
    const path = await import('path');

    for (const skill of allSkills) {
      const skillDir = path.join(workspaceRoot, '.agents', 'skills', skill.name);
      if (!fs.existsSync(skillDir)) {
        fs.mkdirSync(skillDir, { recursive: true });
      }

      // Reconstruct SKILL.md with frontmatter
      const frontmatter = [
        '---',
        `name: ${skill.name}`,
        `description: "${skill.description}"`,
        `category: ${skill.category}`,
        `version: ${skill.version}`,
        `user-invocable: ${skill.userInvocable}`,
        skill.argumentHint ? `argument-hint: "${skill.argumentHint}"` : null,
        '---',
      ].filter(Boolean).join('\n');

      const fileContent = `${frontmatter}\n\n${skill.content}\n`;
      fs.writeFileSync(path.join(skillDir, 'SKILL.md'), fileContent, 'utf-8');
    }

    vscode.window.showInformationMessage(
      `Maestro: ${allSkills.length} skills installed to .agents/skills/`
    );
  } catch (err) {
    vscode.window.showWarningMessage(
      `Maestro: Failed to install skills. Error: ${err}`
    );
  }
}

/**
 * Inject a slash command into the AI chat and submit it.
 *
 * - VS Code:       workbench.action.chat.open with @maestro /command
 * - Antigravity:   antigravity.sendPromptToAgentPanel (native injection + submit)
 * - Cursor:        workbench.action.chat.open with fallback
 */
async function injectSlashCommand(commandName: string): Promise<void> {
  const editor = detectEditor();
  const slashCommand = `/${commandName}`;

  switch (editor) {
    case 'antigravity': {
      // Antigravity native command — sends prompt directly to the agent panel
      await vscode.commands.executeCommand(
        'antigravity.sendPromptToAgentPanel',
        slashCommand
      );
      break;
    }

    case 'vscode': {
      await vscode.commands.executeCommand('workbench.action.chat.open', {
        query: `@maestro ${slashCommand}`,
        isPartialQuery: false,
      });
      break;
    }

    case 'cursor': {
      try {
        await vscode.commands.executeCommand('workbench.action.chat.open', {
          query: slashCommand,
          isPartialQuery: false,
        });
      } catch {
        vscode.window.showErrorMessage(
          `Maestro: Could not inject ${slashCommand} into chat.`
        );
      }
      break;
    }

    default: {
      try {
        await vscode.commands.executeCommand('workbench.action.chat.open', {
          query: slashCommand,
          isPartialQuery: false,
        });
      } catch {
        vscode.window.showErrorMessage(
          `Maestro: Could not inject ${slashCommand} into chat.`
        );
      }
    }
  }
}

function toCamelCase(name: string): string {
  return name.replace(/-([a-z])/g, (_match, letter) => letter.toUpperCase());
}

export function deactivate(): void {
  // Cleanup handled by disposables
}
