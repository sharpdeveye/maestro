import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { skills, type SkillData } from "./generated/skills-data.js";
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
    },
    async ({ command, focus }) => {
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

      // Append the raw skill content (templates are pre-resolved in the source)
      text += skill.content;

      text += `\n\n---\n_To run a referenced command, use the \`maestro_run_command\` tool with the command name (e.g. "fortify", "guard")._`;

      return { content: [{ type: "text", text }] };
    },
  );

  // --- maestro_read_context ---
  server.tool(
    "maestro_read_context",
    "Read the .maestro.md context file from a project directory",
    {
      projectPath: z
        .string()
        .describe("Absolute path to the project root directory"),
    },
    async ({ projectPath }) => {
      const filePath = path.join(projectPath, ".maestro.md");
      try {
        const content = fs.readFileSync(filePath, "utf-8");
        return { content: [{ type: "text", text: content }] };
      } catch {
        return {
          content: [
            {
              type: "text",
              text: `No .maestro.md found at ${filePath}. Run the "teach-maestro" prompt or use maestro_init to generate one.`,
            },
          ],
          isError: true,
        };
      }
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
}
