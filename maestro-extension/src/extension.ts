import * as vscode from 'vscode';
import { SkillLoader } from './core/skills';
import { ContextManager } from './core/context';
import { StateManager } from './core/state';
import { HistoryManager } from './core/history';
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
let history: HistoryManager;

export async function activate(
  context: vscode.ExtensionContext
): Promise<void> {
  // --- Core services ---
  const skills = new SkillLoader();
  const state = new StateManager(context);
  const ctxManager = new ContextManager();
  history = new HistoryManager(context);

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
        history.record(skill.name);
        sidebarProvider.syncState();
        await injectSlashCommand(skill.name);
      })
    );
  }

  // Quick Pick command — search and run any Maestro command
  context.subscriptions.push(
    vscode.commands.registerCommand('maestro.quickPick', async () => {
      const recentEntries = history.getRecent(5);
      const recentNames = new Set(recentEntries.map(e => e.name));

      const items: vscode.QuickPickItem[] = [];

      // Add recent commands first
      if (recentEntries.length > 0) {
        items.push({ label: 'Recent', kind: vscode.QuickPickItemKind.Separator });
        for (const entry of recentEntries) {
          const skill = invocableSkills.find(s => s.name === entry.name);
          if (skill) {
            items.push({
              label: `$(history) /${skill.name}`,
              description: skill.description,
              detail: `Last used ${new Date(entry.timestamp).toLocaleTimeString()}`,
            });
          }
        }
        items.push({ label: 'All Commands', kind: vscode.QuickPickItemKind.Separator });
      }

      // Add all commands (skip recent duplicates for cleanliness)
      for (const skill of invocableSkills) {
        if (!recentNames.has(skill.name)) {
          items.push({
            label: `/${skill.name}`,
            description: skill.description,
          });
        }
      }

      const picked = await vscode.window.showQuickPick(items, {
        title: 'Maestro Commands',
        placeHolder: 'Search and run a Maestro command...',
        matchOnDescription: true,
      });

      if (picked) {
        // Extract skill name from label (remove icon prefix and slash)
        const name = picked.label.replace(/^\$\([^)]+\)\s*\//, '').replace(/^\//, '');
        history.record(name);
        sidebarProvider.syncState();
        await injectSlashCommand(name);
      }
    })
  );

  // --- Chat Participant (@maestro) ---
  // registerChatParticipant has its own guard: if (!vscode.chat?.createChatParticipant) return;
  registerChatParticipant(context, skills, ctxManager, state);

  // --- Context cleanup ---
  context.subscriptions.push(ctxManager);
}

/**
 * Install Maestro skills into the workspace on every activation.
 * Writes bundled skill files to ALL known AI provider directories.
 */
async function autoInstallSkills(
  _context: vscode.ExtensionContext,
  skills: SkillLoader
): Promise<void> {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) return;

  const PROVIDERS = [
    '.agents/skills',
    '.claude/skills',
    '.cursor/skills',
    '.gemini/skills',
    '.codex/skills',
    '.kiro/skills',
    '.trae/skills',
    '.trae-cn/skills',
    '.opencode/skills',
    '.pi/skills',
  ];

  try {
    const allSkills = skills.getAll();
    const fs = await import('fs');
    const path = await import('path');

    for (const skill of allSkills) {
      // Reconstruct SKILL.md with frontmatter once per skill
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

      // Distribute to all provider directories
      for (const provider of PROVIDERS) {
        // e.g. provider = '.claude/skills', split by '/' to be OS-agnostic path join
        const providerParts = provider.split('/');
        const skillDir = path.join(workspaceRoot, ...providerParts, skill.name);
        
        if (!fs.existsSync(skillDir)) {
          fs.mkdirSync(skillDir, { recursive: true });
        }
        
        fs.writeFileSync(path.join(skillDir, 'SKILL.md'), fileContent, 'utf-8');
      }
    }

    vscode.window.showInformationMessage(
      `Maestro: ${allSkills.length} skills synchronized across ${PROVIDERS.length} AI providers.`
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
