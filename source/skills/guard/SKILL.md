---
name: guard
description: "Add safety constraints, input validation, output filtering, prompt injection defense, cost ceilings, and security boundaries to agent workflows. Use when deploying to production or handling sensitive data."
argument-hint: "[threat or area]"
category: enhancement
version: 1.1.0
user-invocable: true
---

## MANDATORY PREPARATION
Invoke {{command_prefix}}agent-workflow — it contains workflow principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no workflow context exists yet, you MUST run {{command_prefix}}teach-maestro first.

Consult the guardrails-safety reference in the agent-workflow skill for the full defense-in-depth framework.

---

Add safety boundaries to a workflow. Guards protect against malicious inputs, unintended outputs, data leakage, cost explosion, and all the ways an autonomous system can go wrong in the real world.

### Threat Assessment
Before adding guards, understand what you're protecting against:

| Threat | Risk Level | Guard Type |
|--------|-----------|-----------|
| Prompt injection | High | Input sanitization, instruction hierarchy |
| PII leakage | High | Output filtering, data masking |
| Cost explosion | High | Token budgets, rate limits |
| Unauthorized actions | Medium | Permission scoping, confirmation gates |
| Hallucination | Medium | Source attribution, fact checking |
| Service abuse | Medium | Rate limiting, authentication |

### Guard Implementation

**Input Guards**
```
Before processing any input:
1. Validate against schema (reject malformed)
2. Check size limits (reject oversized)
3. Sanitize for injection patterns
4. Rate limit check (reject if exceeded)
5. Authentication/authorization check
```

**Output Guards**
```
Before returning any output:
1. Schema validation (format correct?)
2. PII scan (names, emails, SSNs, etc.)
3. Content policy check
4. Confidence threshold check
5. Source attribution present?
```

**Cost Guards**
```
Before every model/API call:
1. Check remaining budget
2. Estimate request cost
3. If estimate > remaining budget → reject or use cheaper alternative
4. After call → update spent amount
5. Circuit breaker check (too many failures?)
```

**Permission Guards**
```
For every tool call:
1. Is this tool allowed for this user/context?
2. Is this a destructive operation? → require confirmation
3. Is this accessing data the user is authorized for?
4. Log the access for audit trail
```

### Guard Checklist
- [ ] All inputs validated before processing
- [ ] PII detection on all outputs
- [ ] Cost ceiling set with enforcement
- [ ] Prompt injection defenses active
- [ ] Destructive operations require confirmation
- [ ] All access logged for audit
- [ ] Circuit breakers on external services
- [ ] Rate limits on all endpoints

### Recommended Next Step
After adding guards, run `{{command_prefix}}evaluate` with adversarial test scenarios to verify guards hold under attack.

**NEVER**:
- Deploy without input validation
- Trust model output for high-stakes decisions without verification
- Run without cost controls
- Skip logging (you need the audit trail)
- Assume the model will follow safety instructions 100% of the time
