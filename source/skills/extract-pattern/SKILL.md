---
name: extract-pattern
description: "Use when the user wants to create templates, extract reusable patterns, document solutions, or build a pattern library from working workflows."
argument-hint: "[source workflow or area]"
category: utility
version: 1.3.1
user-invocable: true
---

## MANDATORY PREPARATION

Invoke {{command_prefix}}agent-workflow — it contains workflow principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no workflow context exists yet, you MUST run {{command_prefix}}teach-maestro first.

---

Turn working solutions into reusable patterns. Every successful workflow contains patterns that are applicable beyond their original context.

### Step 1: Identify What Worked

Review the workflow and identify components that:

- Solved a common problem in a particularly effective way
- Would be useful in other workflows or projects
- Required significant iteration to get right
- Represent a non-obvious solution

### Step 2: Generalize the Pattern

Transform the specific solution into a reusable template:

**From specific** → **To general pattern**:

```markdown
## Pattern: [Name]
**Problem**: What recurring problem does this solve?
**When to use**: When is this pattern appropriate?
**When NOT to use**: When is this pattern inappropriate?
**Template**: Copy-pastable starting point with customization markers.
**Variants**: Common variations for different contexts.
**Pitfalls**: What went wrong during development and how it was fixed.
**Examples**: 1-2 concrete examples.
```

### Step 3: Test Reusability

- Apply the template to a different but analogous problem
- Confirm the customization points are sufficient
- Verify the documentation is clear enough for someone unfamiliar with the original

| Workflow Element | Extract As |
|-----------------|-----------|
| Effective prompt structure | Prompt template with customization points |
| Tool chain that works well | Pipeline pattern with data flow diagram |
| Error handling strategy | Resilience pattern with implementation guide |
| Evaluation approach | Quality assurance pattern with scoring rubric |
| Context management technique | Context pattern with budget guidance |
| Agent coordination protocol | Orchestration pattern with handoff templates |

### Recommended Next Step

After extracting patterns, run `{{command_prefix}}calibrate` to ensure the new patterns are consistent with existing project conventions.

**NEVER**:

- Extract patterns from workflows that don't work reliably
- Over-generalize (if it only applies to one case, document it as a solution, not a pattern)
- Skip the "when NOT to use" section
- Extract without testing reusability
