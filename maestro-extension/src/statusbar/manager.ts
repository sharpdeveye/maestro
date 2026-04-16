import * as vscode from 'vscode';

/**
 * Manages the Maestro status bar item.
 */
export class StatusBarManager implements vscode.Disposable {
  private item: vscode.StatusBarItem;

  constructor() {
    this.item = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    this.item.command = 'maestro.openCommandCenter';
    this.update(false, false);
    this.item.show();
  }

  update(zeroDefectActive: boolean, contextDetected: boolean): void {
    if (zeroDefectActive) {
      this.item.text = '$(shield) Maestro · Zero-Defect';
      this.item.color = new vscode.ThemeColor(
        'charts.orange'
      );
      this.item.tooltip = 'Maestro — Zero-Defect mode active. Click to open Command Center.';
    } else if (!contextDetected) {
      this.item.text = '$(pulse) Maestro';
      this.item.color = undefined;
      this.item.tooltip = 'Maestro — No .maestro.md detected. Click to open Command Center.';
    } else {
      this.item.text = '$(pulse) Maestro';
      this.item.color = undefined;
      this.item.tooltip = 'Maestro — Ready. Click to open Command Center.';
    }
  }

  dispose(): void {
    this.item.dispose();
  }
}
