import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  appendDecision,
  readDecisions,
  ensureMaestroDir,
  getDecisionPath,
} from '../src/decisions';

describe('decisions', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'maestro-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('ensureMaestroDir', () => {
    it('creates .maestro/ with sessions/ and .gitignore', () => {
      ensureMaestroDir(tmpDir);

      expect(fs.existsSync(path.join(tmpDir, '.maestro'))).toBe(true);
      expect(fs.existsSync(path.join(tmpDir, '.maestro', 'sessions'))).toBe(true);
      expect(fs.existsSync(path.join(tmpDir, '.maestro', '.gitignore'))).toBe(true);
    });

    it('does not overwrite existing .gitignore', () => {
      ensureMaestroDir(tmpDir);
      const gitignorePath = path.join(tmpDir, '.maestro', '.gitignore');
      fs.writeFileSync(gitignorePath, 'custom content', 'utf-8');

      ensureMaestroDir(tmpDir);
      expect(fs.readFileSync(gitignorePath, 'utf-8')).toBe('custom content');
    });
  });

  describe('appendDecision', () => {
    it('creates file and appends a decision', () => {
      const decision = appendDecision(tmpDir, {
        command: 'fortify',
        phase: 'apply',
        outcome: 'completed',
        files_changed: ['src/handler.ts'],
        token_cost: { input: 1000, output: 500 },
        duration_ms: 5000,
        next_step: 'evaluate',
        notes: 'Added retry logic',
      });

      expect(decision.id).toMatch(/^d-/);
      expect(decision.ts).toBeTruthy();
      expect(decision.command).toBe('fortify');

      const filePath = getDecisionPath(tmpDir);
      expect(fs.existsSync(filePath)).toBe(true);

      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content.trim());
      expect(parsed.command).toBe('fortify');
    });

    it('truncates notes to 200 chars', () => {
      const longNotes = 'a'.repeat(300);
      const decision = appendDecision(tmpDir, {
        command: 'test',
        phase: null,
        outcome: 'completed',
        files_changed: [],
        token_cost: { input: 0, output: 0 },
        duration_ms: 0,
        next_step: null,
        notes: longNotes,
      });

      expect(decision.notes.length).toBe(200);
    });

    it('appends multiple decisions', () => {
      for (let i = 0; i < 3; i++) {
        appendDecision(tmpDir, {
          command: `cmd-${i}`,
          phase: null,
          outcome: 'completed',
          files_changed: [],
          token_cost: { input: 0, output: 0 },
          duration_ms: 0,
          next_step: null,
          notes: `Decision ${i}`,
        });
      }

      const decisions = readDecisions(tmpDir);
      expect(decisions).toHaveLength(3);
    });
  });

  describe('readDecisions', () => {
    it('returns empty array when no file exists', () => {
      expect(readDecisions(tmpDir)).toEqual([]);
    });

    it('returns most recent first', () => {
      appendDecision(tmpDir, {
        command: 'first',
        phase: null,
        outcome: 'completed',
        files_changed: [],
        token_cost: { input: 0, output: 0 },
        duration_ms: 0,
        next_step: null,
        notes: 'First',
      });
      appendDecision(tmpDir, {
        command: 'second',
        phase: null,
        outcome: 'completed',
        files_changed: [],
        token_cost: { input: 0, output: 0 },
        duration_ms: 0,
        next_step: null,
        notes: 'Second',
      });

      const decisions = readDecisions(tmpDir);
      expect(decisions[0].command).toBe('second');
      expect(decisions[1].command).toBe('first');
    });

    it('respects limit parameter', () => {
      for (let i = 0; i < 10; i++) {
        appendDecision(tmpDir, {
          command: `cmd-${i}`,
          phase: null,
          outcome: 'completed',
          files_changed: [],
          token_cost: { input: 0, output: 0 },
          duration_ms: 0,
          next_step: null,
          notes: `Decision ${i}`,
        });
      }

      const limited = readDecisions(tmpDir, 3);
      expect(limited).toHaveLength(3);
    });
  });
});
