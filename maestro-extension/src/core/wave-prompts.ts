import * as vscode from 'vscode';
import type { WaveState, WavePhase } from './wave-engine';

/**
 * Build phase-specific prompt messages for a wave execution.
 *
 * Each phase gets a focused system instruction that constrains the AI
 * to only perform the work for that specific phase.
 */
export function buildPhaseMessages(
  wave: WaveState,
  phase: WavePhase,
  baseMessages: vscode.LanguageModelChatMessage[]
): vscode.LanguageModelChatMessage[] {
  const messages = [...baseMessages];

  // Add phase-specific system instruction
  const phasePrompt = getPhasePrompt(phase, wave);
  messages.push(
    vscode.LanguageModelChatMessage.User(
      `[SYSTEM INSTRUCTION — Maestro Wave Phase: ${phase.toUpperCase()}]\n\n${phasePrompt}`
    )
  );

  // If previous phases have results, include them as context
  const previousResults = getPreviousPhaseContext(wave, phase);
  if (previousResults) {
    messages.push(
      vscode.LanguageModelChatMessage.User(
        `[PREVIOUS PHASE RESULTS]\n\n${previousResults}`
      )
    );
  }

  // If the previous phase had validation issues, include them as constraints
  const validationConstraints = getValidationConstraints(wave, phase);
  if (validationConstraints) {
    messages.push(
      vscode.LanguageModelChatMessage.User(
        `[VALIDATION CONSTRAINTS — Address these in your output]\n\n${validationConstraints}`
      )
    );
  }

  return messages;
}

/**
 * Get the system prompt for a specific phase.
 */
function getPhasePrompt(phase: WavePhase, wave: WaveState): string {
  const phaseIndex = wave.phases.indexOf(phase) + 1;
  const totalPhases = wave.phases.length;
  const header = `This is phase ${phaseIndex} of ${totalPhases} in a staged execution of /${wave.command}.\n\n`;

  switch (phase) {
    case 'map':
      return (
        header +
        `**PHASE: MAP**

Your task is to analyze the codebase and produce a **structured plan** for the changes needed.

**Rules:**
- DO NOT write any implementation code
- DO NOT modify any files
- Output a numbered list of changes with exact file paths
- For each change, describe WHAT will change and WHY
- Include any dependencies between changes (order matters)
- Identify potential risks or edge cases

**Output format:**
\`\`\`markdown
## Change Plan

1. [File path] — [Description of change]
   - Reason: [Why this change is needed]
   - Dependencies: [What must happen first]
   
2. [File path] — [Description of change]
   ...
\`\`\`

Focus on completeness and accuracy. The next phase will validate this plan.`
      );

    case 'audit':
      return (
        header +
        `**PHASE: AUDIT**

Your task is to systematically audit the codebase for the issues the /${wave.command} skill is designed to address.

**Rules:**
- DO NOT modify any files
- Identify specific issues with file paths and line numbers where possible
- Categorize findings by severity (critical, warning, info)
- For each finding, suggest a concrete fix

**Output format:**
\`\`\`markdown
## Audit Findings

### Critical
1. [File path:line] — [Issue description]
   - Fix: [Suggested fix]

### Warning
1. [File path:line] — [Issue description]
   - Fix: [Suggested fix]

### Info
1. [File path:line] — [Issue description]
\`\`\``
      );

    case 'validate':
      return (
        header +
        `**PHASE: VALIDATE**

Your task is to validate the output from the previous phase against the project's architectural rules and conventions.

**Rules:**
- Check the plan/audit against the project context (.maestro.md conventions)
- Verify that proposed changes don't break existing patterns
- Flag any concerns about scope, dependencies, or side effects
- Provide a clear PASS or FAIL verdict

**Output format:**
\`\`\`markdown
## Validation Result: [PASS/FAIL]

### Checks
- [x] Follows project conventions
- [x] No breaking changes
- [ ] [Any failed check with explanation]

### Concerns
- [Any concerns to address in the next phase]
\`\`\``
      );

    case 'scaffold':
      return (
        header +
        `**PHASE: SCAFFOLD**

Your task is to implement ONLY the changes described in the validated plan from the previous phases.

**Rules:**
- Implement EXACTLY what was planned — no additional changes
- Include full file contents for new files
- Include clear diffs for modified files
- Follow all project conventions from .maestro.md
- If the validation phase flagged concerns, address them

Do not add features or changes that were not in the plan.`
      );

    case 'apply':
      return (
        header +
        `**PHASE: APPLY**

Your task is to implement fixes for the issues identified in the audit phase.

**Rules:**
- Fix ONLY the issues identified in the audit — no scope creep
- Address critical issues first, then warnings
- Follow all project conventions from .maestro.md
- Include clear diffs showing exactly what changed and why

If the validation phase flagged concerns, incorporate them.`
      );

    case 'test':
      return (
        header +
        `**PHASE: TEST**

Your task is to write tests for the code implemented in the previous phase.

**Rules:**
- Write tests that verify the changes actually work
- Cover edge cases identified in the map/audit phase
- Follow the project's existing test patterns
- Include both positive and negative test cases
- If the project uses specific test frameworks, use those`
      );

    case 'verify':
      return (
        header +
        `**PHASE: VERIFY**

Your task is to verify that the applied fixes are correct and complete.

**Rules:**
- Check each fix against the original audit finding
- Verify no regressions were introduced
- Confirm the fix follows project conventions
- List any remaining issues that were not addressed
- Provide a summary of what was fixed`
      );

    case 'report':
      return (
        header +
        `**PHASE: REPORT**

Your task is to compile a final report from the analysis performed in previous phases.

**Rules:**
- Synthesize findings into a clear, actionable report
- Include severity-ranked recommendations
- Suggest specific Maestro commands for follow-up actions
- Keep the report concise but thorough`
      );

    default:
      return header + `Execute the "${phase}" phase of the /${wave.command} command.`;
  }
}

