---
name: calibrate
description: "Align workflow components to project conventions and established standards. Ensure naming consistency, style alignment, and pattern conformity across prompts, tools, and agents. Use when components are inconsistent or a new team member's work needs standardization."
argument-hint: "[target area]"
category: fix
version: 1.0.0
user-invocable: true
---

## MANDATORY PREPARATION
Invoke {{command_prefix}}agent-workflow — it contains workflow principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no workflow context exists yet, you MUST run {{command_prefix}}teach-maestro first.
Consult the prompt-engineering reference in the agent-workflow skill for naming and style consistency patterns.


---

Ensure consistency across all workflow components. Inconsistency creates confusion — for the model, for developers, and for users.

### Calibration Dimensions

**Naming Conventions**
- Tool names follow consistent pattern (verb_noun, noun.verb, or camelCase — pick one)
- Agent names follow consistent pattern
- Configuration keys follow consistent pattern
- File names follow consistent pattern

**Prompt Style**
- All prompts use the same structural pattern (4-zone)
- Consistent delimiter style (XML tags, markdown headers, triple-dash)
- Consistent output schema format (JSON schema, markdown template)
- Consistent instruction style (imperative, numbered steps)

**Error Handling**
- All tools return errors in the same format
- Error codes follow consistent scheme
- Error messages follow consistent tone
- Retry logic uses consistent strategy

**Logging**
- All logs use the same format (JSON structured, text, etc.)
- Consistent field names across all log entries
- Consistent log levels (debug, info, warn, error)
- Consistent PII redaction approach

### Calibration Process

1. **Identify the standard**: What's the most common pattern in the existing codebase? That's the standard.
2. **List deviations**: Find all components that deviate from the standard.
3. **Prioritize**: Fix the most impactful deviations first (user-facing > internal).
4. **Apply**: Make the changes, ensuring tests still pass.
5. **Document**: Update `.maestro.md` with the established conventions.

### Consistency Audit Table

| Dimension | Standard | Deviations Found | Priority |
|-----------|----------|------------------|----------|
| Tool naming | ? | ? of ? tools | High/Med/Low |
| Prompt structure | ? | ? of ? prompts | High/Med/Low |
| Error format | ? | ? of ? tools | High/Med/Low |
| Log format | ? | ? of ? entries | High/Med/Low |

### Calibration Checklist
- [ ] Convention standard identified for each dimension
- [ ] All deviations listed with location
- [ ] Highest impact deviations fixed first
- [ ] Tests pass after each calibration change
- [ ] Updated `.maestro.md` with established conventions

**NEVER**:
- Invent new conventions when existing ones work
- Calibrate in a way that changes behavior (this is standardization, not refactoring)
- Skip test verification after calibration
- Change naming conventions without updating all references
