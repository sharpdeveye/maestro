---
name: recap
description: "Quick summary of the last session — commands run, files changed, and what to do next."
argument-hint: "[optional: session file]"
category: utility
version: 2.0.0
user-invocable: true
---

## MANDATORY PREPARATION

Invoke /agent-workflow — it contains workflow principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no workflow context exists yet, you MUST run /teach-maestro first.

---

Get back up to speed fast. Recap reads the most recent session file and recent decisions to tell you where you left off and what to do next.

### Data Sources

1. **`.maestro/sessions/`** — read the most recent session file (by filename date)
2. **`.maestro/decisions.jsonl`** — read the last 5 decisions

If no session files exist, read the last 10 decisions and summarize those instead.

If no data exists at all, respond: *"No session history found. Run `/capture` at the end of your next session to start tracking."*

### Output Format

```text
┌─────────────────────────────────────┐
│         LAST SESSION RECAP          │
├─────────────────────────────────────┤
│ Date: YYYY-MM-DD                    │
│ Commands: /diagnose → /fortify (2)  │
│ Files: 3 changed, 1 created        │
│ Outcome: Completed                  │
├─────────────────────────────────────┤
│ PICK UP HERE:                       │
│ 1. Run /guard — rate limiting       │
│ 2. Run /evaluate — adversarial tests│
└─────────────────────────────────────┘
```

### Recap Rules

- Be concise — this is a 30-second read, not a report
- Lead with the "PICK UP HERE" section — that's what the user needs
- If the session ended with open issues, highlight them
- Reference specific files and commands, not vague summaries

### Recap Checklist

- [ ] Most recent session identified
- [ ] Commands and outcomes summarized in one line each
- [ ] "Pick up here" section has specific, actionable next steps
- [ ] Open issues from last session surfaced

### Recommended Next Step

After recapping, run the first command listed in "Pick Up Here" to continue where you left off.

**NEVER**:

- Dump the entire session file — summarize it
- Recap without checking decisions.jsonl for recent activity
- Give vague next steps ("continue working") — be specific
- Assume context from the current conversation — only use persisted data
