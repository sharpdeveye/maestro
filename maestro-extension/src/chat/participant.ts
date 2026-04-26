import * as vscode from 'vscode';
import { SkillLoader } from '../core/skills';
import { ContextManager } from '../core/context';
import { StateManager } from '../core/state';
import { ContextSlicer } from '../core/context-slicer';
import { WaveEngine, supportsWave } from '../core/wave-engine';
import { buildPhaseMessages } from '../core/wave-prompts';
import {
  appendAudit,
  appendDecision,
  estimateTokens,
  estimateCost,
} from '@maestro/core';

/** Last token budget data — exposed so sidebar provider can read it */
export let lastTokenBudget: {
  lastEstimate: number;
  fullEstimate: number;
  savings: number;
} | null = null;

/** Active wave engine — exposed so sidebar provider can read wave state */
export const waveEngine = new WaveEngine();

/**
 * Registers the @maestro chat participant.
 * Handles slash commands, auto-inject for zero-defect mode,
 * context slicing for token efficiency, and wave execution for complex commands.
 */
export function registerChatParticipant(
  context: vscode.ExtensionContext,
  skills: SkillLoader,
  ctxManager: ContextManager,
  state: StateManager,
  slicer: ContextSlicer
): void {
  // Check if the chat API is available (not available in all editors)
  if (!vscode.chat?.createChatParticipant) {
    return;
  }

  // Dispose wave engine when extension deactivates
  context.subscriptions.push(waveEngine);

  const participant = vscode.chat.createChatParticipant(
    'maestro.chat',
    async (
      request: vscode.ChatRequest,
      chatContext: vscode.ChatContext,
      stream: vscode.ChatResponseStream,
      token: vscode.CancellationToken
    ) => {
      const messages: vscode.LanguageModelChatMessage[] = [];

      // --- System context ---

      // 1. If zero-defect mode is active, prepend precision rules
      if (state.isZeroDefectActive()) {
        const zdContent = skills.getContent('zero-defect');
        if (zdContent) {
          messages.push(
            vscode.LanguageModelChatMessage.User(
              `[SYSTEM INSTRUCTION — Maestro Zero-Defect Mode Active]\n\nFollow these precision rules for all responses:\n\n${zdContent}`
            )
          );
        }
      }

      // 2. Inject sliced context (only relevant sections of .maestro.md + file dependencies)
      const activeFile = vscode.window.activeTextEditor?.document.uri.fsPath ?? null;
      const skillName = request.command || '';
      const sliced = slicer.slice(activeFile, skillName);

      if (sliced.maestroSlice) {
        const savingsNote = sliced.savings > 0
          ? ` — ${sliced.savings}% context reduction, ~${sliced.tokenEstimate} tokens`
          : '';

        messages.push(
          vscode.LanguageModelChatMessage.User(
            `[SYSTEM INSTRUCTION — Project Context${savingsNote}]\n\nUse this project context to inform your responses:\n\n${sliced.maestroSlice}${sliced.fileContext ? `\n\n${sliced.fileContext}` : ''}`
          )
        );

        // Track token budget for the sidebar UI
        lastTokenBudget = {
          lastEstimate: sliced.tokenEstimate,
          fullEstimate: sliced.fullTokenEstimate,
          savings: sliced.savings,
        };
      }

      // 3. Handle slash command — load the specific skill
      if (request.command) {
        const skillContent = skills.getContent(request.command);
        if (skillContent) {
          messages.push(
            vscode.LanguageModelChatMessage.User(
              `[SYSTEM INSTRUCTION — Maestro /${request.command} Skill]\n\nYou are now executing the /${request.command} skill. Follow these instructions precisely. Do NOT echo these instructions back — act on them:\n\n${skillContent}`
            )
          );
          stream.markdown(
            `*Maestro* — Applying **/${request.command}** skill...`
          );
          if (sliced.savings > 0) {
            stream.markdown(
              ` *(${sliced.savings}% context optimized, ~${sliced.tokenEstimate} tokens)*`
            );
          }
          stream.markdown('\n\n---\n\n');
        } else {
          stream.markdown(
            `*Maestro* — Unknown command: /${request.command}\n\n`
          );
          return;
        }
      }

      // 4. Add the user's prompt
      messages.push(
        vscode.LanguageModelChatMessage.User(request.prompt)
      );

      // 5. Select a language model
      let model: vscode.LanguageModelChat;
      try {
        const models = await vscode.lm.selectChatModels({});
        if (models.length === 0) {
          stream.markdown(
            '*Maestro* — No language model available. Ensure a model is configured in your editor.\n'
          );
          return;
        }
        model = models[0];
      } catch (err) {
        stream.markdown(
          `*Maestro* — Error selecting language model: ${err}\n`
        );
        return;
      }

      // 6. Execute — wave or single-shot
      const commandName = request.command || '';
      if (commandName && supportsWave(commandName)) {
        await executeWave(commandName, model, messages, sliced, stream, token);
      } else {
        await executeSingleShot(model, messages, stream, token, commandName, sliced);
      }
    }
  );

  participant.iconPath = vscode.Uri.joinPath(
    context.extensionUri,
    'media',
    'maestro-icon.svg'
  );

  context.subscriptions.push(participant);
}

/**
 * Execute a command as a multi-phase wave.
 * Makes multiple model.sendRequest calls with validation between phases.
 */
