## RAG — Retrieval-Augmented Generation

### The RAG Stack

```
┌─────────────────────────────────────┐
│ 1. INGEST    — Documents → Chunks   │
│ 2. EMBED     — Chunks → Vectors     │
│ 3. INDEX     — Vectors → Database   │
│ 4. RETRIEVE  — Query → Top K        │
│ 5. GENERATE  — Context → Response   │
└─────────────────────────────────────┘
```

### Chunking Strategies

| Strategy | Best For | Chunk Size |
|----------|----------|-----------|
| Fixed token | Uniform documents | 256-512 tokens |
| Semantic (paragraph/section) | Structured docs | Variable |
| Sliding window + overlap | Long documents | 512 tokens, 50 overlap |
| Recursive character | Code | Language-specific |
| Document-aware | PDFs, HTML | By structural element |

**Rules**:
- Chunks should be self-contained (meaningful without surrounding context)
- Include metadata with every chunk (source, page, section, date)
- Test chunk quality before building the full pipeline
- Smaller chunks = more precise retrieval but less context per result

### Embedding Models

Choose based on your documents:

| Model Type | Strengths | Weaknesses |
|-----------|-----------|-----------|
| General-purpose (e.g., text-embedding-3) | Good default, multilingual | May miss domain jargon |
| Domain-specific (e.g., code embeddings) | Excellent for domain | Poor outside domain |
| Instruction-tuned | Follows query intent | Slower, more expensive |

### Retrieval Strategies

**Semantic search**: Query embedding → nearest neighbors
- Best for: natural language questions
- Weakness: misses exact keyword matches

**Keyword search**: BM25, TF-IDF
- Best for: exact term matches, technical queries
- Weakness: misses semantic similarity

**Hybrid** (recommended): Semantic + keyword with score fusion
- Best for: most production systems
- Implementation: Run both, normalize scores, weighted combination

### Source Attribution

Every retrieved passage MUST include:
```json
{
  "content": "The retrieved text...",
  "source": {
    "file": "architecture-guide.md",
    "section": "Authentication",
    "page": 12,
    "last_updated": "2025-01-15"
  },
  "relevance_score": 0.87
}
```

Why attribution matters:
- Users can verify the information
- You can detect when the model adds unsupported claims
- Stale sources can be identified and updated
- Debugging retrieval failures requires knowing what was retrieved

### Knowledge Base Maintenance

- **Version your index**: Know exactly what documents are indexed
- **Set refresh schedules**: Stale knowledge = wrong answers
- **Monitor retrieval quality**: Track relevance scores over time
- **Curate, don't dump**: Indexing everything reduces signal-to-noise
- **Deduplication**: Same content from different sources confuses retrieval

### Anti-Patterns

- **The blind index**: Indexing everything without reviewing what's in there.
- **The stale knowledge base**: Documents from 2 years ago answering questions about today.
- **The missing citation**: Model says "according to the documentation" with no source link.
- **The embedding assumption**: Assuming high embedding similarity = relevance. Test this.
- **The chunk salad**: Fixed 100-token chunks that split sentences mid-thought.
