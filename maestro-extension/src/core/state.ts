import * as vscode from 'vscode';

/**
 * Manages the active mode state (e.g., zero-defect mode).
 */
export class StateManager {
  private zeroDefectActive = false;

  constructor(private readonly context: vscode.ExtensionContext) {
    // Restore persisted state
    this.zeroDefectActive =
      context.workspaceState.get<boolean>('maestro.zeroDefectActive') ?? false;
  }

  isZeroDefectActive(): boolean {
    return this.zeroDefectActive;
  }

  async toggleZeroDefect(): Promise<boolean> {
    this.zeroDefectActive = !this.zeroDefectActive;
    await this.context.workspaceState.update(
      'maestro.zeroDefectActive',
      this.zeroDefectActive
    );
    return this.zeroDefectActive;
  }

  async setZeroDefect(active: boolean): Promise<void> {
    this.zeroDefectActive = active;
    await this.context.workspaceState.update(
      'maestro.zeroDefectActive',
      this.zeroDefectActive
    );
  }

  getState() {
    return {
      zeroDefectActive: this.zeroDefectActive,
    };
  }
}
