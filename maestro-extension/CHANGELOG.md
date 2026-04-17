# Changelog

All notable changes to the **Maestro — AI Workflow Fluency** extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.1] - 2026-04-17

### Fixed
- **Template resolution** — `{{command_prefix}}` placeholders now correctly resolve to `/` across all output paths: chat participant, CLAUDE.md, .cursorrules, Antigravity rules, and auto-installed SKILL.md files
- **Chat participant** — skill instructions sent as User messages instead of Assistant messages, preventing the LLM from echoing raw instructions instead of acting on them
- **Centralized template engine** — all template resolution now uses a shared `resolveTemplates()` utility in `core/templates.ts`

### Changed
- Updated sidebar screenshot with real IDE capture

## [1.4.0] - 2026-04-16

### Added
- **Quick Pick command palette** — `Maestro: Quick Pick` to search and run any command, with recent commands shown first
- **Command history** — tracks last 10 executed commands in globalState for quick re-access
- **Session indicators** — green/gray dot on each command card showing which commands have been used this session
- **Integration test suite** — Mocha + @vscode/test-electron scaffold with activation, command registration, and toggle tests
- **GitHub Actions CI/CD** — auto-build extension on push, auto-publish MCP server on tag

### Changed
- **Marketplace README** — complete rewrite with install badges, feature sections, screenshots, and ecosystem links
- **CHANGELOG** — added to extension for Marketplace "Changelog" tab

## [1.3.1] - 2026-04-16

### Added
- **Animated Maestro logo** — equalizer-style animation in the sidebar header using Framer Motion
- **Multi-provider skill sync** — 22 bundled skills auto-install into 10 AI provider directories (`.agents/`, `.cursor/`, `.claude/`, `.gemini/`, `.codex/`, `.kiro/`, `.trae/`, `.trae-cn/`, `.opencode/`, `.pi/`) on every activation
- **Antigravity native integration** — uses `antigravity.sendPromptToAgentPanel` for direct slash command injection
- **Chat command test script** — `scripts/test-chat-commands.js` for validating 93 chat-related VS Code commands

### Changed
- **Responsive footer** — replaced tooltip-based descriptions with a fixed-height bottom label that updates on command hover
- **Icon stability** — prevented the hint icon from shrinking when displaying long description text

### Fixed
- Fixed layout flickering caused by dynamic footer height changes

## [1.3.0] - 2026-04-10

### Added
- **Command Center sidebar** — webview panel with all 21 commands organized by category (Analysis, Fix & Improve, Enhancement, Utility)
- **Zero-Defect Mode toggle** — status bar item and sidebar switch for activating precision rules
- **`@maestro` Chat Participant** — use `@maestro /command` directly in VS Code chat
- **`.maestro.md` auto-detection** — status indicator and one-click initialization
- **Editor adapters** — automatic detection and integration for VS Code, Cursor, Antigravity, and Claude Code
- **Skill bundler** — build-time script that compiles 22 skill YAML+markdown files into TypeScript constants

## [1.0.0] - 2026-03-25

### Added
- Initial release with 21 workflow commands
- Core `agent-workflow` skill with 7 domain reference files
- Support for 10 AI coding agent providers
- `.maestro.md` context gathering protocol
