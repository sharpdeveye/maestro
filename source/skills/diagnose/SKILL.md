---
name: diagnose
description: "Use when the user wants to find problems, audit workflow quality, or get a comprehensive health check on their AI workflow."
argument-hint: "[target area]"
category: analysis
version: 1.3.1
user-invocable: true
---

## MANDATORY PREPARATION

Invoke /agent-workflow — it contains workflow principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no workflow context exists yet, you MUST run /teach-maestro first.

---

Perform a systematic diagnostic scan across 5 dimensions. For each dimension, score 1-5 and provide specific findings.

### Dimension 1: Prompt Quality (1-5)

Evaluate:

- Structure (4-zone pattern: role, context, instructions, output)
- Output schema definition (explicit vs. implicit)
- Instruction clarity (specific vs. vague)
- Edge case handling (addressed vs. ignored)
- Anti-patterns present (wall of text, contradictions, implicit format)

### Dimension 2: Context Efficiency (1-5)

Evaluate:

- Context budget allocation (planned vs. ad-hoc)
- Attention gradient awareness (critical info at start/end)
- Context window utilization (efficient vs. wasteful)
- State management (explicit vs. implicit)
- Memory strategy (appropriate for conversation length)

### Dimension 3: Tool Health (1-5)

Evaluate:

- Tool count (3-7 ideal, 13+ problematic)
- Description quality (specific vs. vague)
- Error handling (graceful vs. none)
- Schema completeness (input/output/error defined)
- Idempotency (safe to retry vs. side-effect prone)
- **Scope attribution**: Distinguish between project-configured tools (e.g., custom scripts, project MCP servers) and agent-level tools (e.g., built-in IDE tools, global MCP servers). Only flag tool overhead for tools the project can actually control

### Dimension 4: Architecture Fitness (1-5)

Evaluate:

- Topology appropriateness (single vs. multi-agent justified)
- Agent boundaries (clear vs. overlapping)
- Handoff protocols (structured vs. ad-hoc)
- Observability (decisions logged vs. black box)
- Cost awareness (budgeted vs. unbounded)

### Dimension 5: Safety & Reliability (1-5)

Evaluate:

- Input validation (present vs. absent)
- Output filtering (PII, content policy) — **scope contextually**: data flowing between a user's own frontend and backend (e.g., authenticated sessions, internal APIs) is lower risk than data exposed to external services or third-party APIs
- Cost controls (ceilings set vs. unbounded)
- Error recovery (fallbacks vs. crash)
- Evaluation strategy (golden tests vs. "it seems to work")

### Diagnostic Report Format

```text
╔══════════════════════════════════════╗
║          MAESTRO DIAGNOSTIC         ║
╠══════════════════════════════════════╣
║ Prompt Quality      ████░  4/5      ║
║ Context Efficiency   ███░░  3/5      ║
║ Tool Health          ██░░░  2/5      ║
║ Architecture         ████░  4/5      ║
║ Safety & Reliability ██░░░  2/5      ║
╠══════════════════════════════════════╣
║ Overall Score:       15/25           ║
╚══════════════════════════════════════╝

CRITICAL FINDINGS:
1. [Most severe issue — immediate action needed]
2. [Second most severe]
3. [Third]

RECOMMENDED ACTIONS:
1. Run /fortify to add error handling (addresses Tool Health + Safety)
2. Run /streamline to reduce tool count (addresses Tool Health)
3. Run /refine for prompt structure improvements (addresses Prompt Quality)
```

### Maestro Command Mapping

Every recommended action MUST reference the specific Maestro command that addresses it. Use this mapping:

| Dimension Gap | Maestro Command | When to Recommend |
|---------------|-----------------|-------------------|
| Prompt structure, clarity, output schema | `/refine` | Score ≤ 4 on Prompt Quality |
| Context budget, attention gradient, memory | `/streamline` | Score ≤ 3 on Context Efficiency |
| Tool errors, missing tools, redundant tools | `/fortify` | Score ≤ 3 on Tool Health |
| Tool count reduction, unused tools | `/streamline` | Tool count > 7 or unused tools found |
| Safety gaps, error recovery, validation | `/fortify` | Score ≤ 3 on Safety & Reliability |
| Test coverage, golden tests, evaluation | `/guard` | No automated tests or evaluation strategy |
| Architecture boundaries, observability | `/calibrate` | Score ≤ 3 on Architecture Fitness |

**Do NOT give generic manual actions** (e.g., "Add Vitest", "Create a rollback script") without also specifying which Maestro command the user should run to implement it. The recommended action format is:
> Run `/<command>` to [specific action] (addresses [Dimension] #[gap number])

### Scoring Guide

| Score | Meaning | Maestro Action |
|-------|---------|----------------|
| 5 | Production-excellent | No action needed |
| 4 | Good with minor gaps | `/refine` for polish |
| 3 | Functional but risky | `/fortify` or `/streamline` for targeted fix |
| 2 | Significant issues | `/fortify` + `/guard` — immediate attention |
| 1 | Broken or missing | `/onboard-agent` — rebuild required |

### Diagnostic Checklist

- [ ] All 5 dimensions scored with specific evidence
- [ ] Critical findings listed in priority order
- [ ] Each finding includes specific file/component location
- [ ] Recommended actions reference specific Maestro commands (see Command Mapping above)
- [ ] Overall score calculated and report generated

### Recommended Next Step

After diagnosis, run the command mapped to your lowest-scoring dimension. For a general improvement sequence: `/fortify` → `/streamline` → `/refine`.

**NEVER**:

- Give all 5s unless the workflow is genuinely production-excellent
- Skip dimensions — score all 5 even if some seem fine
- Diagnose without reading the actual workflow code/config
- Recommend changes without specific findings to support them
- Give generic manual actions without mapping them to a Maestro command
