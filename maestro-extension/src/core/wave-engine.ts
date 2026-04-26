import * as vscode from 'vscode';
import type { SlicedContext } from './context-slicer';

// ─── Types ──────────────────────────────────────────────────────────

export type WavePhase = 'map' | 'validate' | 'scaffold' | 'test' | 'audit' | 'apply' | 'verify' | 'report';
export type WaveStatus = 'pending' | 'running' | 'passed' | 'failed' | 'cancelled';

export interface PhaseResult {
  phase: WavePhase;
  output: string;
  validationResult: ValidationResult | null;
  completedAt: number;
}

export interface ValidationResult {
  passed: boolean;
  issues: string[];
  suggestions: string[];
}

export interface WaveState {
  /** Unique wave identifier */
  id: string;
  /** Originating skill name */
  command: string;
  /** Ordered phases for this wave */
  phases: WavePhase[];
  /** Current active phase */
  currentPhase: WavePhase;
  /** Index of current phase in phases array */
  currentPhaseIndex: number;
  /** Results for completed phases */
  phaseResults: Map<WavePhase, PhaseResult>;
  /** Overall wave status */
  status: WaveStatus;
  /** Wave start timestamp */
  startedAt: number;
  /** Context snapshot for this wave */
  context: SlicedContext;
}

// ─── Phase Mapping ──────────────────────────────────────────────────

/**
 * Maps command categories to their wave phase sequences.
 * Commands not listed here run as single-phase (no wave).
 */
const WAVE_PHASES: Record<string, WavePhase[]> = {
  // Build commands — full 4-phase wave
  compose: ['map', 'validate', 'scaffold', 'test'],
  chain: ['map', 'validate', 'scaffold', 'test'],

  // Fix commands — audit-first approach
  fortify: ['audit', 'validate', 'apply', 'verify'],
  refine: ['audit', 'validate', 'apply', 'verify'],

  // Analysis commands — map then report
  diagnose: ['map', 'validate', 'report'],
  evaluate: ['map', 'validate', 'report'],
};

/**
 * Check if a command supports wave execution.
 */
export function supportsWave(command: string): boolean {
  return command in WAVE_PHASES;
}

/**
 * Get the phase sequence for a command.
 */
export function getPhases(command: string): WavePhase[] {
  return WAVE_PHASES[command] || [];
}

// ─── Validation ─────────────────────────────────────────────────────

/**
 * Validate phase output based on the phase type.
 * Returns issues and suggestions for the next phase to incorporate.
 */
