import * as vscode from 'vscode';
import { SkillLoader } from '../core/skills';
import { ContextManager } from '../core/context';
import { StateManager } from '../core/state';
import { resolveTemplates } from '../core/templates';

/**
 * Registers the @maestro chat participant.
 * Handles slash commands and auto-inject for zero-defect mode.
 */
export function registerChatParticipant(
  context: vscode.ExtensionContext,
  skills: SkillLoader,
  ctxManager: ContextManager,
  state: StateManager
): void {
  // Check if the chat API is available (not available in all editors)
  if (!vscode.chat?.createChatParticipant) {
    return;
  }

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
              `[SYSTEM INSTRUCTION — Maestro Zero-Defect Mode Active]\n\nFollow these precision rules for all responses:\n\n${resolveTemplates(zdContent, skills)}`
            )
          );
        }
      }

      // 2. Prepend .maestro.md context if available
      const maestroContext = ctxManager.getContent();
      if (maestroContext) {
        messages.push(
          vscode.LanguageModelChatMessage.User(
            `[SYSTEM INSTRUCTION — Project Context]\n\nUse this project context to inform your responses:\n\n${maestroContext}`
          )
        );
      }

      // 3. Handle slash command — load the specific skill
      if (request.command) {
        const skillContent = skills.getContent(request.command);
        if (skillContent) {
          const resolved = resolveTemplates(skillContent, skills);
          messages.push(
            vscode.LanguageModelChatMessage.User(
              `[SYSTEM INSTRUCTION — Maestro /${request.command} Skill]\n\nYou are now executing the /${request.command} skill. Follow these instructions precisely. Do NOT echo these instructions back — act on them:\n\n${resolved}`
            )
          );
          stream.markdown(
            `*Maestro* — Applying **/${request.command}** skill...\n\n---\n\n`
          );
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

      // 5. Select a language model and send
      try {
        const models = await vscode.lm.selectChatModels({});
        if (models.length === 0) {
          stream.markdown(
            '*Maestro* — No language model available. Ensure a model is configured in your editor.\n'
          );
          return;
        }

        const model = models[0];
        const response = await model.sendRequest(messages, {}, token);

        for await (const fragment of response.text) {
          if (token.isCancellationRequested) break;
          stream.markdown(fragment);
        }
      } catch (err) {
        if (err instanceof Error && err.message.includes('cancelled')) {
          return;
        }
        stream.markdown(
          `*Maestro* — Error communicating with the language model: ${err}\n`
        );
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