/**
 * Build context from previous phase results.
 */
function getPreviousPhaseContext(wave: WaveState, currentPhase: WavePhase): string | null {
  const currentIndex = wave.phases.indexOf(currentPhase);
  if (currentIndex <= 0) return null;

  const lines: string[] = [];
  for (let i = 0; i < currentIndex; i++) {
    const phase = wave.phases[i];
    const result = wave.phaseResults.get(phase);
    if (result) {
      lines.push(`## Phase ${i + 1}: ${phase.toUpperCase()} (completed)\n`);
      // Truncate long outputs to save tokens
      const output = result.output.length > 3000
        ? result.output.slice(0, 3000) + '\n\n... [truncated for token efficiency]'
        : result.output;
      lines.push(output);
      lines.push('');
    }
  }

  return lines.length > 0 ? lines.join('\n') : null;
}

/**
 * Build validation constraints from the previous phase's validation result.
 */
function getValidationConstraints(wave: WaveState, currentPhase: WavePhase): string | null {
  const currentIndex = wave.phases.indexOf(currentPhase);
  if (currentIndex <= 0) return null;

  // Check the immediately previous phase for validation issues
  const prevPhase = wave.phases[currentIndex - 1];
  const prevResult = wave.phaseResults.get(prevPhase);
  if (!prevResult?.validationResult) return null;

  const vr = prevResult.validationResult;
  const lines: string[] = [];

  if (vr.issues.length > 0) {
    lines.push('**Issues to address:**');
    for (const issue of vr.issues) {
      lines.push(`- ⚠️ ${issue}`);
    }
  }

  if (vr.suggestions.length > 0) {
    lines.push('\n**Suggestions:**');
    for (const suggestion of vr.suggestions) {
      lines.push(`- 💡 ${suggestion}`);
    }
  }

  return lines.length > 0 ? lines.join('\n') : null;
}
