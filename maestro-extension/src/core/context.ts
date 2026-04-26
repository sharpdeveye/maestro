import * as vscode from 'vscode';

/**
 * Context file resolution order (first found wins):
 *   1. .maestro/context.md  (v2 — directory-based)
 *   2. .maestro.md          (v1 — backward compatible)
 *
 * Old users with .maestro.md continue to work without changes.
 * New users and /teach-maestro v2 will write to .maestro/context.md.
 */
const CONTEXT_PATHS = ['.maestro/context.md', '.maestro.md'] as const;

/**
 * Watches for Maestro context files in the workspace root and provides their content.
 * Supports both v1 (.maestro.md) and v2 (.maestro/context.md) layouts.
 */
export class ContextManager implements vscode.Disposable {
  private watchers: vscode.FileSystemWatcher[] = [];
  private content: string | null = null;
  private detected = false;
  /** Which file is actually providing context */
  private resolvedPath: string | null = null;

  private readonly onChangeEmitter = new vscode.EventEmitter<{
    detected: boolean;
    info: string | null;
  }>();
  readonly onChange = this.onChangeEmitter.event;

  async initialize(): Promise<void> {
    // Watch both possible paths
    for (const ctxPath of CONTEXT_PATHS) {
      const watcher = vscode.workspace.createFileSystemWatcher(
        `**/${ctxPath}`,
        false,
        false,
        false
      );

      watcher.onDidCreate(() => this.reload());
      watcher.onDidChange(() => this.reload());
      watcher.onDidDelete(() => this.reload());

      this.watchers.push(watcher);
    }

    await this.reload();
  }

  /**
   * Resolve which context file exists and load it.
   * Priority: .maestro/context.md > .maestro.md
   */
  private async reload(): Promise<void> {
    for (const ctxPath of CONTEXT_PATHS) {
      const files = await vscode.workspace.findFiles(ctxPath, null, 1);
      if (files.length > 0) {
        const doc = await vscode.workspace.openTextDocument(files[0]);
        this.content = doc.getText();
        this.detected = true;
        this.resolvedPath = ctxPath;
        this.onChangeEmitter.fire({
          detected: true,
          info: this.extractInfo(this.content),
        });
        return;
      }
    }

    // No context file found
    this.clear();
  }

  private clear(): void {
    this.content = null;
    this.detected = false;
    this.resolvedPath = null;
    this.onChangeEmitter.fire({ detected: false, info: null });
  }

  /** Extract a short summary from context content */
  private extractInfo(content: string): string {
    // Try to find tech stack or project info from the frontmatter
    const lines = content.split('\n').slice(0, 20);
    const techLine = lines.find(
      (l) =>
        l.toLowerCase().includes('tech') ||
        l.toLowerCase().includes('stack') ||
        l.toLowerCase().includes('framework')
    );
    return techLine?.replace(/^[#\-*>\s]+/, '').trim() || 'Context loaded';
  }

  isDetected(): boolean {
    return this.detected;
  }

  getContent(): string | null {
    return this.content;
  }

  /** Which context file is active — null if none found */
  getResolvedPath(): string | null {
    return this.resolvedPath;
  }

  /** Whether the user is on the v1 layout (.maestro.md) */
  isLegacyLayout(): boolean {
    return this.resolvedPath === '.maestro.md';
  }

  getStatus(): { detected: boolean; info: string | null } {
    return {
      detected: this.detected,
      info: this.detected ? this.extractInfo(this.content || '') : null,
    };
  }

  dispose(): void {
    for (const w of this.watchers) {
      w.dispose();
    }
    this.onChangeEmitter.dispose();
  }
}
