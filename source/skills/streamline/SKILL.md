---
name: streamline
description: "Remove unnecessary complexity from agent workflows. Flatten over-engineered pipelines, eliminate redundant steps, consolidate overlapping tools, and simplify configuration. Use when the workflow feels too complex or has accumulated cruft."
argument-hint: "[target area]"
user-invocable: true
---

## MANDATORY PREPARATION
Invoke {{command_prefix}}agent-workflow — it contains workflow principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no workflow context exists yet, you MUST run {{command_prefix}}teach-maestro first.

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

**NEVER**:
- Remove error handling in the name of simplicity
- Streamline without verifying the golden test set still passes
- Remove logging or observability
- Simplify below the level of correctness
- Remove safety guardrails
