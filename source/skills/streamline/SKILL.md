---
name: streamline
description: "Use when the workflow feels too complex, has accumulated cruft, or has redundant steps and overlapping tools that need consolidation."
argument-hint: "[target area]"
category: fix
version: 1.3.1
user-invocable: true
---

## MANDATORY PREPARATION

Invoke /agent-workflow — it contains workflow principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no workflow context exists yet, you MUST run /teach-maestro first.
Consult the agent-architecture reference in the agent-workflow skill for complexity assessment and topology simplification.


---

Reduce complexity without reducing capability. Every component should earn its place.

### Streamlining Analysis

For each component, ask:

1. **Does this add measurable value?** If you can't name the specific value, remove it.
2. **Can this be combined with another component?** Merge overlapping responsibilities.
3. **Is this solving a real problem or an imagined one?** Remove speculative complexity.
4. **Would a simpler alternative work?** Prefer simplicity over elegance.

### Common Streamlining Targets

**Pipeline Steps**

- Remove steps that transform data without changing it meaningfully
- Combine sequential steps that could be one prompt
- Eliminate validation steps that duplicate downstream validation

**Tool Consolidation**

- Merge tools that operate on the same data with different filters
- Remove tools the model never selects (check usage logs)
- Combine read tools with similar signatures

**Prompt Simplification**

- Remove instructions the model follows by default
- Consolidate redundant constraints
- Shorten few-shot examples to minimum viable length

**Configuration Reduction**

- Remove config parameters that always use the default
- Hardcode values that never change between environments
- Merge related config into logical groups

### Streamlining Report

For each recommendation:

1. **What to remove/simplify** — specific component or code
2. **Why it's safe** — what ensures functionality is preserved
3. **Expected impact** — latency reduction, cost reduction, or maintainability improvement

### Complexity Score

| Component | Current | Minimal Viable | Action |
|-----------|---------|---------------|--------|
| Pipeline steps | ? | ? | Remove/merge ? |
| Tools | ? | ? | Consolidate ? |
| Config params | ? | ? | Remove ? |
| Agent count | ? | ? | Collapse ? |

### Streamlining Checklist

- [ ] Each component justified with concrete value
- [ ] Redundant steps identified and marked for removal
- [ ] Tool usage logs checked for never-used tools
- [ ] Golden test set passes after each simplification
- [ ] No safety guardrails, logging, or error handling removed

### Recommended Next Step

After streamlining, run `/evaluate` to verify functionality is preserved, then `/refine` for final polish.

**NEVER**:

- Remove error handling in the name of simplicity
- Streamline without verifying the golden test set still passes
- Remove logging or observability
- Simplify below the level of correctness
- Remove safety guardrails
