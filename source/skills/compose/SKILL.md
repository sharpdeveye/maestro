---
name: compose
description: "Use when a single agent demonstrably cannot handle the task and multi-agent coordination is justified."
argument-hint: "[workflow description]"
category: enhancement
version: 1.3.1
user-invocable: true
---

## MANDATORY PREPARATION

Invoke /agent-workflow — it contains workflow principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no workflow context exists yet, you MUST run /teach-maestro first.
Consult the agent-architecture reference in the agent-workflow skill for topology patterns and when multi-agent is justified.

---

Design a multi-agent system. But first — are you sure you need one?

### Step 1: Pre-Composition Check

Answer these before proceeding:

1. **Has a single agent been tried and failed?** (If no, try single agent first)
2. **What specific limitation requires multiple agents?** (If you can't name it, you don't need multi-agent)
3. **Is the cost/latency increase justified?** (Multi-agent = 2-10x cost and latency)

If you can't articulate a specific limitation, use /amplify on the single agent instead.

### Step 2: Design the Topology

Choose the right architecture pattern (consult the agent-architecture reference in the agent-workflow skill):

For each agent in the system, define:

```markdown
## Agent: [Name]
Role: [One sentence]
Responsibilities: [What it does]
Boundaries: [What it does NOT do]
Tools: [List of tools this agent has access to]
Input: [What it receives]
Output: [What it produces]
```

### Step 3: Design Handoffs

For each agent-to-agent connection:

```markdown
## Handoff: [Agent A] → [Agent B]
Trigger: [When does A hand off to B?]
Payload: [What data is passed?]
Expected response: [What does A expect back?]
Timeout: [How long to wait?]
Failure handling: [What if B fails?]
```

### Step 4: Design the Supervisor

Every multi-agent system needs a supervisor:

- Monitors agent health and performance
- Routes tasks to appropriate agents
- Handles failures and escalation
- Enforces global constraints (budget, time, quality)

### Composition Checklist

- [ ] Each agent has a clear, non-overlapping role
- [ ] Handoff protocols are defined for every connection
- [ ] A supervisor pattern is in place
- [ ] Cost/latency budget accounts for all agents
- [ ] Failure modes are handled at every handoff point
- [ ] The system can be understood by reading the topology diagram

### Recommended Next Step

After composition, run `/fortify` to add error handling at every handoff, then `/evaluate` to test the multi-agent system end-to-end.

**NEVER**:

- Build multi-agent for a problem a single agent can handle
- Create agents with overlapping responsibilities
- Skip the supervisor (autonomous swarms are unpredictable)
- Pass full context between all agents (pass only what's needed)
- Compose without defining handoff protocols
