## Agent Topology Patterns

### Pattern 1: Single Agent (Start Here)

```text
User → Agent → Output
```

Use for: Most tasks. Seriously — most tasks don't need multiple agents.
When to upgrade: When a single agent demonstrably can't handle the task due to conflicting roles, context limits, or tool count explosion.

### Pattern 2: Router + Specialists

```text
User → Router Agent → [Specialist A | Specialist B | Specialist C] → Output
```

Use for: Tasks with clearly distinct categories (e.g., "code question" vs. "documentation question" vs. "deployment question").
Key design: Router must have clear routing criteria. If routing is ambiguous, the pattern breaks.

### Pattern 3: Pipeline (Sequential)

```text
User → Agent A → Agent B → Agent C → Output
```

Use for: Multi-step processes where each step transforms the input (e.g., extract → analyze → summarize).
Key design: Define the data contract between each step. Agent B should not need to know how Agent A works.

### Pattern 4: Supervisor + Workers

```text
User → Supervisor → [Worker A, Worker B, Worker C] → Supervisor → Output
```

Use for: Complex tasks that can be parallelized (e.g., research multiple topics simultaneously).
Key design: Supervisor must be able to evaluate worker output and retry/redirect if quality is insufficient.

### Pattern 5: Evaluator Loop

```text
User → Generator Agent → Evaluator Agent → (if quality < threshold) → Generator Agent (retry) → Output
```

Use for: Tasks where output quality is critical and evaluatable (e.g., code generation, content creation).
Key design: Evaluator must have clear quality criteria. Max retry count is mandatory.

### Pattern 6: Hierarchical

```text
User → Orchestrator → [Manager A → [Worker A1, A2], Manager B → [Worker B1, B2]] → Output
```

Use for: Large-scale systems with distinct domains and sub-tasks.
Key design: Each level should have clear authority boundaries. Over-design risk is highest here.

## Handoff Protocols

When agents communicate, define the handoff explicitly:

```text
Handoff contract:
  From: [Agent A name and role]
  To: [Agent B name and role]
  Payload:
    - task_description: string (what Agent B should do)
    - context: object (relevant information from Agent A's work)
    - constraints: object (time limits, quality requirements, scope boundaries)
    - expected_output: schema (what Agent A expects back)
  Failure protocol:
    - On timeout: [retry | escalate | use default]
    - On quality failure: [retry with feedback | escalate | fail gracefully]
```

## Cost & Latency Control

Multi-agent systems multiply costs and latency:

| Metric | Single Agent | 3-Agent Pipeline | 5-Agent System |
|--------|-------------|-----------------|----------------|
| Latency | 1x | 3x (sequential) | 3-5x |
| Cost | 1x | 2-4x (context duplication) | 5-10x |
| Failure rate | p | 1-(1-p)³ | 1-(1-p)⁵ |
| Debug difficulty | Low | Medium | High |

**Rule of thumb**: Every additional agent should provide value that exceeds its cost in latency, money, and complexity. If you can't articulate the specific value, don't add the agent.

## Anti-Patterns

- **The committee**: 5 agents debating when 1 agent with a good prompt would suffice. Start with one.
- **The game of telephone**: Long chains where context degrades with each handoff. Keep chains short.
- **The autonomous swarm**: Agents that talk to each other without supervision. Always have a supervisor.
- **The premature multi-agent**: Building a multi-agent system before proving a single agent can't do it.
- **The full-context handoff**: Passing the entire context to every agent. Pass only what's needed.
