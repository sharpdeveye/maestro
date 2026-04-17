---
name: turbocharge
description: "Use when the user wants to push past conventional workflow limits with advanced performance techniques like parallel orchestration, streaming pipelines, or adaptive routing."
argument-hint: "[target]"
category: enhancement
version: 1.3.1
user-invocable: true
---

## MANDATORY PREPARATION

Invoke /agent-workflow — it contains workflow principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no workflow context exists yet, you MUST run /teach-maestro first.

---

Start your response with:

```text
──────────── ⚡ TURBOCHARGE ─────────────
》》》 Entering turbocharge mode...
```

Push a workflow past conventional limits. This isn't about adding features — it's about making existing capabilities operate at a level users didn't think was possible.

**EXTRA IMPORTANT**: Context determines what "extraordinary" means. Understand the project's scale before deciding what to turbocharge.

### Propose Before Building

1. **Think through 2-3 different directions** with trade-offs
2. **Present these options to the user and wait for their selection** before writing code
3. Only proceed with the confirmed direction

---

### For high-throughput workflows

- **Parallel fan-out**: Split input, process N simultaneously, merge results
- **Streaming pipelines**: Start processing step N+1 while step N runs
- **Progressive quality**: Fast pass on everything, detailed pass on flagged items
- **Smart batching**: Group similar items, outliers get individual treatment

### For latency-critical workflows

- **Speculative execution**: Start likely next step before current finishes
- **Cached warm paths**: Pre-compute responses for common patterns
- **Model cascading**: Try fastest model first, escalate only when needed

### For reliability-critical workflows

- **Automatic failover**: Detect failures, switch to alternatives automatically
- **State checkpointing**: Save state, resume from any point after crash
- **Chaos testing**: Intentionally break dependencies to verify recovery

### For adaptive workflows

- **Complexity routing**: Route simple inputs to fast paths, complex to thorough
- **Dynamic model selection**: Choose model based on task requirements
- **Feedback-driven optimization**: Track what works best, adapt routing

### Progressive enhancement is non-negotiable

Every turbocharge technique must degrade gracefully. The workflow without the enhancement must still work.

### Verification

- **Performance test**: Is it measurably faster/cheaper/more reliable?
- **Degradation test**: Disable enhancement — does it still work?
- **Cost test**: Does improvement justify complexity?
- **Maintenance test**: Can someone else maintain this in 6 months?

### Recommended Next Step

After turbocharging, run `/evaluate` to verify the enhancement works and degrades gracefully.

**NEVER**:

- Turbocharge before the workflow is correct (make it right, then make it fast)
- Add complexity without measuring the improvement
- Build self-healing without testing the healing
- Layer multiple turbocharge techniques at once
