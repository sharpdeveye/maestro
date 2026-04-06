---
name: chain
description: "Use when the workflow needs multi-step processing with sequential, parallel, or conditional tool compositions and proper data flow."
argument-hint: "[pipeline description]"
category: enhancement
version: 1.1.0
user-invocable: true
---

## MANDATORY PREPARATION

Invoke {{command_prefix}}agent-workflow — it contains workflow principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no workflow context exists yet, you MUST run {{command_prefix}}teach-maestro first.
Consult the tool-orchestration reference in the agent-workflow skill for composition patterns and error handling.


---

Design tool chains that do complex work reliably. A chain is only as strong as its weakest link.

### Chain Patterns

**Sequential**: A → B → C (each step depends on the previous)
**Parallel**: [A, B, C] → Merge (independent steps run simultaneously)
**Conditional**: A → (if X then B, else C) → D (branching based on results)
**Iterative**: A → Check → (if not done) → A again (loop until convergence)

### Chain Design Process

For each chain, define:

```markdown
## Chain: [Name]

### Steps
1. [Tool A] — [what it does] — Input: [schema] — Output: [schema]
2. [Tool B] — [what it does] — Input: [output of step 1] — Output: [schema]
3. [Tool C] — [what it does] — Input: [output of step 2] — Output: [schema]

### Data Flow
Step 1 output.field_a → Step 2 input.source_data
Step 2 output.results → Step 3 input.items

### Error Handling
Step 1 failure → [retry 3x, then return error]
Step 2 failure → [return partial results from step 1]
Step 3 failure → [retry with simplified input]

### Constraints
Max total execution time: 60s
Max retries per step: 3
```

### Chain Validation

- [ ] Data schemas are compatible between connected steps
- [ ] Every step has error handling
- [ ] Total chain timeout is set
- [ ] Maximum iteration count is set for loops
- [ ] Partial results are handled (what if step 2 of 4 fails?)

### Recommended Next Step

After building the chain, run `{{command_prefix}}fortify` to add error handling at each step, then `{{command_prefix}}evaluate` to test the full pipeline.

**NEVER**:

- Build chains without defining data contracts between steps
- Create loops without maximum iteration counts
- Skip error handling at any step (the chain breaks at the weakest link)
- Assume output of step N is always valid input for step N+1
- Build long chains when a single prompt could handle the task