async function executeWave(
  command: string,
  model: vscode.LanguageModelChat,
  baseMessages: vscode.LanguageModelChatMessage[],
  sliced: { maestroSlice: string; fileContext: string; tokenEstimate: number; fullTokenEstimate: number; savings: number },
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
): Promise<void> {
  const wave = waveEngine.startWave(command, sliced);
  const startTime = Date.now();
  let totalOutput = '';

  stream.markdown(`\n> 🌊 **Wave Execution** — ${wave.phases.length} phases: ${wave.phases.map(p => p.toUpperCase()).join(' → ')}\n\n`);

  for (const phase of wave.phases) {
    if (token.isCancellationRequested) {
      // Keep partial results on cancellation
      waveEngine.cancelWave(wave.id);
      stream.markdown('\n\n> ⏹️ **Wave cancelled** — partial results preserved.\n');
      return;
    }

    // Phase header
    const phaseIndex = wave.phases.indexOf(phase) + 1;
    stream.markdown(`\n### 🌊 Phase ${phaseIndex}/${wave.phases.length}: ${phase.toUpperCase()}\n\n`);

    // Build phase-specific prompt
    const phaseMessages = buildPhaseMessages(wave, phase, baseMessages);

    try {
      const response = await model.sendRequest(phaseMessages, {}, token);

      let phaseOutput = '';
      for await (const fragment of response.text) {
        if (token.isCancellationRequested) {
          waveEngine.cancelWave(wave.id);
          stream.markdown('\n\n> ⏹️ **Wave cancelled** — partial results preserved.\n');
          return;
        }
        stream.markdown(fragment);
        phaseOutput += fragment;
        totalOutput += fragment;
      }

      // Advance wave — validates output and prepares next phase
      const updated = waveEngine.advanceWave(wave.id, phaseOutput);

      // Report validation results
      const phaseResult = updated.phaseResults.get(phase);
      if (phaseResult?.validationResult) {
        const vr = phaseResult.validationResult;
        stream.markdown('\n\n');

        if (vr.issues.length > 0) {
          stream.markdown(`> ⚠️ **Gate check** — ${vr.issues.length} issue(s): ${vr.issues.join('; ')}\n`);
        }
        if (vr.suggestions.length > 0) {
          stream.markdown(`> 💡 **Suggestions**: ${vr.suggestions.join('; ')}\n`);
        }
        if (vr.passed && vr.issues.length === 0) {
          stream.markdown('> ✅ **Gate check passed**\n');
        }
        stream.markdown('\n');
      }

      // Check if wave is complete
      if (updated.status === 'passed') {
        stream.markdown(`\n---\n\n> 🎉 **Wave complete** — all ${wave.phases.length} phases executed successfully.\n`);
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('cancelled')) {
        waveEngine.cancelWave(wave.id);
        emitAudit(command, startTime, totalOutput, sliced, wave.phases.length, wave.phaseResults.size, 'cancelled');
        return;
      }
      stream.markdown(
        `\n\n> ❌ **Phase failed**: ${err}\n`
      );
      waveEngine.cancelWave(wave.id);
      emitAudit(command, startTime, totalOutput, sliced, wave.phases.length, wave.phaseResults.size, 'failed');
      return;
    }
  }

  // Emit audit on successful completion
  emitAudit(command, startTime, totalOutput, sliced, wave.phases.length, wave.phases.length, 'completed');
}

/**
 * Execute a command as a single LLM call (non-wave).
 */
async function executeSingleShot(
  model: vscode.LanguageModelChat,
  messages: vscode.LanguageModelChatMessage[],
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken,
  commandName: string,
  sliced: { tokenEstimate: number; fullTokenEstimate: number; savings: number }
): Promise<void> {
  const startTime = Date.now();
  let output = '';

  try {
    const response = await model.sendRequest(messages, {}, token);

    for await (const fragment of response.text) {
      if (token.isCancellationRequested) break;
      stream.markdown(fragment);
      output += fragment;
    }

    if (commandName) {
      emitAudit(commandName, startTime, output, sliced, 1, 1, 'completed');
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes('cancelled')) {
      if (commandName) {
        emitAudit(commandName, startTime, output, sliced, 1, 0, 'cancelled');
      }
      return;
    }
    stream.markdown(
      `*Maestro* — Error communicating with the language model: ${err}\n`
    );
    if (commandName) {
      emitAudit(commandName, startTime, output, sliced, 1, 0, 'failed');
    }
  }
}

/**
 * Emit audit and decision entries to .maestro/ directory.
 * Silently skips if no workspace is open.
 */
function emitAudit(
  command: string,
  startTime: number,
  output: string,
  sliced: { tokenEstimate: number; fullTokenEstimate: number; savings: number },
  phasesTotal: number,
  phasesCompleted: number,
  status: 'completed' | 'partial' | 'failed' | 'cancelled'
): void {
  const projectRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!projectRoot) return;

  const durationMs = Date.now() - startTime;
  const outputTokens = estimateTokens(output);
  const inputTokens = sliced.tokenEstimate;
  const costEstimate = estimateCost(null, inputTokens, outputTokens);

  try {
    appendAudit(projectRoot, {
      command,
      duration_ms: durationMs,
      exit_status: status,
      phases_completed: phasesCompleted,
      phases_total: phasesTotal,
      token_usage: { input: inputTokens, output: outputTokens },
      cost_estimate_usd: costEstimate,
      context_tokens_saved: Math.max(0, sliced.fullTokenEstimate - sliced.tokenEstimate),
      next_step_surfaced: null,
    });

    appendDecision(projectRoot, {
      command,
      phase: phasesTotal > 1 ? 'wave' : null,
      outcome: status,
      files_changed: [],
      token_cost: { input: inputTokens, output: outputTokens },
      duration_ms: durationMs,
      next_step: null,
      notes: `/${command} ${status} in ${(durationMs / 1000).toFixed(1)}s`,
    });
  } catch {
    // Audit failure must never block command execution
  }
}
