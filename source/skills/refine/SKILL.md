---
name: refine
description: "Final quality pass on prompts, tool descriptions, error messages, logging, and configuration. The last step before shipping. Use when the workflow works but needs polish, or as the final step in a diagnose → fix → refine cycle."
argument-hint: "[target area]"
category: fix
version: 1.0.0
user-invocable: true
---

## MANDATORY PREPARATION
Invoke {{command_prefix}}agent-workflow — it contains workflow principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no workflow context exists yet, you MUST run {{command_prefix}}teach-maestro first.

---

This is the final quality pass. The workflow works — now make it excellent.

### Refinement Checklist

**Prompts**
- [ ] Every prompt follows the 4-zone pattern (role, context, instructions, output)
- [ ] Output schemas are explicit and validated
- [ ] Negative instructions clarify what NOT to do
- [ ] No contradictory instructions
- [ ] Few-shot examples included for ambiguous tasks
- [ ] Chain-of-thought used for multi-step reasoning tasks

**Tool Descriptions**
- [ ] Every tool has a multi-line description: what, when to use, when NOT to use, returns
- [ ] Input parameters have descriptions and types
- [ ] Error responses are documented
- [ ] At least one example input/output in the description

**Error Messages**
- [ ] Error messages are specific (not "an error occurred")
- [ ] Error messages suggest corrective action
- [ ] Errors include context (what was being attempted)
- [ ] Errors are structured (code + message + details)

**Logging**
- [ ] Every model call is logged (input tokens, output tokens, latency, cost)
- [ ] Tool calls are logged with inputs and outputs
- [ ] Errors are logged with full context
- [ ] PII is redacted from logs
- [ ] Workflow ID traces through all log entries

**Configuration**
- [ ] All magic numbers are named constants
- [ ] Environment-specific values are in config, not code
- [ ] Defaults are sensible — config is for overrides
- [ ] Cost ceilings are set
- [ ] Timeout values are set for all external calls

### Output
For each checklist item that fails, provide:
1. What's wrong (specific finding)
2. Where it is (file, line, or component)
3. How to fix it (concrete suggestion)
4. Priority (critical / important / nice-to-have)

### Priority Matrix

| Priority | Criteria | Action |
|----------|---------|--------|
| Critical | Affects correctness or safety | Fix before shipping |
| Important | Affects quality or maintainability | Fix in current cycle |
| Nice-to-have | Cosmetic or minor inconsistency | Fix when convenient |

**NEVER**:
- Skip the checklist — go through every item
- Mark items as passing without checking
- Suggest changes that alter behavior (this is polish, not redesign)
- Refine before the workflow is functionally correct (fix first, refine last)
