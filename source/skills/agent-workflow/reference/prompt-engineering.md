## Prompt Structure — The 4-Zone Pattern

Every effective prompt has four zones, in order:

```text
┌─────────────────────────────────────┐
│ 1. ROLE       — Who the model is    │
│ 2. CONTEXT    — What it knows       │
│ 3. INSTRUCTION — What to do         │
│ 4. OUTPUT     — How to respond      │
└─────────────────────────────────────┘
```

### Zone 1: Role

Define the model's expertise and perspective:

- Specific domain expertise ("senior security engineer specializing in API design")
- Behavioral constraints ("you are methodical and verify before acting")
- What the role explicitly does NOT cover ("you do not handle deployment")

### Zone 2: Context

Provide the information the model needs:

- Project-specific context (from `.maestro.md`)
- Relevant code, documents, or data
- Prior conversation history (summarized, not raw)
- Tool descriptions and available capabilities

Budget guide for context allocation:
| Component | Budget % | Notes |
|-----------|----------|-------|
| System prompt | 10-15% | Role + instructions + output schema |
| Examples | 10-20% | Few-shot examples (2-3 max) |
| Retrieved context | 20-40% | RAG results, relevant documents |
| User input | 10-20% | Current request + conversation state |
| Reserved for output | 20-30% | ALWAYS reserve space for the response |

### Zone 3: Instructions

Tell the model what to do:

- Step-by-step process (numbered, not bulleted — order matters)
- Decision criteria for branching logic
- What to do when uncertain (ask vs. assume vs. skip)
- Explicit edge cases and how to handle them

### Zone 4: Output

Define the response format:

- JSON schema with required/optional fields
- Markdown template with sections
- Typed response with validation rules
- Examples of correct output

## Prompt Patterns

### Chain-of-Thought (CoT)

Use when the task requires multi-step reasoning:

```text
Think through this step by step:
1. First, identify [X]
2. Then, analyze [Y]
3. Based on steps 1-2, determine [Z]
4. Format your response as [schema]
```

- Works best for: analysis, debugging, planning
- Works poorly for: simple lookups, formatting tasks

### Few-Shot Examples

Use when the output format is non-obvious:

```text
Here are examples of correct outputs:

Input: [example 1 input]
Output: [example 1 output]

Input: [example 2 input]
Output: [example 2 output]

Now process this input: [actual input]
```

- 2-3 examples is usually sufficient
- Diminishing returns past 5 examples
- Examples should cover edge cases, not just happy path

### Structured Output

Use when you need machine-parseable responses:

```json
Respond with valid JSON matching this schema:
{
  "analysis": string,      // Your analysis in 2-3 sentences
  "confidence": number,    // 0.0-1.0 confidence score
  "action": "approve" | "reject" | "escalate",
  "reasoning": string[]    // List of reasons for your action
}
```

### Negative Instructions

Tell the model what NOT to do (surprisingly effective):

```text
IMPORTANT:
- Do NOT make up information. If you don't know, say "I don't know."
- Do NOT include code examples unless explicitly asked.
- Do NOT explain your reasoning unless the output schema includes a reasoning field.
```

## Anti-Patterns

- **The kitchen sink prompt**: 2000-word system prompt trying to cover every case. Split into focused prompts.
- **The prayer prompt**: "Please try your best to..." — be specific about what "best" means.
- **The contradiction**: "Be concise" + "Explain your reasoning in detail" — pick one.
- **The implicit format**: No output schema. The model guesses, you parse, things break.
- **The copy-paste prompt**: Same prompt for different tasks with minor tweaks. Each task deserves its own structured prompt.
