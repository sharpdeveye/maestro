# maestro-workflow-mcp

MCP server for [Maestro](https://github.com/sharpdeveye/maestro) — exposes 21 workflow skills as tools, prompts, and resources for any MCP-compatible AI client.

## Installation

### Local (stdio)

Add to your MCP client configuration:

**Claude Desktop** (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "maestro": {
      "command": "npx",
      "args": ["-y", "maestro-workflow-mcp"]
    }
  }
}
```

**Cursor** (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "maestro": {
      "command": "npx",
      "args": ["-y", "maestro-workflow-mcp"]
    }
  }
}
```

**VS Code / Antigravity** (`.vscode/mcp.json`):

```json
{
  "servers": {
    "maestro": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "maestro-workflow-mcp"]
    }
  }
}
```

### Remote (HTTP)

Start as a public HTTP endpoint:

```bash
npx maestro-workflow-mcp --http --port 3001
```

Clients connect to `http://your-server:3001/mcp`. Health check at `/health`.

## API Reference

### Tools

| Tool | Description |
|------|-------------|
| `maestro_list_commands` | List all 20 commands grouped by category |
| `maestro_run_command` | Get full instructions for a specific command |
| `maestro_read_context` | Read `.maestro.md` from a project path |
| `maestro_init` | Generate a `.maestro.md` template |

### Prompts

20 prompt templates — one per command. Select from your client's prompt picker:

`diagnose` · `evaluate` · `refine` · `streamline` · `calibrate` · `fortify` · `amplify` · `compose` · `enrich` · `accelerate` · `chain` · `guard` · `iterate` · `temper` · `turbocharge` · `extract-pattern` · `adapt-workflow` · `onboard-agent` · `specialize` · `teach-maestro`

### Resources

| URI | Content |
|-----|---------|
| `maestro://skill/agent-workflow` | Core workflow design principles |
| `maestro://reference/prompt-engineering` | Prompt structure, CoT, few-shot |
| `maestro://reference/context-management` | Window optimization, state |
| `maestro://reference/tool-orchestration` | Tool design, error handling |
| `maestro://reference/agent-architecture` | Multi-agent topologies |
| `maestro://reference/feedback-loops` | Evaluation, self-correction |
| `maestro://reference/knowledge-systems` | RAG, embeddings |
| `maestro://reference/guardrails-safety` | Validation, cost controls |

## License

MIT — see [LICENSE](../LICENSE).
