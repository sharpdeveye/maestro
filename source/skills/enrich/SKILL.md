---
name: enrich
description: "Add knowledge sources, retrieval pipelines (RAG), grounding data, and external context to agent workflows. Use when the agent needs access to information beyond its training data."
argument-hint: "[knowledge domain or source]"
category: enhancement
version: 1.0.0
user-invocable: true
---

## MANDATORY PREPARATION
Invoke {{command_prefix}}agent-workflow — it contains workflow principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no workflow context exists yet, you MUST run {{command_prefix}}teach-maestro first.

---

Add knowledge sources to ground the workflow in facts. Without grounding, agents hallucinate. With grounding, they cite sources.

### Knowledge Source Assessment

Identify what knowledge the workflow needs:

| Knowledge Type | Source | Update Frequency | Access Pattern |
|---------------|--------|-----------------|----------------|
| Domain docs | Internal docs, specs | Monthly | Semantic search |
| Code context | Codebase | Real-time | Code search |
| User data | Database, CRM | Real-time | Structured query |
| External data | APIs, web | Real-time | API call |
| Historical | Logs, past interactions | Daily | Time-range query |

### Add RAG Pipeline
For document-based knowledge (consult the knowledge-systems reference in the agent-workflow skill):

1. **Select documents**: Identify the authoritative source documents
2. **Chunk strategy**: Choose chunking based on document type (semantic > token-based)
3. **Embed**: Use appropriate embedding model for the domain
4. **Index**: Store in vector database with metadata
5. **Retrieve**: Implement hybrid search (semantic + keyword)
6. **Inject**: Add retrieved context to the prompt with source attribution

### Add Structured Data
For database-backed knowledge:

1. **Define the query interface**: Natural language → structured query
2. **Add guardrails**: Read-only access, query complexity limits
3. **Format results**: Transform raw data into context the model can use
4. **Attribute**: Include data source and freshness in the context

### Add Real-Time Data
For live information:

1. **Identify APIs**: What external services provide the needed data
2. **Cache strategy**: How often does the data change? Cache accordingly
3. **Fallback**: What happens when the API is down?
4. **Attribution**: Include data timestamp and source

### Enrichment Checklist
- [ ] Every knowledge source has attribution (source, date, confidence)
- [ ] Retrieval quality tested independently of generation quality
- [ ] Chunk sizes tested and optimized for the document types
- [ ] Fallbacks exist for all external knowledge sources
- [ ] Knowledge base has a refresh/update strategy
- [ ] PII is handled appropriately in knowledge sources

**NEVER**:
- Index everything without curation (garbage in = garbage out)
- Skip source attribution (hallucination without attribution is undetectable)
- Build RAG without testing retrieval quality first
- Use fixed chunk sizes for all document types
- Assume embedding similarity equals relevance
