/**
 * In-memory wave state management for the MCP server.
 *
 * Separate from the extension's WaveEngine since the MCP server
 * runs as a standalone process. Waves are tracked in memory —
 * if the server restarts, active waves are lost (acceptable for v1.5).
 */

import {
  parseMaestroSections,
  matchSections,
  reconstructContent,
  estimateTokens,
} from "@maestro/core";

// ─── Types ──────────────────────────────────────────────────────────

export type McpWavePhase = "map" | "validate" | "scaffold" | "test" | "audit" | "apply" | "verify" | "report";
export type McpWaveStatus = "running" | "passed" | "failed" | "cancelled";

export interface McpPhaseResult {
  phase: McpWavePhase;
  output: string;
  validationPassed: boolean;
  issues: string[];
  suggestions: string[];
}

export interface McpWaveState {
  id: string;
  command: string;
  phases: McpWavePhase[];
  currentPhase: McpWavePhase;
  currentPhaseIndex: number;
  phaseResults: McpPhaseResult[];
  status: McpWaveStatus;
  startedAt: number;
  contextTokens: number;
}

// ─── Phase Mapping ──────────────────────────────────────────────────

const WAVE_PHASES: Record<string, McpWavePhase[]> = {
  compose: ["map", "validate", "scaffold", "test"],
  chain: ["map", "validate", "scaffold", "test"],
  fortify: ["audit", "validate", "apply", "verify"],
  refine: ["audit", "validate", "apply", "verify"],
  diagnose: ["map", "validate", "report"],
  evaluate: ["map", "validate", "report"],
};

// ─── Phase Prompts ──────────────────────────────────────────────────

const PHASE_INSTRUCTIONS: Record<McpWavePhase, string> = {
  map: `**PHASE: MAP** — Analyze and produce a structured plan. DO NOT write implementation code. Output numbered changes with file paths, descriptions, and dependencies.`,
  audit: `**PHASE: AUDIT** — Systematically audit for issues. Categorize findings by severity (critical/warning/info). Include file paths and suggested fixes.`,
  validate: `**PHASE: VALIDATE** — Validate previous phase output against project conventions. Provide a clear PASS/FAIL verdict with specific checks.`,
  scaffold: `**PHASE: SCAFFOLD** — Implement ONLY the changes from the validated plan. Include full code. Follow project conventions strictly.`,
  apply: `**PHASE: APPLY** — Implement fixes for audit findings. Address critical issues first. Include clear diffs.`,
  test: `**PHASE: TEST** — Write tests for the implemented code. Cover edge cases. Follow project test patterns.`,
  verify: `**PHASE: VERIFY** — Verify applied fixes are correct. Check each fix against the original finding. List remaining issues.`,
  report: `**PHASE: REPORT** — Compile a final report. Include severity-ranked recommendations and suggested Maestro follow-up commands.`,
};

// ─── State Manager ──────────────────────────────────────────────────

export class WaveStateManager {
  private waves = new Map<string, McpWaveState>();

  /**
   * Create a new wave.
   */
  create(command: string, contextTokens: number): McpWaveState {
    const phases = WAVE_PHASES[command];
    if (!phases) {
      throw new Error(`Command "${command}" does not support wave execution. Supported: ${Object.keys(WAVE_PHASES).join(", ")}`);
    }

    const id = `w-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const wave: McpWaveState = {
      id,
      command,
      phases: [...phases],
      currentPhase: phases[0],
      currentPhaseIndex: 0,
      phaseResults: [],
      status: "running",
      startedAt: Date.now(),
      contextTokens,
    };

    this.waves.set(id, wave);
    return wave;
  }

  /**
   * Advance a wave by submitting the current phase's output.
   */
  advance(waveId: string, phaseOutput: string): McpWaveState {
    const wave = this.waves.get(waveId);
    if (!wave) throw new Error(`Wave "${waveId}" not found`);
    if (wave.status !== "running") throw new Error(`Wave "${waveId}" is ${wave.status}`);

    // Simple validation
    const issues: string[] = [];
    const suggestions: string[] = [];

    if (phaseOutput.length < 50) {
      issues.push("Output is very short — may be incomplete");
    }
    if (wave.currentPhase === "map" && !phaseOutput.match(/\d+\.|#{1,3}/)) {
      suggestions.push("Map output lacks numbered steps or headings");
    }
    if ((wave.currentPhase === "scaffold" || wave.currentPhase === "apply") && !phaseOutput.includes("```")) {
      suggestions.push("Code phase output contains no code blocks");
    }

    wave.phaseResults.push({
      phase: wave.currentPhase,
      output: phaseOutput,
      validationPassed: issues.length === 0,
      issues,
      suggestions,
    });

    // Advance
    const nextIndex = wave.currentPhaseIndex + 1;
    if (nextIndex >= wave.phases.length) {
      wave.status = "passed";
    } else {
      wave.currentPhaseIndex = nextIndex;
      wave.currentPhase = wave.phases[nextIndex];
    }

    return wave;
  }

  /**
   * Get a wave by ID.
   */
  get(waveId: string): McpWaveState | undefined {
    return this.waves.get(waveId);
  }

  /**
   * Build the instruction text for a wave's current phase.
   */
  buildPhaseInstruction(wave: McpWaveState): string {
    const lines: string[] = [];

    lines.push(`# Wave Execution: /${wave.command}`);
    lines.push(`Phase ${wave.currentPhaseIndex + 1} of ${wave.phases.length}: **${wave.currentPhase.toUpperCase()}**\n`);
    lines.push(PHASE_INSTRUCTIONS[wave.currentPhase]);
    lines.push("");

    // Include previous phase results as context
    if (wave.phaseResults.length > 0) {
      lines.push("---\n");
      lines.push("## Previous Phase Results\n");
      for (const result of wave.phaseResults) {
        lines.push(`### ${result.phase.toUpperCase()} (${result.validationPassed ? "✅ passed" : "⚠️ issues found"})\n`);
        // Truncate long outputs for token efficiency
        const output = result.output.length > 2000
          ? result.output.slice(0, 2000) + "\n\n... [truncated]"
          : result.output;
        lines.push(output);
        if (result.issues.length > 0) {
          lines.push(`\n**Issues:** ${result.issues.join("; ")}`);
        }
        if (result.suggestions.length > 0) {
          lines.push(`**Suggestions:** ${result.suggestions.join("; ")}`);
        }
        lines.push("");
      }
    }

    return lines.join("\n");
  }

  /**
   * Get supported wave commands.
   */
  getSupportedCommands(): string[] {
    return Object.keys(WAVE_PHASES);
  }
}

/** Singleton instance */
export const waveStateManager = new WaveStateManager();
