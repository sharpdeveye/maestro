---
name: onboard-agent
description: "Set up new agent configurations, establish project conventions, create initial tool sets, and bootstrap workflow infrastructure. Use when starting a new project, adding a new agent to an existing system, or setting up workflow infrastructure from scratch."
argument-hint: "[project or agent name]"
user-invocable: true
---

## MANDATORY PREPARATION
If this is a new project, run {{command_prefix}}teach-maestro first to establish workflow context. If adding to an existing project, invoke {{command_prefix}}agent-workflow for existing context.

---

Bootstrap a new agent workflow from scratch, or add a new agent to an existing system.

### Step 1: Establish Conventions
```markdown
## Workflow Conventions
### Prompt Format
- Delimiter style: [XML tags / markdown headers / triple-dash]
- Section order: [System → Context → Instructions → Input]
- Output format: [JSON with schema / markdown template]

### Tool Conventions
- Naming: [verb_noun / noun.verb / camelCase]
- Description template: [What → When → When Not → Returns]
- Error format: [{ code, message, details }]

### Logging
- Format: [JSON structured]
- Required fields: [workflow_id, step, timestamp, level]

### File Structure
- Prompts: [prompts/workflow-name/v1.md]
- Tools: [tools/tool-name.{ext}]
- Config: [config/environment.yaml]
- Tests: [tests/workflow-name/]
```

### Step 2: Create Initial Structure
```
project/
├── prompts/          # System prompts, versioned
├── tools/            # Tool definitions
├── config/           # Environment-specific configuration
├── tests/            # Golden test sets and evaluation suites
├── logs/             # Runtime logs (gitignored)
└── .maestro.md       # Workflow context
```

### Step 3: Create the First Agent
1. **System prompt**: Role definition with constraints
2. **2-3 essential tools**: Start with the minimum viable tool set
3. **Output schema**: Define expected output format
4. **One golden test**: At least one test case with known-good output
5. **Basic error handling**: Structured error responses
6. **Logging**: Structured log output for each run

### Step 4: Verify
- Run the agent with the golden test case
- Verify error handling works (send bad input)
- Verify logging captures useful context

**NEVER**:
- Start building without establishing conventions
- Create tools without descriptions
- Skip the golden test case
- Over-scope the initial agent (start minimal, amplify later)
