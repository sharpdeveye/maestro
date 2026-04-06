---
name: fortify
description: "Use when the workflow lacks error handling, has been failing in production, or needs retry logic, fallback strategies, and circuit breakers."
argument-hint: "[target area]"
category: fix
version: 1.1.0
user-invocable: true
---

## MANDATORY PREPARATION

Invoke {{command_prefix}}agent-workflow — it contains workflow principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no workflow context exists yet, you MUST run {{command_prefix}}teach-maestro first.
Consult the guardrails-safety reference in the agent-workflow skill for defense-in-depth patterns and error boundary design.

---

Make the workflow resilient. Every external call will fail eventually — model APIs, tools, databases, third-party services. Fortify ensures the workflow handles failure gracefully.

### Fortification Layers

**Layer 1: Input Validation**

- Validate all inputs before processing
- Return clear error messages for invalid input
- Set size limits on all input fields

**Layer 2: Retry with Backoff**
For transient failures (network errors, rate limits, timeouts):

```yaml
Retry strategy:
  max_retries: 3
  initial_delay: 1s
  backoff_multiplier: 2
  max_delay: 30s
  retryable_errors: [429, 500, 502, 503, 504, TIMEOUT, CONNECTION_ERROR]
  non_retryable_errors: [400, 401, 403, 404]
```

**Layer 3: Fallback Responses**
When retries are exhausted:

- Use a cached previous response (if applicable)
- Use a simpler/cheaper model as fallback
- Return a graceful degradation response
- Escalate to human review

**Layer 4: Circuit Breakers**
When a service is consistently failing:

```yaml
Circuit breaker:
  failure_threshold: 5 consecutive failures
  state: CLOSED → OPEN (after threshold) → HALF_OPEN (after cooldown)
  cooldown: 60 seconds
  half_open_max_requests: 1
```

**Layer 5: Timeout Controls**
Every external call needs a timeout:

- Model API calls: 30-120s depending on task
- Tool executions: 10-60s depending on tool
- Database queries: 5-15s
- Third-party APIs: 10-30s

### Fortification Audit

For each component, verify:

- [ ] Input validation present
- [ ] Retry logic for transient failures
- [ ] Fallback for when retries fail
- [ ] Timeout set
- [ ] Error logged with context
- [ ] User gets a meaningful error (not a stack trace)

### Recommended Next Step

After fortification, run `{{command_prefix}}evaluate` to verify error handling works under realistic failure scenarios.

**NEVER**:

- Retry non-retryable errors (authentication failures, validation errors)
- Retry without backoff (you'll make the problem worse)
- Swallow errors silently (log and handle, don't ignore)
- Set infinite timeouts (they'll hang forever)
- Skip the fallback (retries exhausted with no fallback = user sees an error)
