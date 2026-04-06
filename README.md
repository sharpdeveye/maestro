<div align="center">

<img src="assets/logo.svg" alt="Maestro" width="80" />

# Maestro

**Workflow fluency for AI coding agents.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.1.0-brightgreen.svg)](https://github.com/sharpdeveye/maestro/releases)
[![Skills](https://img.shields.io/badge/skills-21-blueviolet.svg)](#the-skill-agent-workflow)
[![Commands](https://img.shields.io/badge/commands-20-orange.svg)](#20-commands)
[![10 Providers](https://img.shields.io/badge/providers-10-teal.svg)](#supported-tools)

1 core skill · 20 commands · 7 domain references · curated anti-patterns

[Quick Start](#quick-start) · [Commands](#20-commands) · [Supported Tools](#supported-tools) · [Contributing](#contributing)

</div>

---

## What is Maestro?

AI agents are only as good as the workflows they operate in. Without guidance, you get the same predictable mistakes: unstructured prompts, context window overflows, tool sprawl, no error handling, and multi-agent systems for single-agent problems.

Maestro fights that pattern with:

- A comprehensive **agent-workflow** skill with 7 domain-specific reference files ([view source](source/skills/agent-workflow))
- **20 commands** to diagnose, evaluate, refine, streamline, fortify, and more
- Curated **anti-patterns** that explicitly tell the AI what NOT to do
- A **context gathering protocol** (`.maestro.md`) that ensures every command has project-specific awareness
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

## 20 Commands

### Analysis — read-only, generate reports

| Command | Purpose |
|---------|---------|
| [`/diagnose`](source/skills/diagnose/SKILL.md) | Systematic workflow quality audit with scored dimensions |
| [`/evaluate`](source/skills/evaluate/SKILL.md) | Holistic review of workflow interaction quality |

### Fix & Improve — make targeted changes

| Command | Purpose |
|---------|---------|
| [`/refine`](source/skills/refine/SKILL.md) | Final quality pass on prompts, tools, and configuration |
| [`/streamline`](source/skills/streamline/SKILL.md) | Remove unnecessary complexity, flatten over-engineering |
| [`/calibrate`](source/skills/calibrate/SKILL.md) | Align workflow components to project conventions |
| [`/fortify`](source/skills/fortify/SKILL.md) | Add error handling, retries, fallbacks, circuit breakers |

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
├── source/skills/           # 21 source skill definitions
│   ├── agent-workflow/      # Core skill + 7 reference files
│   │   └── reference/       # Domain-specific guidance
│   ├── diagnose/            # Analysis commands
│   ├── evaluate/
│   ├── refine/              # Fix & improve commands
│   ├── streamline/
│   ├── calibrate/
│   ├── fortify/
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
│   └── teach-maestro/
├── scripts/
│   ├── build.js             # Multi-provider build pipeline
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

Created by [MOHAMMED ZOUAZOU](https://github.com/sharpdeveye)

</div>
