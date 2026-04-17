---
name: amplify
description: "Use when the workflow works but needs to handle more complex cases or produce higher-quality output through better tools, context, prompts, or models."
argument-hint: "[target area]"
category: enhancement
version: 1.3.1
user-invocable: true
---

## MANDATORY PREPARATION

Invoke /agent-workflow — it contains workflow principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no workflow context exists yet, you MUST run /teach-maestro first.
Consult the tool-orchestration reference in the agent-workflow skill for adding tools effectively.


---

Take a working workflow and make it more capable. Amplification adds new abilities without breaking existing functionality.

### Amplification Strategies

**Better Prompts**

- Add few-shot examples for edge cases the model currently mishandles
- Add chain-of-thought for tasks where reasoning quality matters
- Add negative instructions for common mistakes
- Upgrade output schema with more structured fields

**Better Tools**

- Add tools for capabilities the model currently lacks
- Improve existing tool descriptions for better selection accuracy
- Add confirmation steps for high-stakes operations
- Add tools for verification/validation of outputs

**Better Context**

- Add RAG for domain-specific knowledge
- Add real-time data sources for current information
- Add user profile/history for personalization
- Add project documentation as reference context

**Better Models**

- Upgrade to a more capable model for critical steps
- Use model cascading (cheap model for simple, capable model for complex)
- Add vision capabilities if processing images/documents
- Add code execution capabilities if generating code

### Amplification Process

1. **Identify the gap**: What can't the workflow do that it should?
2. **Choose the strategy**: Which amplification approach addresses the gap?
3. **Implement incrementally**: Add one capability at a time
4. **Verify**: Run the evaluation suite to confirm improvement without regression

### Impact Assessment

| Strategy | Cost Impact | Latency Impact | Quality Impact |
|----------|-----------|---------------|----------------|
| Better prompts | None | None | Medium-High |
| Better tools | Low | Low-Medium | High |
| Better context (RAG) | Medium | Medium | High |
| Better models | High | Medium-High | High |

### Amplification Checklist

- [ ] Gap identified with concrete evidence (not assumption)
- [ ] Single strategy selected (don't amplify everything at once)
- [ ] Baseline quality score recorded before change
- [ ] Change implemented and tested
- [ ] Quality score improved without regression
- [ ] Cost/latency impact documented

### Recommended Next Step

After amplification, run `/evaluate` to verify the new capability works, or `/iterate` to set up quality monitoring for the enhanced workflow.

**NEVER**:

- Amplify without a specific gap to address (amplification without purpose is bloat)
- Add capabilities without testing them
- Upgrade models without recalculating cost
- Add tools without updating tool descriptions
