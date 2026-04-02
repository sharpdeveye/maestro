---
name: adapt-workflow
description: "Adapt agent workflows for different AI providers, deployment environments, model capabilities, or organizational contexts. Use when the user wants to port workflows between providers, deploy to a new environment, or adapt for different team requirements."
argument-hint: "[target context]"
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

**NEVER**:
- Assume prompts work identically across providers
- Copy production config to development without adjusting guardrails
- Adapt without updating the evaluation suite
- Skip cost re-estimation
