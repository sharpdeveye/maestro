import { SkillLoader } from './skills';

/**
 * Resolve Maestro template placeholders in skill content.
 * - {{command_prefix}} → "/"
 * - {{available_commands}} → comma-separated list of invocable skill names
 */
export function resolveTemplates(content: string, skills: SkillLoader): string {
  const commandList = skills.getInvocable().map(s => `/${s.name}`).join(', ');
  return content
    .replace(/\{\{command_prefix\}\}/g, '/')
    .replace(/\{\{available_commands\}\}/g, commandList);
}
