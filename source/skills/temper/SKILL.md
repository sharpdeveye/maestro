---
name: temper
description: "Use when the workflow feels over-engineered, has premature optimizations, unnecessary abstraction layers, or complexity beyond actual requirements."
argument-hint: "[target]"
category: enhancement
version: 1.1.0
user-invocable: true
---

## MANDATORY PREPARATION
Invoke {{command_prefix}}agent-workflow — it contains workflow principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no workflow context exists yet, you MUST run {{command_prefix}}teach-maestro first.
Consult the agent-architecture reference in the agent-workflow skill for topology patterns and when multi-agent is justified.


---

Pull back from over-engineering. The most common mistake isn't building too little — it's building too much.

### Over-Engineering Detection

**Signs you've over-engineered:**
- Multi-agent for a single-agent problem
- Premature optimization before you have performance data
- Abstraction layers with one implementation
- Configuration for things that never change
- Evaluation loops on non-critical outputs
- Framework before features

### The Complexity Test
For each component:
1. **Is this solving a problem we actually have?** (not "might have")
2. **Is this the simplest solution that works?**
3. **Would removing this break anything?** (if not, remove it)
4. **Can someone new understand this in 5 minutes?** (if not, simplify)

### Tempering Strategies

**Collapse Unnecessary Agents**
```
OVER-ENGINEERED: User → Classifier → Router → Specialist → Formatter → Checker (6 components)
TEMPERED: User → Single Agent with good prompt (1 component, same quality)
```

**Remove Premature Abstraction**
```
OVER-ENGINEERED: class AgentOrchestrator with 5 strategy interfaces
TEMPERED: async function runWorkflow(input) — direct, readable
```

**Simplify Configuration**
```
OVER-ENGINEERED: config.yaml (200 lines, 47 params, 3 inheritance levels)
TEMPERED: config.yaml (20 lines, essential params only, sensible defaults)
```

### What NOT to Temper
- Error handling — essential, not overhead
- Logging — saves you when things go wrong
- Input validation — prevents cascading failures
- Core guardrails — safety is non-negotiable
- The golden test set — how you know it still works

### Recommended Next Step
After tempering, run `{{command_prefix}}evaluate` to confirm quality is preserved, or `{{command_prefix}}diagnose` for a full health check.

**NEVER**:
- Temper without measuring output quality before and after
- Remove error handling in the name of simplicity
- Simplify below the level of correctness
- Remove features users actively rely on
