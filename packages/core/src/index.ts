/**
 * @maestro/core — Shared utilities for Maestro
 *
 * Context slicing, section parsing, token estimation, decision logging,
 * audit tracking, and cost estimation — used by both the VS Code
 * extension and the MCP server.
 */

export {
  parseMaestroSections,
  matchSections,
  reconstructContent,
  type MaestroSection,
  type SliceCriteria,
} from "./context-utils.js";

export {
  estimateTokens,
  estimateTokensFast,
} from "./token-estimator.js";

export {
  appendDecision,
  readDecisions,
  ensureMaestroDir,
  getDecisionPath,
  type MaestroDecision,
} from "./decisions.js";

export {
  appendAudit,
  readAudit,
  getAuditPath,
  type AuditEntry,
} from "./audit.js";

export {
  estimateCost,
  getKnownModels,
} from "./cost-estimator.js";
