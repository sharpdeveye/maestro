import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { skills, type SkillData } from "./generated/skills-data.js";
import {
  parseMaestroSections,
  matchSections,
  reconstructContent,
  estimateTokens,
  appendDecision,
  readDecisions,
  appendAudit,
  readAudit,
} from "@maestro/core";
import { waveStateManager } from "./wave-state.js";
import * as fs from "node:fs";
import * as path from "node:path";

/** Category labels for display */
const CATEGORY_LABELS: Record<string, string> = {
  analysis: "Analysis — read-only, generate reports",
  fix: "Fix & Improve — make targeted changes",
  enhancement: "Enhancement — add capabilities",
  utility: "Utility",
};

/** Category display order */
const CATEGORY_ORDER = ["analysis", "fix", "enhancement", "utility"];

/**
 * Build a grouped command listing from bundled skills.
 */
function buildCommandListing(): string {
  const grouped: Record<string, SkillData[]> = {};

  for (const skill of skills) {
    if (!skill.userInvocable) continue;
    if (!grouped[skill.category]) grouped[skill.category] = [];
    grouped[skill.category].push(skill);
  }

  const lines: string[] = ["# Maestro Commands\n"];

  for (const cat of CATEGORY_ORDER) {
    const items = grouped[cat];
    if (!items || items.length === 0) continue;
    lines.push(`## ${CATEGORY_LABELS[cat] || cat}\n`);
    for (const s of items) {
      const hint = s.argumentHint ? ` ${s.argumentHint}` : "";
      lines.push(`- **/${s.name}**${hint} — ${s.description}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}


/**
 * Find a skill by name.
 */
function findSkill(name: string): SkillData | undefined {
  const normalized = name.replace(/^\//, "").trim().toLowerCase();
  return skills.find((s) => s.name === normalized);
}

/**
 * Generate a .maestro.md template.
 */
function generateMaestroMd(
  projectName: string,
  techStack: string,
  conventions?: string,
): string {
  const lines = [
    `# ${projectName} — Workflow Context\n`,
    `## Tech Stack\n`,
    techStack,
    "",
    `## Conventions\n`,
    conventions || "_No conventions specified. Add naming patterns, code style rules, and architectural decisions here._",
    "",
    `## Workflow Notes\n`,
    "_Add workflow-specific context: known issues, performance requirements, deployment targets, etc._",
    "",
  ];
  return lines.join("\n");
}

/**
 * Read and optionally slice Maestro context.
 * Resolution order: .maestro/context.md > .maestro.md (backward compatible)
 */
function readContextSliced(
  projectPath: string,
  skillName?: string,
  activeFile?: string
): { content: string; tokenEstimate: number; fullTokenEstimate: number; savings: number } | null {
  // Try v2 path first, then v1
  const contextPaths = [
    path.join(projectPath, ".maestro", "context.md"),
    path.join(projectPath, ".maestro.md"),
  ];

  let fullContent: string | null = null;
  for (const filePath of contextPaths) {
    try {
      fullContent = fs.readFileSync(filePath, "utf-8");
      break;
    } catch {
      // Try next path
    }
  }

  if (!fullContent) return null;

  const fullTokenEstimate = estimateTokens(fullContent);

  // If no slicing criteria, return full content
  if (!skillName && !activeFile) {
    return { content: fullContent, tokenEstimate: fullTokenEstimate, fullTokenEstimate, savings: 0 };
  }

  // Slice using @maestro/core
  const sections = parseMaestroSections(fullContent);
  const matched = matchSections(sections, {
    skillName: skillName || undefined,
    fileExtension: activeFile ? path.extname(activeFile) : undefined,
    directoryName: activeFile ? path.basename(path.dirname(activeFile)) : undefined,
  });

  const slicedContent = reconstructContent(matched);
  const tokenEstimate = estimateTokens(slicedContent);
  const savings = fullTokenEstimate > 0
    ? Math.round(((fullTokenEstimate - tokenEstimate) / fullTokenEstimate) * 100)
    : 0;

  return { content: slicedContent, tokenEstimate, fullTokenEstimate, savings: Math.max(0, savings) };
}

/**
 * Register all Maestro tools on the MCP server.
 */
export function registerTools(server: McpServer): void {
  // --- maestro_list_commands ---
  server.tool(
    "maestro_list_commands",
    "List all 21 Maestro commands grouped by category with descriptions",
    {},
    async () => ({
      content: [{ type: "text", text: buildCommandListing() }],
    }),
  );

  // --- maestro_run_command ---
  server.tool(
    "maestro_run_command",
    "Get the full instructions for a Maestro command. The AI should follow these instructions to execute the command.",
    {
      command: z
        .string()
        .describe('Command name, e.g. "diagnose", "fortify", "refine"'),
      focus: z
        .string()
        .optional()
        .describe("Optional focus area to narrow the command scope"),
      activeFile: z
        .string()
        .optional()
        .describe("Path to the active file — enables context slicing for token efficiency"),
      projectPath: z
        .string()
        .optional()
        .describe("Project root path — used for context slicing when activeFile is provided"),
    },
    async ({ command, focus, activeFile, projectPath }) => {
      const skill = findSkill(command);
      if (!skill) {
        const available = skills
          .filter((s) => s.userInvocable)
          .map((s) => s.name)
          .join(", ");
        return {
          content: [
            {
              type: "text",
              text: `Unknown command: "${command}". Available commands: ${available}`,
            },
          ],
          isError: true,
        };
      }

      let text = `# /${skill.name} — ${skill.description}\n\n`;
      if (focus) {
        text += `**Focus area**: ${focus}\n\n---\n\n`;
      }

      // If project path is provided, inject sliced context
      if (projectPath) {
        const ctx = readContextSliced(projectPath, skill.name, activeFile);
        if (ctx) {
          text += `## Project Context`;
          if (ctx.savings > 0) {
            text += ` (~${ctx.tokenEstimate} tokens, ${ctx.savings}% saved)`;
          }
          text += `\n\n${ctx.content}\n\n---\n\n`;
        }
      }

      // Append the raw skill content (templates are pre-resolved in the source)
      text += skill.content;

      text += `\n\n---\n_To run a referenced command, use the \`maestro_run_command\` tool with the command name (e.g. "fortify", "guard")._`;

      return { content: [{ type: "text", text }] };
    },
  );

  // --- maestro_read_context ---
  server.tool(
    "maestro_read_context",
    "Read the .maestro.md context file from a project directory. Supports context slicing when skill and activeFile are provided.",
    {
      projectPath: z
        .string()
        .describe("Absolute path to the project root directory"),
      skill: z
        .string()
        .optional()
        .describe("Skill name to optimize context slicing for"),
      activeFile: z
        .string()
        .optional()
        .describe("Path to the active file for dependency-aware slicing"),
    },
    async ({ projectPath, skill, activeFile }) => {
      const result = readContextSliced(projectPath, skill, activeFile);
      if (!result) {
        return {
          content: [
            {
              type: "text",
              text: `No .maestro.md found at ${path.join(projectPath, ".maestro.md")}. Run the "teach-maestro" prompt or use maestro_init to generate one.`,
            },
          ],
          isError: true,
        };
      }

      let header = "";
      if (result.savings > 0) {
        header = `*Context sliced: ~${result.tokenEstimate} tokens (${result.savings}% saved vs full context)*\n\n---\n\n`;
      }

      return { content: [{ type: "text", text: header + result.content }] };
    },
  );

  // --- maestro_init ---
  server.tool(
    "maestro_init",
    "Generate a .maestro.md context template. Returns the content — the AI should save it to the project root.",
    {
      projectName: z.string().describe("Name of the project"),
      techStack: z
        .string()
        .describe(
          "Tech stack description (e.g. 'Next.js, TypeScript, PostgreSQL, Redis')",
        ),
      conventions: z
        .string()
        .optional()
        .describe("Coding conventions, naming patterns, architectural rules"),
    },
    async ({ projectName, techStack, conventions }) => {
      const content = generateMaestroMd(projectName, techStack, conventions);
      return {
        content: [
          {
            type: "text",
            text: `Here is the generated .maestro.md content. Save this to your project root:\n\n---\n\n${content}`,
          },
        ],
      };
    },
  );

  // --- maestro_wave_start ---
  server.tool(
    "maestro_wave_start",
    "Start a staged wave execution for a complex command. Breaks the task into validated phases (Map → Validate → Scaffold → Test). Returns phase 1 instructions. Supported commands: " + waveStateManager.getSupportedCommands().join(", "),
    {
      command: z.string().describe('Command to execute as a wave (e.g., "compose", "chain", "fortify")'),
      projectPath: z.string().optional().describe("Project root path for context loading"),
      activeFile: z.string().optional().describe("Path to the active file for context slicing"),
    },
    async ({ command, projectPath, activeFile }) => {
      try {
        // Load and slice context if project path is provided
        let contextTokens = 0;
        let contextBlock = "";
        if (projectPath) {
          const ctx = readContextSliced(projectPath, command, activeFile);
          if (ctx) {
            contextTokens = ctx.tokenEstimate;
            contextBlock = `\n\n## Project Context (~${ctx.tokenEstimate} tokens)\n\n${ctx.content}\n\n---\n\n`;
          }
        }

        const wave = waveStateManager.create(command, contextTokens);
        const instruction = waveStateManager.buildPhaseInstruction(wave);

        return {
          content: [
            {
              type: "text",
              text: `# Wave Started: ${wave.id}\n\nCommand: /${command} | Phases: ${wave.phases.join(" → ")}\n\n---\n${contextBlock}${instruction}\n\n---\n\n_After completing this phase, call \`maestro_wave_advance\` with waveId="${wave.id}" and your phase output._`,
            },
          ],
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${err instanceof Error ? err.message : String(err)}` }],
          isError: true,
        };
      }
    },
  );

  // --- maestro_wave_advance ---
  server.tool(
    "maestro_wave_advance",
    "Submit the output of a completed wave phase. Validates the output and returns the next phase instructions, or a completion summary.",
    {
      waveId: z.string().describe("Wave ID from maestro_wave_start"),
      phaseOutput: z.string().describe("The full output/result of the current phase"),
    },
    async ({ waveId, phaseOutput }) => {
      try {
        const wave = waveStateManager.advance(waveId, phaseOutput);
        const lastResult = wave.phaseResults[wave.phaseResults.length - 1];

        if (wave.status === "passed") {
          // Wave complete
          const summary = wave.phaseResults
            .map((r) => `- **${r.phase.toUpperCase()}**: ${r.validationPassed ? "✅ passed" : "⚠️ issues"}`)
            .join("\n");

          return {
            content: [
              {
                type: "text",
                text: `# 🎉 Wave Complete: ${waveId}\n\n## Phase Summary\n${summary}\n\nAll ${wave.phases.length} phases executed successfully.`,
              },
            ],
          };
        }

        // Build next phase instruction
        const instruction = waveStateManager.buildPhaseInstruction(wave);
        let validationNote = "";
        if (lastResult.issues.length > 0) {
          validationNote = `\n\n> ⚠️ Previous phase had issues: ${lastResult.issues.join("; ")}\n`;
        }
        if (lastResult.suggestions.length > 0) {
          validationNote += `\n> 💡 Suggestions: ${lastResult.suggestions.join("; ")}\n`;
        }

        return {
          content: [
            {
              type: "text",
              text: `# Phase Advanced: ${wave.currentPhase.toUpperCase()}${validationNote}\n\n${instruction}\n\n---\n\n_Call \`maestro_wave_advance\` with waveId="${waveId}" and your phase output._`,
            },
          ],
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${err instanceof Error ? err.message : String(err)}` }],
          isError: true,
        };
      }
    },
  );

  // --- maestro_wave_status ---
  server.tool(
    "maestro_wave_status",
    "Get the current status and progress of an active wave execution.",
    {
      waveId: z.string().describe("Wave ID to check"),
    },
    async ({ waveId }) => {
      const wave = waveStateManager.get(waveId);
      if (!wave) {
        return {
          content: [{ type: "text", text: `Wave "${waveId}" not found. It may have expired or the server restarted.` }],
          isError: true,
        };
      }

      const phaseStatus = wave.phases
        .map((p, i) => {
          if (i < wave.currentPhaseIndex) {
            const result = wave.phaseResults.find((r) => r.phase === p);
            return `${i + 1}. **${p.toUpperCase()}** — ${result?.validationPassed ? "✅ passed" : "⚠️ issues"}`;
          } else if (i === wave.currentPhaseIndex) {
            return `${i + 1}. **${p.toUpperCase()}** — 🔄 current`;
          } else {
            return `${i + 1}. **${p.toUpperCase()}** — ⏳ pending`;
          }
        })
        .join("\n");

      return {
        content: [
          {
            type: "text",
            text: `# Wave Status: ${waveId}\n\n**Command:** /${wave.command}\n**Status:** ${wave.status}\n**Started:** ${new Date(wave.startedAt).toISOString()}\n\n## Phases\n${phaseStatus}`,
          },
        ],
      };
    },
  );

  // --- maestro_write_decision ---
  server.tool(
    "maestro_write_decision",
    "Append a decision to the Maestro decision log (.maestro/decisions.jsonl). Creates .maestro/ directory if needed.",
    {
      projectPath: z.string().describe("Absolute path to the project root"),
      command: z.string().describe("Maestro command that was run (e.g. 'fortify')"),
      outcome: z.enum(["completed", "partial", "failed", "cancelled"]).describe("Command outcome"),
      notes: z.string().max(200).describe("Brief summary of what happened"),
      filesChanged: z.array(z.string()).optional().describe("Files that were modified"),
      nextStep: z.string().optional().describe("Recommended next command"),
    },
    async ({ projectPath, command, outcome, notes, filesChanged, nextStep }) => {
      try {
        const decision = appendDecision(projectPath, {
          command,
          phase: null,
          outcome,
          files_changed: filesChanged || [],
          token_cost: { input: 0, output: 0 },
          duration_ms: 0,
          next_step: nextStep || null,
          notes,
        });

        return {
          content: [
            {
              type: "text" as const,
              text: `Decision recorded: ${decision.id}\n\nCommand: /${command}\nOutcome: ${outcome}\nNotes: ${notes}${nextStep ? `\nNext step: /${nextStep}` : ""}`,
            },
          ],
        };
      } catch (err) {
        return {
          content: [{ type: "text" as const, text: `Error writing decision: ${err}` }],
          isError: true,
        };
      }
    },
  );

  // --- maestro_read_decisions ---
  server.tool(
    "maestro_read_decisions",
    "Read recent decisions from the Maestro decision log.",
    {
      projectPath: z.string().describe("Absolute path to the project root"),
      limit: z.number().optional().default(20).describe("Max entries to return (most recent first)"),
    },
    async ({ projectPath, limit }) => {
      const decisions = readDecisions(projectPath, limit);

      if (decisions.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: "No decisions found. Run Maestro commands to start building a decision history.",
            },
          ],
        };
      }

      const lines = decisions.map(
        (d) => `- **${d.ts}** — /${d.command} → ${d.outcome}${d.notes ? ` — ${d.notes}` : ""}`
      );

      return {
        content: [
          {
            type: "text" as const,
            text: `# Recent Decisions (${decisions.length})\n\n${lines.join("\n")}`,
          },
        ],
      };
    },
  );

  // --- maestro_read_audit ---
  server.tool(
    "maestro_read_audit",
    "Read audit trail entries — command invocations with duration, cost, and outcome.",
    {
      projectPath: z.string().describe("Absolute path to the project root"),
      limit: z.number().optional().default(50).describe("Max entries to return (most recent first)"),
    },
    async ({ projectPath, limit }) => {
      const entries = readAudit(projectPath, limit);

      if (entries.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: "No audit data found. Use Maestro commands via the VS Code extension to generate audit entries.",
            },
          ],
        };
      }

      const totalCost = entries.reduce((sum, e) => sum + (e.cost_estimate_usd || 0), 0);
      const avgDuration = entries.reduce((sum, e) => sum + e.duration_ms, 0) / entries.length;

      const lines = entries.map(
        (e) =>
          `- **${e.ts}** — /${e.command} [${e.exit_status}] ${(e.duration_ms / 1000).toFixed(1)}s ~$${(e.cost_estimate_usd || 0).toFixed(4)}`
      );

      return {
        content: [
          {
            type: "text" as const,
            text: `# Audit Trail (${entries.length} entries)\n\n**Total cost:** ~$${totalCost.toFixed(4)}\n**Avg duration:** ${(avgDuration / 1000).toFixed(1)}s\n\n${lines.join("\n")}`,
          },
        ],
      };
    },
  );
}
