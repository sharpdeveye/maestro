# Changelog

All notable changes to Maestro are documented here.

## [1.3.1] — 2026-04-12

### Added

- **`/zero-defect` command** — Model-agnostic precision protocol that activates maximum execution discipline for critical tasks. Includes 8 precision rules, a pre-commit verification gate, and an anti-pattern correction table. Works with any AI model (Claude, Gemini, GPT, Codex, etc.).

### Changed

- Command count: 20 → 21 commands
- Skill count: 21 → 22 skills (including core `agent-workflow`)
- All versions synced to 1.3.1

### Updated

- `README.md` — badges, commands table, project structure tree
- `mcp-server/README.md` — tool descriptions, prompt list
- `mcp-server/src/tools.ts` — list_commands description
- `mcp-server/src/prompts.ts` — auto-registers new command
- `mcp-server/package.json` — npm package description
- `package.json` — project description

---

## [1.2.0] — 2026-04-08

### Added

- MCP server (`maestro-workflow-mcp`) — use Maestro as a live MCP server
- npm package published to registry
- MCP badges in README

### Fixed

- Template variable resolution in MCP context
- Bin path normalization in mcp-server package

---

## [1.1.0] — 2026-04-06

### Added

- Initial release with 1 core skill, 20 commands, 7 domain references
- Multi-provider build pipeline (10 providers)
- Validation script
- Anti-pattern guidance ("Workflow Slop" test)
