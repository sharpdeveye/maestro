---
name: diagnose
description: "Systematic workflow quality audit. Scores 5 dimensions of workflow health and produces a prioritized action plan. Use when the user wants to find problems, audit quality, or get a health check on their AI workflow."
argument-hint: "[target area]"
category: analysis
version: 1.0.0
user-invocable: true
---

## MANDATORY PREPARATION
Invoke {{command_prefix}}agent-workflow — it contains workflow principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no workflow context exists yet, you MUST run {{command_prefix}}teach-maestro first.

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
- Output filtering (PII, content policy)
- Cost controls (ceilings set vs. unbounded)
- Error recovery (fallbacks vs. crash)
- Evaluation strategy (golden tests vs. "it seems to work")

### Diagnostic Report Format

```
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

**NEVER**:
- Give all 5s unless the workflow is genuinely production-excellent
- Skip dimensions — score all 5 even if some seem fine
- Diagnose without reading the actual workflow code/config
- Recommend changes without specific findings to support them
