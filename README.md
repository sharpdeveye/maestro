<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/banner.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/banner.svg">
  <img src="assets/banner.svg" alt="Maestro — Workflow fluency for AI coding agents" width="100%">
</picture>

<br>

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.0.0-brightgreen.svg)](https://github.com/sharpdeveye/maestro/releases)
[![npm](https://img.shields.io/npm/v/maestro-workflow-mcp.svg?label=npm&color=cb3837)](https://www.npmjs.com/package/maestro-workflow-mcp)
[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/sharpdeveye.maestro-workflow?label=VS%20Code&logo=visual-studio-code&color=007ACC)](https://marketplace.visualstudio.com/items?itemName=sharpdeveye.maestro-workflow)
[![MCP](https://img.shields.io/badge/MCP-Compatible-00D4AA?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik0xMiAyTDIgN3Y1YzAgNS41IDQuMyAxMC40IDEwIDEyIDUuNy0xLjYgMTAtNi41IDEwLTEyVjdsLTEwLTV6Ii8+PC9zdmc+)](https://modelcontextprotocol.io)
[![Skills](https://img.shields.io/badge/skills-25-blueviolet.svg)](#the-skill-agent-workflow)
[![Commands](https://img.shields.io/badge/commands-25-orange.svg)](#25-commands)
[![10 Providers](https://img.shields.io/badge/providers-10-teal.svg)](#supported-tools)

1 core skill · 25 commands · 7 domain references · memory layer · audit trail

[Quick Start](#quick-start) · [Commands](#25-commands) · [What's New in v2](#whats-new-in-v2) · [Supported Tools](#supported-tools) · [Contributing](#contributing)

</div>

---

## What is Maestro?

AI agents are only as good as the workflows they operate in. Without guidance, you get the same predictable mistakes: unstructured prompts, context window overflows, tool sprawl, no error handling, and multi-agent systems for single-agent problems.

Maestro fights that pattern with:

- A comprehensive **agent-workflow** skill with 7 domain-specific reference files ([view source](source/skills/agent-workflow))
- **25 commands** to diagnose, evaluate, refine, streamline, fortify, capture, reflect, and more
- **Persistent memory** — decisions, audit trail, and session history survive across sessions
- Curated **anti-patterns** that explicitly tell the AI what NOT to do
- A **context gathering protocol** (`.maestro.md` or `.maestro/context.md`) that ensures every command has project-specific awareness
- **Every command recommends a next step** — no dead ends

---

## Quick Start

```bash
npx skills add sharpdeveye/maestro
```

Then use any command in your AI coding agent:

```text
/diagnose          # Find workflow issues
/streamline        # Remove unnecessary complexity
/fortify           # Add error handling
/refine            # Final quality pass
```

Most commands accept an optional argument to focus on a specific area:

```text
/diagnose prompts
/fortify payment-workflow
/specialize legal
```

### Combine Commands

```text
/diagnose /calibrate /refine    # Full workflow: audit → standardize → polish
/evaluate /fortify /accelerate  # Review → harden → optimize
```

---

## The Skill: agent-workflow

A comprehensive workflow design skill with 7 domain references ([view skill](source/skills/agent-workflow/SKILL.md)):

| Reference | Domain |
|-----------|--------|
| [prompt-engineering](source/skills/agent-workflow/reference/prompt-engineering.md) | Prompt structure, few-shot, CoT, output schemas |
| [context-management](source/skills/agent-workflow/reference/context-management.md) | Window optimization, memory, state management |
| [tool-orchestration](source/skills/agent-workflow/reference/tool-orchestration.md) | Tool design, chaining, error handling, sandboxing |
| [agent-architecture](source/skills/agent-workflow/reference/agent-architecture.md) | Topologies, handoffs, multi-agent patterns |
| [feedback-loops](source/skills/agent-workflow/reference/feedback-loops.md) | Evaluation, self-correction, regression detection |
| [knowledge-systems](source/skills/agent-workflow/reference/knowledge-systems.md) | RAG, chunking, embeddings, source attribution |
| [guardrails-safety](source/skills/agent-workflow/reference/guardrails-safety.md) | Validation, prompt injection, cost ceilings |

---

## 25 Commands

### Analysis — read-only, generate reports

| Command | Purpose |
|---------|---------|
| [`/diagnose`](source/skills/diagnose/SKILL.md) | Systematic workflow quality audit with scored dimensions |
| [`/evaluate`](source/skills/evaluate/SKILL.md) | Holistic review of workflow interaction quality |
| [`/reflect`](source/skills/reflect/SKILL.md) | 🆕 Analyze command history — which skills work, which fail |

### Fix & Improve — make targeted changes

| Command | Purpose |
|---------|---------|
| [`/refine`](source/skills/refine/SKILL.md) | Final quality pass on prompts, tools, and configuration |
| [`/streamline`](source/skills/streamline/SKILL.md) | Remove unnecessary complexity, flatten over-engineering |
| [`/calibrate`](source/skills/calibrate/SKILL.md) | Align workflow components to project conventions |
| [`/fortify`](source/skills/fortify/SKILL.md) | Add error handling, retries, fallbacks, circuit breakers |
| [`/zero-defect`](source/skills/zero-defect/SKILL.md) | Activate maximum precision mode — zero mistakes allowed |

### Enhancement — add capabilities

| Command | Purpose |
|---------|---------|
| [`/amplify`](source/skills/amplify/SKILL.md) | Boost capabilities with better tools and context |
| [`/compose`](source/skills/compose/SKILL.md) | Design multi-agent orchestration and delegation |
| [`/enrich`](source/skills/enrich/SKILL.md) | Add knowledge sources, RAG, and grounding |
| [`/accelerate`](source/skills/accelerate/SKILL.md) | Optimize for speed, reduce latency and cost |
| [`/chain`](source/skills/chain/SKILL.md) | Build effective tool chains and pipelines |
| [`/guard`](source/skills/guard/SKILL.md) | Add safety constraints and security boundaries |
| [`/iterate`](source/skills/iterate/SKILL.md) | Set up feedback loops and evaluation cycles |
| [`/temper`](source/skills/temper/SKILL.md) | Reduce over-engineering, simplify overbuilt workflows |
| [`/turbocharge`](source/skills/turbocharge/SKILL.md) | Push past conventional limits — advanced techniques |

### Utility

| Command | Purpose |
|---------|---------|
| [`/extract-pattern`](source/skills/extract-pattern/SKILL.md) | Extract reusable patterns from working workflows |
| [`/adapt-workflow`](source/skills/adapt-workflow/SKILL.md) | Adapt workflows for different providers/contexts |
| [`/onboard-agent`](source/skills/onboard-agent/SKILL.md) | Set up new agent configurations from scratch |
| [`/specialize`](source/skills/specialize/SKILL.md) | Make workflows domain-specific (legal, medical, etc.) |
| [`/teach-maestro`](source/skills/teach-maestro/SKILL.md) | One-time context gathering, saves to `.maestro.md` |
| [`/capture`](source/skills/capture/SKILL.md) | 🆕 Save a session summary — persist what happened |
| [`/recap`](source/skills/recap/SKILL.md) | 🆕 Quick summary of the last session |

---

## What's New in v2

### Memory Layer

Maestro now remembers what happened across sessions:

```text
.maestro/
├── context.md        ← project context (replaces .maestro.md)
├── decisions.jsonl    ← append-only decision log
├── audit.jsonl        ← every command invocation with cost + duration
└── sessions/
    └── 2026-04-26_fix_auth.md  ← session summaries
```

- **Backward compatible** — `.maestro.md` users change nothing
- **Opt-in** — `.maestro/` is created only when you run `/capture` or use the extension
- **Git-friendly** — session data is gitignored by default, context file is versioned

### Audit Trail

Every command invocation is logged with duration, token usage, and estimated cost:

```json
{"command":"fortify","duration_ms":8200,"cost_estimate_usd":0.019,"exit_status":"completed"}
```

### Cost Estimation

Approximate cost tracking for Claude, GPT-4, Gemini, and more. Accuracy: ±20% — useful for trends, not invoicing.

### `/reflect` — Effectiveness Scorecard

Analyze your command history to see which skills work, which fail, and where to improve:

```text
╔══════════════════════════════════════════╗
║          MAESTRO EFFECTIVENESS           ║
╠══════════════════════════════════════════╣
║ Commands Run         23 (7 unique)       ║
║ Completion Rate      87%                 ║
║ Most Used            /fortify (6×)       ║
║ Total Cost           ~$0.47              ║
╚══════════════════════════════════════════╝
```

---

## Anti-Patterns ("Workflow Slop")

The skill includes explicit guidance on what to avoid:

- Don't dump entire codebases/databases into context
- Don't use multi-agent systems for single-agent problems
- Don't skip error handling (happy path only = production failure)
- Don't retry the same prompt hoping for different results
- Don't deploy without cost controls
- Don't use vague tool descriptions that confuse the model
- Don't ship without evaluation ("it seems to work" ≠ tested)

---

## Supported Tools

| Tool | Directory |
|------|-----------|
| [Cursor](https://cursor.com) | `.cursor/skills/` |
| [Claude Code](https://claude.ai/code) | `.claude/skills/` |
| [Gemini CLI](https://github.com/google-gemini/gemini-cli) | `.gemini/skills/` |
| [Codex CLI](https://github.com/openai/codex) | `.codex/skills/` |
| [VS Code Copilot](https://code.visualstudio.com) / Antigravity | `.agents/skills/` |
| [Kiro](https://kiro.dev) | `.kiro/skills/` |
| [Trae](https://trae.ai) | `.trae/skills/` |
| [Trae China](https://trae.ai) | `.trae-cn/skills/` |
| [OpenCode](https://opencode.ai) | `.opencode/skills/` |
| [Pi](https://pi.dev) | `.pi/skills/` |

---

## MCP Server

Use Maestro as a live MCP server instead of static skill files. Any MCP-compatible client can connect — no file copying required.

### Local (stdio)

Add to your MCP client config (Claude Desktop, Cursor, VS Code, etc.):

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

### Remote (HTTP)

Host Maestro as a public MCP endpoint:

```bash
npx maestro-workflow-mcp --http --port 3001
```

Clients connect to `http://your-server:3001/mcp`.

### What the MCP Server Exposes

| Type | Count | Description |
|------|-------|-------------|
| **Prompts** | 25 | One per command — select from the prompt picker |
| **Tools** | 10 | `list_commands`, `run_command`, `read_context`, `init`, `wave_start`, `wave_advance`, `wave_status`, `write_decision`, `read_decisions`, `read_audit` |
| **Resources** | 8 | Core skill + 7 domain references |

---

## Manual Installation

If `npx skills add` doesn't work for your setup, copy the appropriate provider directory to your project root:

```bash
# Example for Claude Code
cp -r .claude/skills/ your-project/.claude/skills/

# Example for Cursor
cp -r .cursor/skills/ your-project/.cursor/skills/
```

---

## Project Structure

```text
maestro/
├── source/skills/           # 25 source skill definitions
│   ├── agent-workflow/      # Core skill + 7 reference files
│   │   └── reference/       # Domain-specific guidance
│   ├── diagnose/            # Analysis commands
│   ├── evaluate/
│   ├── reflect/             # 🆕 Effectiveness analysis
│   ├── refine/              # Fix & improve commands
│   ├── streamline/
│   ├── calibrate/
│   ├── fortify/
│   ├── zero-defect/
│   ├── amplify/             # Enhancement commands
│   ├── compose/
│   ├── enrich/
│   ├── accelerate/
│   ├── chain/
│   ├── guard/
│   ├── iterate/
│   ├── temper/
│   ├── turbocharge/
│   ├── extract-pattern/     # Utility commands
│   ├── adapt-workflow/
│   ├── onboard-agent/
│   ├── specialize/
│   ├── teach-maestro/
│   ├── capture/             # 🆕 Session persistence
│   └── recap/               # 🆕 Session recovery
├── packages/core/           # Shared utilities
│   └── src/
│       ├── context-utils.ts  # Section parser + matcher
│       ├── token-estimator.ts # Token estimation
│       ├── decisions.ts      # 🆕 Decision log
│       ├── audit.ts          # 🆕 Audit trail
│       └── cost-estimator.ts # 🆕 Cost estimation
├── maestro-extension/       # VS Code extension
├── mcp-server/              # MCP server package
│   ├── src/
│   │   ├── index.ts         # Entry point (stdio + HTTP)
│   │   ├── http.ts          # HTTP transport wrapper
│   │   ├── tools.ts         # 10 MCP tools
│   │   ├── prompts.ts       # 25 MCP prompts
│   │   └── resources.ts     # 8 MCP resources
│   └── package.json
├── scripts/
│   ├── build.js             # Multi-provider build pipeline
│   ├── bundle-skills.js     # MCP skill bundler
│   └── validate.js          # Skill validation checks
└── package.json
```

---

## Contributing

Contributions welcome! Please ensure:

- All content is original (no copying from other skill projects)
- SKILL.md files have valid YAML frontmatter with `description` starting with "Use when..."
- All code fences have a language specifier
- Run `npm run check` to validate before submitting

---

## License

MIT — see [LICENSE](LICENSE).

<div align="center">

Created by [sharpdeveye](https://github.com/sharpdeveye)

</div>
