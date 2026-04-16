# Maestro — AI Workflow Fluency

[![Version](https://img.shields.io/visual-studio-marketplace/v/sharpdeveye.maestro-workflow?color=blue)](https://marketplace.visualstudio.com/items?itemName=sharpdeveye.maestro-workflow)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

**21 commands for production-grade AI agent workflows.** Auto-inject precision rules, browse commands from the sidebar, and manage your workflow context — all from your editor.

Works in **VS Code**, **Cursor**, **Antigravity**, and **Windsurf**.

## Features

### Command Center Sidebar

Browse all 21 Maestro commands organized by category — Analysis, Fix & Improve, Enhancement, and Utility. Click any command to insert it into your AI chat.

### Zero-Defect Mode

Toggle maximum-precision mode from the status bar or sidebar. When active, Maestro's 8 precision rules are automatically injected into every AI prompt — no manual copy-paste needed.

- **VS Code / Antigravity**: Injects via Chat Participant system message
- **Cursor**: Auto-generates `.cursorrules` with precision rules
- **Claude Code**: Auto-generates `CLAUDE.md` with precision rules

### `@maestro` Chat Participant

Use `@maestro` directly in VS Code chat with slash commands:

```
@maestro /diagnose my authentication flow
@maestro /fortify the error handling in this module
@maestro /zero-defect activate maximum precision
```

### `.maestro.md` Auto-Detection

Maestro automatically detects your project's `.maestro.md` context file and includes it in every command execution for project-aware AI guidance.

## Commands

| Category | Command | Description |
|----------|---------|-------------|
| Analysis | `/diagnose` | Systematic workflow quality audit |
| Analysis | `/evaluate` | Interaction quality review |
| Fix | `/refine` | Final quality pass |
| Fix | `/streamline` | Remove complexity and cruft |
| Fix | `/calibrate` | Align to project conventions |
| Fix | `/fortify` | Add error handling and retry logic |
| Fix | `/zero-defect` | Maximum precision enforcement |
| Enhancement | `/amplify` | Handle more complex cases |
| Enhancement | `/chain` | Multi-step processing pipelines |
| Enhancement | `/compose` | Multi-agent coordination |
| Enhancement | `/enrich` | Add knowledge sources |
| Enhancement | `/guard` | Safety constraints and validation |
| Enhancement | `/iterate` | Self-correction feedback loops |
| Enhancement | `/accelerate` | Optimize for performance |
| Enhancement | `/turbocharge` | Advanced performance techniques |
| Utility | `/teach-maestro` | Generate `.maestro.md` for your project |
| Utility | `/onboard-agent` | Set up a new project |
| Utility | `/adapt-workflow` | Port to a different AI provider |
| Utility | `/specialize` | Domain-specific expertise |
| Utility | `/extract-pattern` | Build reusable templates |
| Utility | `/temper` | Remove over-engineering |

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `maestro.zeroDefectAutoInject` | `false` | Auto-inject precision rules into every prompt |
| `maestro.editorAdapter` | `auto` | Editor adapter: `auto`, `vscode`, `cursor`, `claude-code` |

## Requirements

- VS Code 1.95+ (or compatible fork)
- No additional dependencies required

## Links

- [Maestro Website](https://maestroskills.dev)
- [GitHub Repository](https://github.com/sharpdeveye/maestro)
- [MCP Server (npm)](https://www.npmjs.com/package/maestro-workflow-mcp)

## License

MIT
