---
name: adapt-workflow
description: "Use when porting a workflow to a different AI provider, deployment environment, model tier, or organizational context."
argument-hint: "[target context]"
category: utility
version: 1.3.1
user-invocable: true
---

## MANDATORY PREPARATION

Invoke {{command_prefix}}agent-workflow — it contains workflow principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no workflow context exists yet, you MUST run {{command_prefix}}teach-maestro first. Additionally gather: what the workflow is being adapted to.

---

Adapt a working workflow for a different context.

### Adaptation Assessment

| Dimension | Current | Target | Impact |
|-----------|---------|--------|--------|
| Model provider | ? | ? | Prompt format, capabilities, pricing |
| Model tier | ? | ? | Context window, reasoning ability |
| Deployment env | ? | ? | Latency, availability, compliance |
| Team structure | ? | ? | Monitoring, escalation, ownership |
| Data sensitivity | ? | ? | Guardrails, logging, access controls |

### Provider Adaptation

- **Prompt format**: Adjust for provider-specific features
- **Context limits**: Resize context budget for different window sizes
- **Capability gaps**: Identify features available in one provider but not another
- **Pricing model**: Recalculate cost estimates
- **API differences**: Update tool calling interfaces, error handling, retry logic

### Environment Adaptation

- **Latency requirements**: Adjust timeout values, caching strategy
- **Compliance**: Add or adjust guardrails, logging, and data handling
- **Scale**: Adjust concurrency limits, batch sizes
- **Monitoring**: Adapt alerting thresholds

### Adaptation Checklist

- [ ] All provider-specific APIs updated
- [ ] Context budget recalculated for target model
- [ ] Cost estimates updated with target pricing
- [ ] Guardrails adjusted for target compliance requirements
- [ ] Tests updated and passing in target environment
- [ ] Documentation updated for target team

### Recommended Next Step

After adaptation, run `{{command_prefix}}evaluate` to verify the workflow performs correctly in the target environment, then `{{command_prefix}}diagnose` for a full health check.

**NEVER**:

- Assume prompts work identically across providers
- Copy production config to development without adjusting guardrails
- Adapt without updating the evaluation suite
- Skip cost re-estimation
