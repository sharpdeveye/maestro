---
name: iterate
description: "Set up feedback loops, evaluation cycles, and self-correction mechanisms. Build workflows that improve themselves through structured evaluation and refinement. Use when the workflow needs to self-correct or improve over time."
argument-hint: "[target area]"
category: enhancement
version: 1.0.0
user-invocable: true
---

## MANDATORY PREPARATION
Invoke {{command_prefix}}agent-workflow — it contains workflow principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no workflow context exists yet, you MUST run {{command_prefix}}teach-maestro first.

Consult the feedback-loops reference in the agent-workflow skill for evaluation patterns and self-correction strategies.

---

Set up feedback loops that make workflows self-correcting and continuously improving. Iteration transforms one-shot gambles into convergent, reliable systems.

### Feedback Loop Design

### Step 1: Define Quality Criteria
What does "good output" look like? Score dimensions:

| Dimension | Weight | Threshold | Measurement |
|-----------|--------|-----------|-------------|
| Accuracy | 0.4 | ≥ 0.8 | Factual correctness check |
| Completeness | 0.3 | ≥ 0.7 | Required fields present |
| Format | 0.2 | ≥ 0.9 | Schema compliance |
| Tone | 0.1 | ≥ 0.6 | Appropriate for audience |

### Step 2: Choose Evaluator Type
Match evaluator to requirements:

- **Rule-based**: Schema validation, field presence, value ranges (fast, free)
- **Self-check**: Same model evaluates own output (fast, cheap, less reliable)
- **Cross-model**: Different model evaluates (slower, more reliable)
- **Human-in-the-loop**: Human review (slowest, most reliable, doesn't scale)
- **Hybrid**: Rules first, then model check for what rules can't catch

### Step 3: Design the Correction Loop

```
generate(input) → evaluate(output) → score
  if score ≥ threshold → return output
  if score < threshold AND attempts < max →
    enrich input with evaluator feedback
    generate again (with feedback)
  if attempts ≥ max → fallback or escalate
```

**Critical**: The retry input MUST be different from the original. Include:
- The evaluator's specific feedback
- What was wrong and why
- A suggestion for how to fix it

### Step 4: Set Up Regression Detection

When changing prompts, models, or tools:
1. Run golden test set with OLD config → baseline scores
2. Run golden test set with NEW config → new scores
3. Compare: improvement ≥ 5% → accept; regression ≥ 5% → reject

### Step 5: Continuous Monitoring

For production workflows:
- Sample 1-5% of outputs for automated evaluation
- Track quality scores over time
- Alert on downward trends
- A/B test changes before full rollout

### Iteration Checklist
- [ ] Quality criteria defined with weights and thresholds
- [ ] Evaluator selected and configured
- [ ] Correction loop has max attempts limit
- [ ] Feedback is injected into retries (not identical retry)
- [ ] Golden test set exists with ≥ 10 cases
- [ ] Regression detection configured for changes
- [ ] Production monitoring in place

**NEVER**:
- Retry with the exact same input (definition of insanity)
- Use the same weak model to both generate and evaluate
- Skip the max attempts limit (infinite loops are real)
- Deploy changes without regression testing against golden set
- Monitor only errors — track quality scores over time
