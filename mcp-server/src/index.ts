#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "./tools.js";
import { registerPrompts } from "./prompts.js";
import { registerResources } from "./resources.js";
import { VERSION, SERVER_NAME } from "./version.js";

const server = new McpServer({
  name: SERVER_NAME,
  version: VERSION,
});

// Register all MCP capabilities
registerTools(server);
registerPrompts(server);
registerResources(server);

// Parse CLI args for transport selection
const args = process.argv.slice(2);
const useHttp = args.includes("--http");

if (useHttp) {
  const portIdx = args.indexOf("--port");
  const port = portIdx !== -1 ? parseInt(args[portIdx + 1], 10) : 3001;

  if (isNaN(port) || port < 1 || port > 65535) {
    console.error("Invalid port number. Use --port <1-65535>");
    process.exit(1);
  }

  // Dynamic import to avoid loading express for stdio users
  const { startHttpTransport } = await import("./http.js");
  await startHttpTransport(server, port);
} else {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