function validatePhaseOutput(
  phase: WavePhase,
  output: string,
  maestroContext: string
): ValidationResult {
  const issues: string[] = [];
  const suggestions: string[] = [];

  switch (phase) {
    case 'map':
      // Map phase should produce structured output
      if (!output.includes('#') && !output.match(/^\d+\./m)) {
        issues.push('Map output lacks structure — expected headers or numbered steps');
      }
      if (output.length < 100) {
        issues.push('Map output is suspiciously short — may be incomplete');
      }
      break;

    case 'audit':
      // Audit should identify specific issues
      if (!output.match(/issue|problem|finding|error|warning|concern/i)) {
        suggestions.push('Audit did not identify explicit issues — verify completeness');
      }
      break;

    case 'scaffold':
    case 'apply':
      // Code phases — check for banned patterns from .maestro.md
      if (maestroContext) {
        const bannedPatterns = extractBannedPatterns(maestroContext);
        for (const pattern of bannedPatterns) {
          if (output.toLowerCase().includes(pattern.toLowerCase())) {
            issues.push(`Code contains pattern banned by .maestro.md: "${pattern}"`);
          }
        }
      }
      // Check for code blocks
      if (!output.includes('```')) {
        suggestions.push('Phase output contains no code blocks — expected implementation code');
      }
      break;

    case 'validate':
      // Validate should produce a clear pass/fail assessment
      if (!output.match(/pass|fail|approved|rejected|✅|❌|valid|invalid/i)) {
        suggestions.push('Validation output lacks clear pass/fail determination');
      }
      break;

    case 'test':
    case 'verify':
      // Test phase should include test code or verification steps
      if (!output.match(/test|expect|assert|verify|check|describe|it\(/i)) {
        suggestions.push('Test output lacks test assertions or verification steps');
      }
      break;

    case 'report':
      // Reports should be structured
      if (output.length < 200) {
        suggestions.push('Report output is brief — may need more detail');
      }
      break;
  }

  return {
    passed: issues.length === 0,
    issues,
    suggestions,
  };
}

/**
 * Extract banned patterns from .maestro.md context.
 * Looks for sections like "## Banned Patterns" or "## Do Not Use".
 */
function extractBannedPatterns(context: string): string[] {
  const patterns: string[] = [];
  const lines = context.split('\n');
  let inBannedSection = false;

  for (const line of lines) {
    if (line.match(/^##?\s+(banned|forbidden|do not use|avoid|deprecated|never use)/i)) {
      inBannedSection = true;
      continue;
    }
    if (inBannedSection && line.match(/^##?\s+/)) {
      inBannedSection = false;
      continue;
    }
    if (inBannedSection && line.startsWith('- ')) {
      const pattern = line.replace(/^-\s+/, '').replace(/`/g, '').trim();
      if (pattern.length > 2) {
        patterns.push(pattern);
      }
    }
  }

  return patterns;
}

// ─── Wave Engine ────────────────────────────────────────────────────

/**
 * State machine that manages multi-phase command execution.
 *
 * Breaks complex commands into automated, validated "waves" —
 * each phase produces output that is validated before advancing.
 */
export class WaveEngine implements vscode.Disposable {
  private activeWaves = new Map<string, WaveState>();

  private readonly _onPhaseChange = new vscode.EventEmitter<WaveState>();
  readonly onDidPhaseChange = this._onPhaseChange.event;

  /**
   * Start a new wave execution for a command.
   */
  startWave(command: string, context: SlicedContext): WaveState {
    const phases = getPhases(command);
    if (phases.length === 0) {
      throw new Error(`Command "${command}" does not support wave execution`);
    }

    const id = generateId();
    const wave: WaveState = {
      id,
      command,
      phases,
      currentPhase: phases[0],
      currentPhaseIndex: 0,
      phaseResults: new Map(),
      status: 'running',
      startedAt: Date.now(),
      context,
    };

    this.activeWaves.set(id, wave);
    this._onPhaseChange.fire(wave);
    return wave;
  }

  /**
   * Advance a wave by submitting the current phase's output.
   * Validates the output and moves to the next phase.
   *
   * Returns the updated wave state.
   */
  advanceWave(waveId: string, phaseOutput: string): WaveState {
    const wave = this.activeWaves.get(waveId);
    if (!wave) {
      throw new Error(`Wave "${waveId}" not found`);
    }
    if (wave.status !== 'running') {
      throw new Error(`Wave "${waveId}" is not running (status: ${wave.status})`);
    }

    // Validate the phase output
    const validation = validatePhaseOutput(
      wave.currentPhase,
      phaseOutput,
      wave.context.maestroSlice
    );

    // Record the phase result
    wave.phaseResults.set(wave.currentPhase, {
      phase: wave.currentPhase,
      output: phaseOutput,
      validationResult: validation,
      completedAt: Date.now(),
    });

    // Advance to next phase
    const nextIndex = wave.currentPhaseIndex + 1;
    if (nextIndex >= wave.phases.length) {
      // Wave complete
      wave.status = 'passed';
    } else {
      wave.currentPhaseIndex = nextIndex;
      wave.currentPhase = wave.phases[nextIndex];
    }

    this._onPhaseChange.fire(wave);
    return wave;
  }

  /**
   * Cancel an active wave, keeping partial results.
   */
  cancelWave(waveId: string): WaveState | undefined {
    const wave = this.activeWaves.get(waveId);
    if (!wave) return undefined;

    wave.status = 'cancelled';
    this._onPhaseChange.fire(wave);
    return wave;
  }

  /**
   * Get an active wave by ID.
   */
  getWave(waveId: string): WaveState | undefined {
    return this.activeWaves.get(waveId);
  }

  /**
   * Get a serializable snapshot of a wave for the webview.
   */
  getWaveSnapshot(waveId: string): {
    phases: Array<{ name: string; status: string }>;
    currentPhase: string;
  } | null {
    const wave = this.activeWaves.get(waveId);
    if (!wave) return null;

    return {
      phases: wave.phases.map((p) => ({
        name: p,
        status: wave.phaseResults.has(p)
          ? wave.phaseResults.get(p)!.validationResult?.passed
            ? 'passed'
            : 'failed'
          : p === wave.currentPhase && wave.status === 'running'
            ? 'running'
            : 'pending',
      })),
      currentPhase: wave.currentPhase,
    };
  }

  dispose(): void {
    // Cancel all active waves
    for (const wave of this.activeWaves.values()) {
      if (wave.status === 'running') {
        wave.status = 'cancelled';
      }
    }
    this.activeWaves.clear();
    this._onPhaseChange.dispose();
  }
}

/**
 * Generate a short unique ID for wave tracking.
 */
function generateId(): string {
  // Use crypto.randomUUID if available, otherwise fallback
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID().slice(0, 8);
  }
  return `w-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
