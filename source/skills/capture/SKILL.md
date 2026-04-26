---
name: capture
description: "Capture a session summary — what was done, what decisions were made, and what to do next."
argument-hint: "[session topic]"
category: utility
version: 2.0.0
user-invocable: true
---

## MANDATORY PREPARATION

Invoke /agent-workflow — it contains workflow principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no workflow context exists yet, you MUST run /teach-maestro first.

---

Capture the current session's work into a persistent summary. This creates a record that survives session boundaries — future commands can reference what happened here.

### What to Capture

Read the conversation history and identify:

1. **Commands run** — which Maestro commands were invoked and in what order
2. **Decisions made** — architectural choices, trade-offs accepted, patterns adopted
3. **Files changed** — what was created, modified, or deleted
4. **Issues found** — bugs, gaps, or risks identified
5. **Next steps** — what should happen next (be specific)

### Output Format

Generate a session summary file at `.maestro/sessions/{date}_{topic}.md`:

```markdown
# Session: {topic}
Date: {YYYY-MM-DD}

## Commands Run
- /diagnose → Score: 18/25
- /fortify → Added retry logic to API handlers
- /evaluate → Verified with 3 test scenarios

## Decisions
- Chose retry-with-backoff over circuit breaker (simpler, sufficient for current load)
- Kept synchronous error handling (async not justified yet)

## Files Changed
- `src/api/handler.ts` — added retry wrapper
- `src/middleware/auth.ts` — added input validation
- `tests/api.test.ts` — new test file

## Open Issues
- Rate limiting not yet implemented (deferred to next session)

## Next Steps
1. Run `/guard` to add rate limiting
2. Run `/evaluate` with adversarial test cases
```

Also append a decision entry to `.maestro/decisions.jsonl` recording this capture.

### Session Capture Checklist

- [ ] All commands from this session listed
- [ ] Key decisions documented with rationale
- [ ] Files changed listed with brief descriptions
- [ ] Open issues captured (nothing lost)
- [ ] Next steps are specific and actionable
- [ ] Summary saved to `.maestro/sessions/`

### Recommended Next Step

After capturing, your next session should start with `/recap` to restore context, then proceed with the next steps listed above.

**NEVER**:

- Store raw prompts or full LLM outputs in the session file
- Overwrite an existing session file — create a new one
- Skip the "Next Steps" section — this is what makes capture valuable
- Capture without reading the conversation history first
- Auto-capture without the user invoking this command
