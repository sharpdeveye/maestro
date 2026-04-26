---
name: reflect
description: "Analyze command history to identify which skills work, which fail, and where to improve."
argument-hint: "[time period]"
category: analysis
version: 2.0.0
user-invocable: true
---

## MANDATORY PREPARATION

Invoke /agent-workflow — it contains workflow principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no workflow context exists yet, you MUST run /teach-maestro first.

---

Analyze the Maestro audit trail and decision log to produce a skill-effectiveness scorecard. This tells you which commands work, which fail, and where your workflow needs attention.

### Data Sources

Read these files from the project root:

1. **`.maestro/audit.jsonl`** — every command invocation with duration, cost, and outcome
2. **`.maestro/decisions.jsonl`** — decisions made with outcomes and next steps

If neither file exists, respond: *"No audit data found. Run commands with Maestro to start tracking, then come back."*

### Analysis Dimensions

**1. Usage Frequency**
- Which commands run most/least?
- Are any commands never used? (candidates for removal)

**2. Completion Rate**
- What % of invocations complete successfully?
- Which commands fail most often?

**3. Command Flow**
- What are the most common command sequences (A → B)?
- Which commands lead to follow-ups vs. abandonment?
- Abandonment rate per command (no follow-up within 30 min)

**4. Cost Distribution**
- Total estimated cost across all commands
- Cost per command (average)
- Most/least expensive commands

**5. Duration Analysis**
- Average duration per command
- Outliers (unusually slow invocations)

### Output Format

```text
╔══════════════════════════════════════════╗
║          MAESTRO EFFECTIVENESS           ║
╠══════════════════════════════════════════╣
║ Commands Run         __ (__ unique)      ║
║ Completion Rate      __%                 ║
║ Most Used            /_____ (__×)        ║
║ Most Abandoned       /_____ (__% ⚠️)     ║
║ Avg Duration         __s                 ║
║ Total Cost           ~$__.__             ║
╠══════════════════════════════════════════╣
║           STRONGEST PIPELINES            ║
╠══════════════════════════════════════════╣
║ /_____ → /_____    __×                   ║
║ /_____ → /_____    __×                   ║
╠══════════════════════════════════════════╣
║           COST PER COMMAND               ║
╠══════════════════════════════════════════╣
║ /_____    $__.__/run  ████░░  avg        ║
║ /_____    $__.__/run  █░░░░░  cheap      ║
║ /_____    $__.__/run  █████░  costly     ║
╚══════════════════════════════════════════╝

INSIGHTS:
1. [Data-driven observation with recommended action]
2. [Data-driven observation with recommended action]
3. [Data-driven observation with recommended action]
```

### Insights Rules

Every insight MUST:
- Reference specific data (e.g., "40% abandonment rate")
- Suggest a specific Maestro command to address it
- Distinguish correlation from causation

### Reflection Checklist

- [ ] All 5 analysis dimensions covered
- [ ] Scorecard generated with real data
- [ ] Insights are data-driven, not speculative
- [ ] Cost estimates labeled as approximate (~)
- [ ] Recommended actions reference specific Maestro commands

### Recommended Next Step

After reflecting, run `/streamline` to remove unused commands, or `/refine` on the most-abandoned command to improve its prompt quality.

**NEVER**:

- Require audit data to exist — degrade gracefully
- Invent metrics beyond what the logs contain
- Show cost data without the "estimate" disclaimer (~)
- Make judgments without evidence (say "100% completion rate" not "works great")
- Compare across projects — reflect is project-scoped
