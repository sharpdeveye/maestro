---
name: agent-workflow
description: "Comprehensive AI agent workflow design skill. Covers prompt engineering, context management, tool orchestration, agent architecture, feedback loops, knowledge systems, and guardrails. This skill is automatically invoked by all Maestro commands."
user-invocable: false
---

## MANDATORY — Context Gathering Protocol
Before applying any workflow guidance, gather context:

1. **Check for `.maestro.md`** in the project root
   - If it exists → read it and use the workflow context within
   - If it doesn't exist → tell the user: *"No workflow context found. Run {{command_prefix}}teach-maestro to set up project-specific context for better results."*

2. **Minimum viable context** (if no `.maestro.md`):
   - What AI model(s) are being used?
   - What is the workflow's primary task?
   - Are there existing prompts, tools, or agents to work with?
   - What are the quality/speed/cost priorities?

3. **DO NOT** proceed without at least understanding the model, task, and priorities.

---

# Maestro — AI Agent Workflow Mastery

This skill provides the foundational knowledge for designing, building, and maintaining
production-grade AI agent workflows. All Maestro commands build on these principles.

## Core Principles
1. **Structure over improvisation** — Workflows should be deliberate, not emergent
2. **Constraints are features** — Explicit boundaries prevent failure modes
3. **Measure, don't assume** — Every workflow needs evaluation, not just testing
4. **Appropriate complexity** — Match the solution to the problem, not the ambition
5. **Graceful degradation** — Every component should fail safely

---

## 1. Prompt Engineering
**DO**:
- Use structured prompts with clear sections (role, context, instructions, output format)
- Define output schemas explicitly (JSON schema, markdown template, typed response)
- Use few-shot examples for ambiguous tasks
- Chain-of-thought for multi-step reasoning
- Keep system prompts focused — one clear role per prompt

**DON'T**:
- Write wall-of-text prompts with no structure
- Assume the model understands implicit output format
- Use the same prompt for fundamentally different tasks
- Put conflicting instructions in the same prompt
- Rely on the model to "figure it out"

→ *Consult [prompt engineering reference](reference/prompt-engineering.md) for structure, patterns, and output schemas.*

---

## 2. Context Management
**DO**:
- Budget context window usage (system prompt, examples, user input, tool results, output)
- Place critical information at the start AND end of context (attention gradient)
- Use retrieval (RAG) instead of stuffing full documents
- Maintain conversation state explicitly
- Summarize long histories instead of passing raw transcripts

**DON'T**:
- Dump entire codebases, databases, or documents into context
- Ignore context window limits until you hit them
- Assume the model pays equal attention to all context
- Pass irrelevant information "just in case"
- Rely on implicit memory across turns

→ *Consult [context management reference](reference/context-management.md) for window optimization and memory patterns.*

---

## 3. Tool Orchestration
**DO**:
- Give tools clear, specific names and descriptions
- Define input/output schemas for every tool
- Handle tool errors gracefully (the tool WILL fail eventually)
- Keep tool sets focused — 3-7 tools per agent is ideal
- Make tools idempotent where possible

**DON'T**:
- Expose 30+ tools and hope the model picks the right one
- Use vague tool descriptions ("does stuff with data")
- Skip error handling in tool implementations
- Let tools have side effects without confirmation for destructive operations
- Create tools that overlap in functionality

→ *Consult [tool orchestration reference](reference/tool-orchestration.md) for selection heuristics and composition patterns.*

---

## 4. Agent Architecture
**DO**:
- Start with a single agent — add agents only when a single agent demonstrably fails
- Define clear boundaries and responsibilities for each agent
- Use structured handoff protocols between agents
- Implement supervisor patterns for multi-agent systems
- Design for observability — log agent decisions, not just outputs

**DON'T**:
- Build multi-agent systems for problems a single agent handles
- Create agents without clear boundaries (overlapping responsibilities = conflicts)
- Use unstructured communication between agents
- Skip the supervisor — autonomous agent swarms are unpredictable
- Assume agents will coordinate without explicit protocols

→ *Consult [agent architecture reference](reference/agent-architecture.md) for topology patterns and delegation.*

---

## 5. Feedback Loops
**DO**:
- Build evaluation into the workflow from day one
- Create golden test sets with known-good inputs and outputs
- Use automated evaluators for consistent quality scoring
- Track regression — compare new outputs against baselines
- Implement self-correction loops for critical outputs

**DON'T**:
- Ship without evaluation ("it seems to work" is not evaluation)
- Rely solely on human review at scale
- Use the same model to evaluate its own output without structure
- Skip regression testing when changing prompts or models
- Conflate "the model ran without errors" with "the output is correct"

→ *Consult [feedback loops reference](reference/feedback-loops.md) for evaluation patterns and self-correction.*

---

## 6. Knowledge Systems
**DO**:
- Choose retrieval strategy based on query type (semantic, keyword, hybrid)
- Chunk documents thoughtfully (semantic boundaries, not arbitrary token counts)
- Include source attribution in every retrieved result
- Test retrieval quality independently of generation quality
- Version your knowledge base — know what the model has access to

**DON'T**:
- Build RAG without testing retrieval quality first
- Use fixed chunk sizes for all document types
- Skip source attribution (hallucination without attribution is undetectable)
- Index everything without curation (garbage in = garbage out)
- Assume embedding similarity equals relevance

→ *Consult [knowledge systems reference](reference/knowledge-systems.md) for RAG, embeddings, and grounding.*

---

## 7. Guardrails & Safety
**DO**:
- Validate inputs before processing (schema validation, size limits)
- Filter outputs for sensitive content, PII, and policy violations
- Set hard cost ceilings (max tokens, max API calls, max spend per run)
- Implement circuit breakers for cascading failures
- Log everything for audit trails

**DON'T**:
- Deploy without input validation (prompt injection is real)
- Trust model output without verification for high-stakes decisions
- Run without cost controls (one runaway loop can cost thousands)
- Skip rate limiting on external API calls
- Assume the model will follow safety instructions 100% of the time

→ *Consult [guardrails reference](reference/guardrails-safety.md) for validation, sandboxing, and constraints.*

---

## The Workflow Slop Test

If any of these are true, the workflow needs work:

- [ ] Prompts are unstructured walls of text
- [ ] No output schema defined — model decides the format
- [ ] Context window used without budget — everything stuffed in
- [ ] More than 10 tools exposed to a single agent
- [ ] No error handling — happy path only
- [ ] No evaluation — "it seems to work"
- [ ] Multi-agent system for a single-agent problem
- [ ] No cost controls — unbounded token usage
- [ ] Tools have vague one-line descriptions
- [ ] No logging — can't debug production issues

**Zero checked = production-ready. 3+ checked = workflow slop.**

---

## Available Commands

Use these commands to apply specific aspects of workflow mastery:

{{available_commands}}
