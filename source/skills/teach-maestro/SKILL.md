---
name: teach-maestro
description: "One-time project context gathering. Interviews the user about their AI workflow setup and saves the context to .maestro.md for use by all other Maestro commands. Run this once per project."
argument-hint: "[project name]"
user-invocable: true
---

## WHAT THIS DOES
Gathers project-specific workflow context and persists it to `.maestro.md` in the project root. All other Maestro commands read this file for project-aware guidance.

---

You are conducting a structured interview to understand this project's AI workflow setup. Be conversational but thorough.

### Interview Questions

Ask these questions one section at a time. Wait for answers before proceeding.

**Section 1 — Models & Providers**
- What AI model(s) are you using? (e.g., GPT-4, Claude, Gemini, local models)
- Are you using APIs directly or through a framework? (e.g., LangChain, LlamaIndex, custom)
- What are your context window sizes?

**Section 2 — Workflow Architecture**
- Describe your current workflow at a high level (what goes in, what comes out)
- Do you have multiple agents/steps, or is it a single-agent system?
- What tools/functions are available to your agent(s)?

**Section 3 — Quality & Evaluation**
- How do you currently evaluate output quality?
- Do you have test cases or golden examples?
- What are the most common failure modes?

**Section 4 — Constraints**
- What are your cost constraints? (budget per request, per day)
- What are your latency requirements? (real-time, batch, async)
- Are there compliance requirements? (HIPAA, GDPR, SOC2, etc.)

**Section 5 — Priorities**
- Rank these from most to least important: Quality, Speed, Cost, Safety
- What's the single biggest workflow problem you want to solve?

### Output Format

After gathering all answers, generate a `.maestro.md` file:

```markdown
# Maestro Workflow Context
Generated: [date]

## Models & Providers
[answers from section 1]

## Workflow Architecture
[answers from section 2]

## Quality & Evaluation
[answers from section 3]

## Constraints
[answers from section 4]

## Priorities
[answers from section 5, with ranked priorities]
```

Save this file to the project root as `.maestro.md`.

**NEVER**:
- Skip questions — every section matters for downstream commands
- Make assumptions — ask if unclear
- Overwrite an existing `.maestro.md` without asking
