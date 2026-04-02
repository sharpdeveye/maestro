## Tool Design Principles

### The Tool Count Problem
More tools = more confusion. Models perform best with focused tool sets:

| Tool Count | Model Performance | Recommendation |
|-----------|------------------|----------------|
| 1-3 | Excellent | Simple workflows |
| 4-7 | Good | Most workflows |
| 8-12 | Degrading | Consider splitting into sub-agents |
| 13+ | Unreliable | Refactor — too many tools |

### Tool Description Quality

Tool descriptions are prompts. Write them like prompts:

**Bad** (vague):
```
name: process_data
description: Processes data
```

**Good** (specific):
```
name: search_documents
description: |
  Search the document index for relevant passages.
  Use when: The user asks a question that requires information from project documents.
  Do NOT use when: The question is about code (use search_code instead).
  Input: A natural language query (not keywords).
  Returns: Top 5 matching passages with source file and relevance score.
  Note: Results are sorted by relevance. Scores below 0.3 are likely irrelevant.
```

### Tool Schema Design

Every tool needs:
1. **Clear input schema** — typed parameters with descriptions
2. **Clear output schema** — what the tool returns on success
3. **Error schema** — what the tool returns on failure
4. **Examples** — at least one example input/output pair

### Error Handling in Tools

Tools WILL fail. Plan for it:

```
Success response:
  { "status": "success", "data": { ... } }

Expected failure (e.g., not found):
  { "status": "not_found", "message": "No document matching query" }

Unexpected failure (e.g., service down):
  { "status": "error", "code": "SERVICE_UNAVAILABLE", "message": "...", "retryable": true }
```

### Idempotency

Make tools idempotent where possible:
- **Reads**: Always idempotent (search, fetch, list)
- **Creates**: Use idempotency keys to prevent duplicates
- **Updates**: Use conditional updates (if-match / version checks)
- **Deletes**: Soft-delete by default, hard-delete only with confirmation

### Tool Composition Patterns

**Sequential chain**: Tool A output → Tool B input → Tool C input
- Use when each step depends on the previous
- Verify output schema compatibility between tools

**Parallel fan-out**: Input → [Tool A, Tool B, Tool C] → Merge results
- Use when steps are independent
- Define merge strategy before executing

**Conditional routing**: Input → Decision → Tool A OR Tool B
- Use when different inputs need different tools
- Define clear routing criteria

**Iterative loop**: Input → Tool A → Check → (if not done) → Tool A again
- Use when convergence is needed
- ALWAYS set a maximum iteration count
- Define convergence criteria explicitly

### Anti-Patterns

- **The Swiss Army knife**: One tool that does 15 things based on a "mode" parameter. Split into focused tools.
- **The leaky tool**: Tool that exposes internal implementation details in its output. Abstract the interface.
- **The fire-and-forget**: Tool with no error handling. When it fails (and it will), the model has no way to recover.
- **The side-effect tool**: Tool that makes changes without confirmation. Destructive operations need a confirmation step.
- **The undescribed tool**: Tool with no description or a one-word description. The model won't know when or how to use it.
