import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";

/**
 * Start the MCP server with Streamable HTTP transport.
 * Binds a POST /mcp endpoint for MCP client connections.
 */
export async function startHttpTransport(
  server: McpServer,
  port: number,
): Promise<void> {
  const app = express();
  app.use(express.json());

  // Create the transport
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  // Bind route
  app.post("/mcp", async (req, res) => {
    try {
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error("MCP request error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  // Health check
  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      server: "maestro-workflow-mcp",
      version: "1.1.0",
    });
  });

  // Connect server to transport
  await server.connect(transport);

  // Start listening
  app.listen(port, () => {
    console.error(`Maestro MCP server running at http://localhost:${port}/mcp`);
    console.error(`Health check: http://localhost:${port}/health`);
  });
}
