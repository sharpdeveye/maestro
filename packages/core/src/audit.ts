/**
 * Audit log — append-only record of every command invocation.
 *
 * Each entry is one JSON line in `.maestro/audit.jsonl`.
 * Used by /reflect to compute effectiveness metrics.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { ensureMaestroDir } from './decisions.js';

export interface AuditEntry {
  id: string;
  ts: string;
  command: string;
  duration_ms: number;
  exit_status: 'completed' | 'partial' | 'failed' | 'cancelled';
  phases_completed: number;
  phases_total: number;
  token_usage: { input: number; output: number };
  cost_estimate_usd: number | null;
  context_tokens_saved: number;
  next_step_surfaced: string | null;
}

const MAESTRO_DIR = '.maestro';
const AUDIT_FILE = 'audit.jsonl';

/**
 * Get the path to the audit file.
 */
export function getAuditPath(projectRoot: string): string {
  return path.join(projectRoot, MAESTRO_DIR, AUDIT_FILE);
}

/**
 * Generate a short unique ID for an audit entry.
 */
function generateId(): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `a-${rand}`;
}

/**
 * Append an audit entry.
 * Creates .maestro/ directory if needed.
 */
export function appendAudit(
  projectRoot: string,
  entry: Omit<AuditEntry, 'id' | 'ts'>
): AuditEntry {
  ensureMaestroDir(projectRoot);

  const full: AuditEntry = {
    id: generateId(),
    ts: new Date().toISOString(),
    ...entry,
  };

  const filePath = getAuditPath(projectRoot);
  const line = JSON.stringify(full) + '\n';
  fs.appendFileSync(filePath, line, 'utf-8');

  return full;
}

/**
 * Read audit entries.
 *
 * @param projectRoot - Workspace root
 * @param limit - Max entries to return (most recent first)
 */
export function readAudit(
  projectRoot: string,
  limit: number = 50
): AuditEntry[] {
  const filePath = getAuditPath(projectRoot);

  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);

    const entries: AuditEntry[] = [];
    const start = Math.max(0, lines.length - limit);
    for (let i = lines.length - 1; i >= start; i--) {
      try {
        entries.push(JSON.parse(lines[i]));
      } catch {
        // Skip malformed lines
      }
    }

    return entries;
  } catch {
    return [];
  }
}
