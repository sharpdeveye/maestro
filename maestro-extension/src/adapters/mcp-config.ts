import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * MCP server configuration entry for Maestro.
 * This is the JSON structure that gets injected into MCP config files.
 */
interface McpServerEntry {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

/**
 * Known MCP configuration file locations.
 * Each entry specifies the file path (relative to workspace root)
 * and the JSON path to the servers object.
 */
const MCP_CONFIG_LOCATIONS = [
  // VS Code / Cursor — workspace settings
  { file: '.vscode/mcp.json', serversPath: ['servers'] },
  // Claude Desktop / Claude Code
  { file: '.claude/mcp.json', serversPath: ['mcpServers'] },
  // Antigravity
  { file: '.agents/mcp.json', serversPath: ['servers'] },
];

/** The server entry key */
const MCP_SERVER_KEY = 'maestro-workflow-mcp';

/**
 * Auto-configure the Maestro MCP server in all detected config locations.
 *
 * Called during extension activation. Does NOT overwrite existing entries —
 * only adds the Maestro server if it's not already present.
 */
export async function autoConfigureMcpServer(): Promise<void> {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) return;

  const serverEntry: McpServerEntry = {
    command: 'npx',
    args: ['-y', 'maestro-workflow-mcp@latest'],
  };

  let configured = false;

  for (const location of MCP_CONFIG_LOCATIONS) {
    const configPath = path.join(workspaceRoot, location.file);

    try {
      const result = ensureServerEntry(
        configPath,
        location.serversPath,
        serverEntry
      );
      if (result === 'added') {
        configured = true;
      }
    } catch {
      // Config file doesn't exist or is malformed — skip silently
    }
  }

  // If no existing config was found, create the VS Code one as default
  if (!configured) {
    const defaultPath = path.join(workspaceRoot, '.vscode', 'mcp.json');
    try {
      createDefaultConfig(defaultPath, serverEntry);
      configured = true;
    } catch {
      // Directory creation failed — skip
    }
  }

  if (configured) {
    vscode.window.showInformationMessage(
      'Maestro: MCP server configured automatically. AI agents can now use Maestro tools.'
    );
  }
}

/**
 * Ensure the Maestro server entry exists in a config file.
 * Returns 'added' if it was added, 'exists' if already present, 'skipped' otherwise.
 */
function ensureServerEntry(
  configPath: string,
  serversJsonPath: string[],
  entry: McpServerEntry
): 'added' | 'exists' | 'skipped' {
  if (!fs.existsSync(configPath)) {
    return 'skipped';
  }

  const raw = fs.readFileSync(configPath, 'utf-8');
  let config: Record<string, unknown>;

  try {
    config = JSON.parse(raw);
  } catch {
    return 'skipped';
  }

  // Navigate to the servers object
  let current: Record<string, unknown> = config;
  for (const key of serversJsonPath) {
    if (typeof current[key] !== 'object' || current[key] === null) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }

  // Check if Maestro is already configured
  if (current[MCP_SERVER_KEY]) {
    return 'exists';
  }

  // Add the entry
  current[MCP_SERVER_KEY] = entry;

  // Write back with formatting
  const dir = path.dirname(configPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');

  return 'added';
}

/**
 * Create a default MCP config file for VS Code.
 */
function createDefaultConfig(
  configPath: string,
  entry: McpServerEntry
): void {
  const config = {
    servers: {
      [MCP_SERVER_KEY]: entry,
    },
  };

  const dir = path.dirname(configPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
}
