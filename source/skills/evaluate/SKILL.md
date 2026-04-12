---
name: evaluate
description: "Use when the user wants a quality review, interaction audit, or to test the workflow against realistic scenarios."
argument-hint: "[workflow or scenario]"
category: analysis
version: 1.3.1
user-invocable: true
---

## MANDATORY PREPARATION

Invoke {{command_prefix}}agent-workflow — it contains workflow principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no workflow context exists yet, you MUST run {{command_prefix}}teach-maestro first.
Consult the feedback-loops reference in the agent-workflow skill for evaluation patterns, golden test sets, and regression detection.

---

Evaluate the workflow's actual interaction quality by testing it against scenarios that represent real usage.

### Evaluation Dimensions

**1. Task Completion**

- Does the workflow actually accomplish what it's supposed to?
- Does it handle the complete task or only the happy path?
- Are edge cases addressed or silently dropped?

**2. Output Quality**

- Is the output accurate, complete, and well-formatted?
- Does it match the defined output schema (if any)?
- Would a domain expert approve the output?

**3. Error Behavior**

- What happens when input is malformed?
- What happens when a tool fails?
- What happens when the model is uncertain?
- Is the error message useful or generic?

**4. User Experience**

- Is the interaction natural and intuitive?
- Are confirmations requested for destructive operations?
- Is the response time acceptable?
- Does the workflow communicate its limitations?

**5. Consistency**

- Does the same input produce consistent output quality?
- Are there random failures that aren't reproducible?
- Does quality degrade over long conversations?

### Scenario Testing

Create and run test scenarios:

| Scenario | Input | Expected | Actual | Grade |
|----------|-------|----------|--------|-------|
| Happy path | Normal input | Correct output | ? | A-F |
| Edge case | Unusual input | Graceful handling | ? | A-F |
| Error case | Bad input | Helpful error | ? | A-F |
| Stress case | Large/complex input | Reasonable handling | ? | A-F |
| Adversarial | Tricky/malicious input | Safe response | ? | A-F |

### Evaluation Report

Produce a structured report with:

1. Overall quality grade (A-F)
2. Per-dimension scores with evidence
3. Specific scenario results
4. Priority improvements with recommended Maestro commands

### Evaluation Checklist

- [ ] All 5 dimensions tested with concrete scenarios
- [ ] At least one edge case and one adversarial case tested
- [ ] Results documented in the scenario table
- [ ] Overall grade assigned with justification
- [ ] Improvement actions reference specific Maestro commands

### Recommended Next Step

After evaluation, run `{{command_prefix}}fortify` to address error behavior gaps, `{{command_prefix}}refine` for output quality improvements, or `{{command_prefix}}iterate` to set up continuous quality monitoring.

**NEVER**:

- Evaluate theoretically — run actual scenarios
- Give an A grade unless the workflow handles all scenario types well
- Skip adversarial testing for user-facing workflows
- Evaluate only the happy path
