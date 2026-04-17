import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { skills } from "./generated/skills-data.js";
/**
 * Register all 21 user-invocable command skills as MCP prompt templates.
 * Users can select these from the prompt picker in their MCP client.
 */
export function registerPrompts(server: McpServer): void {
  const invocableSkills = skills.filter((s) => s.userInvocable);

  for (const skill of invocableSkills) {
    server.prompt(
      skill.name,
      skill.description,
      {
        focus: z
          .string()
          .optional()
          .describe("Optional focus area to narrow the command scope"),
      },
      ({ focus }) => {
        let text = "";

        if (focus) {
          text += `Focus area: ${focus}\n\n---\n\n`;
        }

        text += skill.content;

        return {
          messages: [
            {
              role: "user" as const,
              content: {
                type: "text" as const,
                text,
              },
            },
          ],
        };
      },
    );
  }
}
