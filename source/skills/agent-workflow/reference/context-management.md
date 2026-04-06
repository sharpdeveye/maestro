## Context Window Optimization

### The Attention Gradient

Models don't pay equal attention to all parts of the context:

```text
┌─────────────────────────────────────┐
│ HIGH ATTENTION — Start of context   │  ← System prompt, role, critical rules
│                                     │
│ LOWER ATTENTION — Middle            │  ← Supporting context, examples
│                                     │
│ HIGH ATTENTION — End of context     │  ← Current request, recent messages
└─────────────────────────────────────┘
```

**Implication**: Place the most important information at the START and END. Put supporting details in the middle.

### Budget Allocation Strategy

Before building a workflow, calculate your context budget:

| Model | Window Size | Practical Budget |
|-------|-------------|-----------------|
| 8K models | 8,192 tokens | ~5,500 usable |
| 32K models | 32,768 tokens | ~22,000 usable |
| 128K models | 131,072 tokens | ~90,000 usable |
| 200K+ models | 200,000+ tokens | ~140,000 usable |

**Why "practical budget"?** Because you need to reserve:

- 20-30% for the model's response
- A safety margin for tokenization variance
- Space for tool call results (which are unpredictable in size)

### Context Composition

Prioritize what goes into context:

1. **Always include**: System prompt, output schema, current request
2. **Include if relevant**: Retrieved documents (RAG), recent conversation turns
3. **Summarize**: Long histories, large documents, previous tool results
4. **Never include**: Entire codebases, full databases, raw log files

### Sliding Window for Conversations

For multi-turn conversations:

```text
Turn 1: Full context
Turn 2: System prompt + Turn 1 summary + Turn 2 input
Turn 3: System prompt + Turns 1-2 summary + Turn 3 input
...
```

Summarize aggressively. Keep the system prompt and current turn at full fidelity. Everything else is summary.

### State Management Patterns

**Explicit state**: Pass workflow state as structured data

```json
{
  "workflow_id": "abc123",
  "current_step": 3,
  "completed_steps": [1, 2],
  "accumulated_results": { ... },
  "remaining_budget": { "tokens": 50000, "api_calls": 10 }
}
```

**Checkpoint state**: Save state at decision points so workflows can resume after failure. Every tool call, external API call, or model call is a potential failure point. Save state BEFORE, not after.

### Memory Patterns

| Pattern | Use When | Implementation |
|---------|----------|---------------|
| Full history | Short conversations (<10 turns) | Pass all turns |
| Sliding window | Medium conversations | Keep last N turns |
| Summary + recent | Long conversations | Summarize old, keep recent 3-5 |
| Episodic memory | Complex workflows | Key decisions + outcomes stored |
| Semantic memory | Knowledge-heavy tasks | Vector DB for retrieval |

### Anti-Patterns

- **The data dump**: Stuffing the entire codebase into context. Use targeted retrieval.
- **The infinite history**: Passing all 200 conversation turns. Summarize old turns.
- **The hopeful truncation**: Truncating context at a fixed token count without considering what gets cut. Truncation should be semantic, not positional.
- **The empty middle**: Putting everything at the start and end with nothing in between. The middle matters for supporting context.
