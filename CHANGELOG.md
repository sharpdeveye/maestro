# Changelog

All notable changes to Maestro will be documented in this file.

## [2.0.0] — 2026-04-26

### ⚡ Breaking

- All packages bumped to v2.0.0 (extension, MCP server, @maestro/core)
- All 25 skills bumped to v2.0.0

### 🆕 Added

#### Memory Layer
- **`/capture`** command — save session summaries to `.maestro/sessions/`
- **`/recap`** command — quick last-session recovery
- **`/reflect`** command — effectiveness scorecard from audit data
- **`decisions.jsonl`** — append-only decision log in `.maestro/`
- **`audit.jsonl`** — command invocation audit trail with duration and cost
- **`.maestro/` directory** — persistent memory that survives sessions

#### Cost Estimation
- Model pricing table for Claude, GPT-4, Gemini, o3, o4-mini (±20% accuracy)
- Automatic cost tracking on every command invocation

#### MCP Tools
- `maestro_write_decision` — append decisions via MCP
- `maestro_read_decisions` — read decision history via MCP
- `maestro_read_audit` — read audit trail via MCP

#### Extension
- Automatic audit + decision emission after every command (wave and single-shot)
- 3 new command palette entries (Capture, Reflect, Recap)
- 3 new chat participant slash commands

### 🔧 Fixed

- **P0: npm publish blocker** — MCP server now uses esbuild; `@maestro/core` bundled inline (no `file:` dependency at runtime)
- **P1: Dead import** — removed invalid `import { v4 as uuidv4 } from 'crypto'` from wave-engine.ts
- **P2: 5.45MB bundle** — replaced `js-tiktoken` (4MB vocab) with character-count heuristic; extension reduced to 124KB (98% smaller)

### 🏗️ Changed

- Context resolution now checks `.maestro/context.md` first, falls back to `.maestro.md` (backward compatible)
- `agent-workflow` skill updated with `.maestro/` directory awareness and decision history protocol
- All READMEs updated (main, extension, MCP server)
- Multi-provider build: 10 providers × 25 skills = 250 skill copies

### 🧪 Testing

- Added vitest to `@maestro/core`
- 37 unit tests: context-utils (11), token-estimator (6), cost-estimator (9), decisions (8), audit (3)
- All tests pass

---

## [1.4.2] — 2026-04-12

### Added
- Wave execution engine for multi-phase commands
- MCP wave tools (start, advance, status)
- Context slicer for token optimization
- Workspace indexer for file dependency tracking

### Changed
- Extension sidebar redesigned with token budget display
- MCP server supports HTTP transport

---

## [1.3.1] — 2026-04-04

### Added
- 21 commands across 4 categories
- `agent-workflow` core skill with 7 domain references
- Multi-provider skill sync (10 providers)
- Zero-defect mode with auto-inject
- `@maestro` chat participant
- `.maestro.md` context protocol
- MCP server with stdio and HTTP transport

---

[2.0.0]: https://github.com/sharpdeveye/maestro/compare/v1.4.2...v2.0.0
[1.4.2]: https://github.com/sharpdeveye/maestro/compare/v1.3.1...v1.4.2
[1.3.1]: https://github.com/sharpdeveye/maestro/releases/tag/v1.3.1
