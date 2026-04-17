import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { skills, references } from "./generated/skills-data.js";
/**
 * Register all reference documents and the core skill as MCP resources.
 * These are read-only knowledge bases the AI can consult on demand.
 */
export function registerResources(server: McpServer): void {
  // Core agent-workflow skill
  const coreSkill = skills.find((s) => s.name === "agent-workflow");
  if (coreSkill) {
    server.resource(
      "agent-workflow",
      "maestro://skill/agent-workflow",
      {
        description:
          "Core Maestro skill — workflow design principles, context gathering protocol, and anti-patterns",
        mimeType: "text/markdown",
      },
      async () => ({
        contents: [
          {
            uri: "maestro://skill/agent-workflow",
            mimeType: "text/markdown",
            text: coreSkill.content,
          },
        ],
      }),
    );
  }

  // 7 reference documents
  for (const ref of references) {
    const uri = `maestro://reference/${ref.name}`;
    const displayName = ref.name
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    server.resource(
      ref.name,
      uri,
      {
        description: `Maestro reference: ${displayName}`,
        mimeType: "text/markdown",
      },
      async () => ({
        contents: [
          {
            uri,
            mimeType: "text/markdown",
            text: ref.content,
          },
        ],
      }),
    );
  }
}
