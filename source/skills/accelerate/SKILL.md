---
name: accelerate
description: "Optimize agent workflows for speed, cost, and efficiency. Reduce latency, minimize token usage, implement caching, and choose faster model configurations. Use when the workflow is too slow, too expensive, or both."
argument-hint: "[target metric]"
user-invocable: true
---

## MANDATORY PREPARATION
Invoke {{command_prefix}}agent-workflow — it contains workflow principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no workflow context exists yet, you MUST run {{command_prefix}}teach-maestro first.

---

Make the workflow faster and cheaper without sacrificing quality. Measure before and after.

### Performance Audit

Measure current performance:
```
Current metrics:
  Latency (p50): ___ms
  Latency (p95): ___ms
  Cost per request: $___
  Token usage (avg): ___ input / ___ output
  Error rate: ___%
```

### Acceleration Strategies

**Reduce Token Usage**
- Shorten system prompts (remove redundant instructions)
- Compress few-shot examples to minimum viable length
- Use structured output schemas instead of verbose text
- Summarize context instead of passing raw documents
- Reduce output length requirements

**Model Cascading**
- Route simple tasks to cheaper/faster models
- Escalate only complex tasks to capable models
- Use classification to determine complexity

**Caching**
- Cache responses for identical or near-identical inputs
- Cache tool results with appropriate TTL
- Cache embeddings for frequently-queried documents
- Use semantic caching for similar (not identical) queries

**Parallelization**
- Run independent tool calls in parallel
- Run independent agent steps in parallel
- Use streaming to start processing before full response

**Context Optimization**
- Retrieve less, retrieve better (improve retrieval precision)
- Use context compression techniques
- Implement sliding window for long conversations

### Acceleration Report

For each optimization:
1. **What changed**: Specific modification
2. **Before**: Latency/cost/tokens before
3. **After**: Latency/cost/tokens after
4. **Quality impact**: Any quality change (verify with golden tests)
5. **Trade-off**: What was sacrificed for the improvement

**NEVER**:
- Optimize without measuring first (you need a baseline)
- Sacrifice quality for speed without explicit user approval
- Cache outputs that depend on real-time data
- Skip the quality check after optimization
- Optimize prematurely (make it correct first, then make it fast)
