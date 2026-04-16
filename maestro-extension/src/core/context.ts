import * as vscode from 'vscode';

/**
 * Watches for .maestro.md in the workspace root and provides its content.
 */
export class ContextManager implements vscode.Disposable {
  private watcher: vscode.FileSystemWatcher | undefined;
  private content: string | null = null;
  private detected = false;

  private readonly onChangeEmitter = new vscode.EventEmitter<{
    detected: boolean;
    info: string | null;
  }>();
  readonly onChange = this.onChangeEmitter.event;

  async initialize(): Promise<void> {
    // Watch for .maestro.md
    this.watcher = vscode.workspace.createFileSystemWatcher(
      '**/.maestro.md',
      false,
      false,
      false
    );

    this.watcher.onDidCreate(() => this.reload());
    this.watcher.onDidChange(() => this.reload());
    this.watcher.onDidDelete(() => this.clear());

    await this.reload();
  }

  private async reload(): Promise<void> {
    const files = await vscode.workspace.findFiles('.maestro.md', null, 1);
    if (files.length > 0) {
      const file = files[0];
      const doc = await vscode.workspace.openTextDocument(file);
      this.content = doc.getText();
      this.detected = true;
      this.onChangeEmitter.fire({
        detected: true,
        info: this.extractInfo(this.content),
      });
    } else {
      this.clear();
    }
  }

  private clear(): void {
    this.content = null;
    this.detected = false;
    this.onChangeEmitter.fire({ detected: false, info: null });
  }

  /** Extract a short summary from .maestro.md content */
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

  getStatus(): { detected: boolean; info: string | null } {
    return {
      detected: this.detected,
      info: this.detected ? this.extractInfo(this.content || '') : null,
    };
  }

  dispose(): void {
    this.watcher?.dispose();
    this.onChangeEmitter.dispose();
  }
}
