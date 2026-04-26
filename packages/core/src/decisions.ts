/**
 * Decision log — append-only record of workflow decisions.
 *
 * Each decision is one JSON line in `.maestro/decisions.jsonl`.
 * Used by /reflect and /recap to analyze workflow effectiveness.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

export interface MaestroDecision {
  id: string;
  ts: string;
  command: string;
  phase: string | null;
  outcome: 'completed' | 'partial' | 'failed' | 'cancelled';
  files_changed: string[];
  token_cost: { input: number; output: number };
  duration_ms: number;
  next_step: string | null;
  notes: string;
}

/** Directory name for Maestro v2 data */
const MAESTRO_DIR = '.maestro';
const DECISIONS_FILE = 'decisions.jsonl';
const SESSIONS_DIR = 'sessions';

const GITIGNORE_CONTENT = `# Maestro session data — opt-in to version control
sessions/
decisions.jsonl
audit.jsonl

# Context file IS versioned
!context.md
`;

/**
 * Ensure .maestro/ directory exists with proper structure.
 * Creates .maestro/, .maestro/sessions/, and .maestro/.gitignore.
 */
export function ensureMaestroDir(projectRoot: string): string {
  const maestroDir = path.join(projectRoot, MAESTRO_DIR);

  if (!fs.existsSync(maestroDir)) {
    fs.mkdirSync(maestroDir, { recursive: true });
  }

  const sessionsDir = path.join(maestroDir, SESSIONS_DIR);
  if (!fs.existsSync(sessionsDir)) {
    fs.mkdirSync(sessionsDir, { recursive: true });
  }

  // Write .gitignore if it doesn't exist
  const gitignorePath = path.join(maestroDir, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, GITIGNORE_CONTENT, 'utf-8');
  }

  return maestroDir;
}

/**
 * Get the path to the decisions file.
 */
export function getDecisionPath(projectRoot: string): string {
  return path.join(projectRoot, MAESTRO_DIR, DECISIONS_FILE);
}

/**
 * Generate a short unique ID for a decision.
 */
function generateId(): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `d-${rand}`;
}

/**
 * Append a decision to the log.
 * Creates .maestro/ directory if it doesn't exist.
 *
 * @param projectRoot - Workspace root
 * @param decision - Partial decision (id and ts are auto-filled)
 */
export function appendDecision(
  projectRoot: string,
  decision: Omit<MaestroDecision, 'id' | 'ts'>
): MaestroDecision {
  ensureMaestroDir(projectRoot);

  const full: MaestroDecision = {
    id: generateId(),
    ts: new Date().toISOString(),
    ...decision,
    // Truncate notes to 200 chars
    notes: decision.notes.slice(0, 200),
  };

  const filePath = getDecisionPath(projectRoot);
  const line = JSON.stringify(full) + '\n';
  fs.appendFileSync(filePath, line, 'utf-8');

  return full;
}

/**
 * Read decisions from the log.
 *
 * @param projectRoot - Workspace root
 * @param limit - Max entries to return (from most recent)
 */
export function readDecisions(
  projectRoot: string,
  limit: number = 50
): MaestroDecision[] {
  const filePath = getDecisionPath(projectRoot);

  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);

    // Parse from end (most recent first)
    const decisions: MaestroDecision[] = [];
    const start = Math.max(0, lines.length - limit);
    for (let i = lines.length - 1; i >= start; i--) {
      try {
        decisions.push(JSON.parse(lines[i]));
      } catch {
        // Skip malformed lines
      }
    }

    return decisions;
  } catch {
    return [];
  }
}
