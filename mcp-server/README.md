<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/sharpdeveye/maestro/main/assets/banner.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/sharpdeveye/maestro/main/assets/banner.svg">
  <img src="https://raw.githubusercontent.com/sharpdeveye/maestro/main/assets/banner.svg" alt="Maestro" width="100%">
</picture>

<br>

**MCP server for [Maestro](https://github.com/sharpdeveye/maestro) — exposes 25 workflow skills as tools, prompts, and resources for any MCP-compatible AI client.**

</div>

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
| `maestro_list_commands` | List all 25 commands grouped by category |
| `maestro_run_command` | Get full instructions for a specific command |
| `maestro_read_context` | Read `.maestro/context.md` or `.maestro.md` from a project |
| `maestro_init` | Generate a `.maestro.md` template |
| `maestro_wave_start` | Start a multi-phase wave execution |
| `maestro_wave_advance` | Advance a wave by submitting phase output |
| `maestro_wave_status` | Get current wave progress |
| `maestro_write_decision` | Append a decision to `.maestro/decisions.jsonl` |
| `maestro_read_decisions` | Read recent decisions from the log |
| `maestro_read_audit` | Read audit trail with duration and cost |

### Prompts

25 prompt templates — one per command. Select from your client's prompt picker:

`diagnose` · `evaluate` · `reflect` · `refine` · `streamline` · `calibrate` · `fortify` · `zero-defect` · `amplify` · `compose` · `enrich` · `accelerate` · `chain` · `guard` · `iterate` · `temper` · `turbocharge` · `extract-pattern` · `adapt-workflow` · `onboard-agent` · `specialize` · `teach-maestro` · `capture` · `recap`

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
