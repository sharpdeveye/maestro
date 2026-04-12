---
name: zero-defect
description: "Use when you need maximum precision on a critical task — production deployments, security-sensitive code, financial calculations, or any work where mistakes are unacceptable."
argument-hint: "[task or area]"
category: fix
version: 1.3.1
user-invocable: true
---

## MANDATORY PREPARATION

Invoke {{command_prefix}}agent-workflow — it contains workflow principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no workflow context exists yet, you MUST run {{command_prefix}}teach-maestro first.

---

Activate maximum precision mode for the current session. This command establishes execution-time discipline — not for the workflow design, but for **how the agent itself operates**. Every response, every code change, every claim must pass the zero-defect gate.

This is model-agnostic. It works with Claude, Gemini, GPT, Codex, or any AI agent.

### The 8 Precision Rules

Follow these for the **entire session** after this command is invoked:

| # | Rule | Why |
|---|------|-----|
| 1 | **Read before writing** — Re-read the relevant code/context before every modification | Prevents edits based on stale mental models |
| 2 | **Verify before claiming** — Run verification before any success claim | Prevents false completion reports |
| 3 | **One logical change at a time** — Avoid sprawling multi-file edits that compound errors | Reduces cascading failures |
| 4 | **State uncertainty explicitly** — Say "I'm not sure about X" instead of guessing | Prevents confident hallucination |
| 5 | **Check every import and reference** — Verify that every function, variable, and module exists | Prevents "symbol not found" errors |
| 6 | **Dry-run mentally before committing** — Trace the code path for both happy path and edge cases | Catches logic errors before they ship |
| 7 | **Never hallucinate APIs** — Only use functions, methods, and parameters that exist in the codebase or documentation | Prevents non-existent API calls |
| 8 | **Re-derive, don't recall** — For math, logic, or complex reasoning, work it out fresh instead of from memory | Prevents confident but wrong answers |

### The Pre-Commit Gate

Before claiming ANY work is complete, pass every item:

- [ ] Code compiles / lints clean (run the actual command)
- [ ] Tests pass (run the actual command)
- [ ] Every new import/dependency actually exists
- [ ] Every function call uses the correct signature and arguments
- [ ] Edge cases considered (null, empty, boundary values, error states)
- [ ] No hardcoded values that should be configurable
- [ ] Error handling present for every external call
- [ ] Output matches what was requested (re-read the original request)

### Anti-Pattern Table

| Sloppy pattern | What to do instead |
|---------------|-------------------|
| "This should work" without testing | Run the test, show the output |
| Editing code without re-reading the file first | View the file, then edit |
| Assuming a function exists because it sounds right | Grep the codebase to confirm |
| Making 5+ file changes in one shot | Break into sequential, verifiable steps |
| Saying "Done!" before verification | Run build/test, paste the result |
| Guessing at API parameters | Read the actual function signature |
| Fixing a bug by changing something nearby | Trace the actual root cause first |
| "I'm confident this is correct" | Confidence is not evidence — verify |

### Session Directive

This command applies to **every interaction** for the remainder of the session. There are no exceptions. The rules apply to:

- Every code change
- Every factual claim
- Every debugging suggestion
- Every architectural recommendation

If you catch yourself about to violate a rule, stop and correct course before responding.

### Recommended Next Step

After the critical work is done, run `{{command_prefix}}evaluate` to review the output quality, or `{{command_prefix}}refine` for a final polish pass.

**NEVER**:

- Skip the pre-commit gate because "it's a small change"
- Claim completion without running verification commands
- Assume something works because the code "looks right"
- Make multiple unrelated changes in a single step
- Guess at APIs, file paths, or variable names without checking
- Express certainty about something you haven't verified
