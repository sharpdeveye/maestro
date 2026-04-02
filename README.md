# Maestro

**Workflow fluency for AI harnesses.** 1 skill, 20 commands, and curated anti-patterns for masterful AI agent workflows.

Quick start: `npx skills add sharpdeveye/maestro`

---

## What is Maestro?

AI agents are only as good as the workflows they operate in. Without guidance, you get the same predictable mistakes: unstructured prompts, context window overflows, tool sprawl, no error handling, and multi-agent systems for single-agent problems.

Maestro fights that pattern with:
- A comprehensive **agent-workflow** skill with 7 domain-specific reference files ([view source](source/skills/agent-workflow))
- **20 commands** to diagnose, evaluate, refine, streamline, fortify, and more
- Curated **anti-patterns** that explicitly tell the AI what NOT to do
- A **context gathering protocol** (`.maestro.md`) that ensures every command has project-specific awareness

### The Skill: agent-workflow

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

### 20 Commands

#### Analysis (read-only, generate reports)
| Command | Purpose |
|---------|---------|
| `/diagnose` | Systematic workflow quality audit with scored dimensions |
| `/evaluate` | Holistic review of workflow interaction quality |

#### Fix & Improve (make targeted changes)
| Command | Purpose |
|---------|---------|
| `/refine` | Final quality pass on prompts, tools, and configuration |
| `/streamline` | Remove unnecessary complexity, flatten over-engineering |
| `/calibrate` | Align workflow components to project conventions |
| `/fortify` | Add error handling, retries, fallbacks, circuit breakers |

#### Enhancement (add capabilities)
| Command | Purpose |
|---------|---------|
| `/amplify` | Boost capabilities with better tools and context |
| `/compose` | Design multi-agent orchestration and delegation |
| `/enrich` | Add knowledge sources, RAG, and grounding |
| `/accelerate` | Optimize for speed, reduce latency and cost |
| `/chain` | Build effective tool chains and pipelines |
| `/guard` | Add safety constraints and security boundaries |
| `/iterate` | Set up feedback loops and evaluation cycles |
| `/temper` | Reduce over-engineering, simplify overbuilt workflows |
| `/turbocharge` | Push past conventional limits — advanced techniques |

#### Utility
| Command | Purpose |
|---------|---------|
| `/extract-pattern` | Extract reusable patterns from working workflows |
| `/adapt-workflow` | Adapt workflows for different providers/contexts |
| `/onboard-agent` | Set up new agent configurations from scratch |
| `/specialize` | Make workflows domain-specific (legal, medical, etc.) |
| `/teach-maestro` | One-time context gathering, saves to `.maestro.md` |

### Anti-Patterns ("Workflow Slop")

The skill includes explicit guidance on what to avoid:
- Don't dump entire codebases/databases into context
- Don't use multi-agent systems for single-agent problems
- Don't skip error handling (happy path only = production failure)
- Don't retry the same prompt hoping for different results
- Don't deploy without cost controls
- Don't use vague tool descriptions that confuse the model
- Don't ship without evaluation ("it seems to work")

## Getting Started

### Install the skills

```bash
npx skills add sharpdeveye/maestro
```

### Use commands

Once installed, use commands in your AI harness:

```
/diagnose          # Find workflow issues
/streamline        # Remove unnecessary complexity
/fortify           # Add error handling
/refine            # Final quality pass
```

Most commands accept an optional argument to focus on a specific area:

```
/diagnose prompts
/fortify payment-workflow
/specialize legal
```

### Combine commands

```
/diagnose /calibrate /refine    # Full workflow: audit → standardize → polish
/evaluate /fortify /accelerate  # Review → harden → optimize
```

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

## Manual Installation

If `npx skills add` doesn't work for your setup, copy the appropriate provider directory to your project root:

```bash
# Example for Claude Code
cp -r .claude/skills/ your-project/.claude/skills/

# Example for Cursor
cp -r .cursor/skills/ your-project/.cursor/skills/
```

## Contributing

Contributions welcome! Please ensure:
- All content is original (no copying from other skill projects)
- SKILL.md files have valid YAML frontmatter
- Run `npm run check` to validate before submitting

## License

MIT. See [LICENSE](LICENSE).

Created by [MOHAMMED ZOUAZOU](https://github.com/sharpdeveye)
