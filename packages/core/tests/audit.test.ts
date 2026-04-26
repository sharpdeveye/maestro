import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { appendAudit, readAudit, getAuditPath } from '../src/audit';
import { ensureMaestroDir } from '../src/decisions';

describe('audit', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'maestro-audit-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('appendAudit', () => {
    it('creates audit.jsonl and appends entry', () => {
      const entry = appendAudit(tmpDir, {
        command: 'diagnose',
        duration_ms: 8200,
        exit_status: 'completed',
        phases_completed: 3,
        phases_total: 3,
        token_usage: { input: 4200, output: 2100 },
        cost_estimate_usd: 0.019,
        context_tokens_saved: 1840,
        next_step_surfaced: 'fortify',
      });

      expect(entry.id).toMatch(/^a-/);
      expect(entry.ts).toBeTruthy();

      const filePath = getAuditPath(tmpDir);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  describe('readAudit', () => {
    it('returns empty array when no file', () => {
      expect(readAudit(tmpDir)).toEqual([]);
    });

    it('reads entries most recent first', () => {
      appendAudit(tmpDir, {
        command: 'first',
        duration_ms: 100,
        exit_status: 'completed',
        phases_completed: 1,
        phases_total: 1,
        token_usage: { input: 100, output: 50 },
        cost_estimate_usd: null,
        context_tokens_saved: 0,
        next_step_surfaced: null,
      });
      appendAudit(tmpDir, {
        command: 'second',
        duration_ms: 200,
        exit_status: 'completed',
        phases_completed: 1,
        phases_total: 1,
        token_usage: { input: 200, output: 100 },
        cost_estimate_usd: null,
        context_tokens_saved: 0,
        next_step_surfaced: null,
      });

      const entries = readAudit(tmpDir);
      expect(entries[0].command).toBe('second');
    });
  });
});
