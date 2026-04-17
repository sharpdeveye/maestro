import * as vscode from 'vscode';
import { SkillLoader } from '../core/skills';
import { StateManager } from '../core/state';
import { ContextManager } from '../core/context';
import { HistoryManager } from '../core/history';

/**
 * WebviewViewProvider for the Maestro sidebar panel.
 */
export class SidebarProvider implements vscode.WebviewViewProvider {
  private view: vscode.WebviewView | undefined;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly skills: SkillLoader,
    private readonly state: StateManager,
    private readonly context: ContextManager,
    private readonly history?: HistoryManager
  ) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _webviewContext: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this.view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.extensionUri, 'webview-ui', 'dist'),
      ],
    };

    webviewView.webview.html = this.getHtmlContent(webviewView.webview);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async (msg) => {
      switch (msg.type) {
        case 'ready':
          this.syncState();
          break;
        case 'run-command':
          await vscode.commands.executeCommand(`maestro.${this.toCamelCase(msg.command)}`);
          break;
        case 'toggle-mode':
          await vscode.commands.executeCommand('maestro.toggleZeroDefect');
          break;
        case 'init-context':
          await vscode.commands.executeCommand('maestro.initContext');
          break;
        case 'open-link':
          if (msg.url.startsWith('http')) {
            await vscode.env.openExternal(vscode.Uri.parse(msg.url));
          } else if (msg.url.startsWith('vscode:')) {
            await vscode.commands.executeCommand('workbench.action.openSettings', 'maestro');
          }
          break;
      }
    });
  }

  /** Send current state to the webview */
  syncState(): void {
    this.view?.webview.postMessage({
      type: 'state',
      data: {
        ...this.state.getState(),
        ...this.context.getStatus(),
      },
    });
    this.view?.webview.postMessage({
      type: 'skills',
      data: this.skills.toJSON(),
    });
    // Send command history to webview
    if (this.history) {
      this.view?.webview.postMessage({
        type: 'history',
        data: this.history.getRecent(10).map(e => e.name),
      });
    }
  }

  private toCamelCase(name: string): string {
    return name.replace(/-([a-z])/g, (_match, letter) => letter.toUpperCase());
  }

  private getHtmlContent(webview: vscode.Webview): string {
    const distPath = vscode.Uri.joinPath(this.extensionUri, 'webview-ui', 'dist');
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(distPath, 'assets', 'index.js')
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(distPath, 'assets', 'index.css')
    );

    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'nonce-${nonce}'; img-src ${webview.cspSource} data:;" />
  <link rel="stylesheet" href="${styleUri}" />
  <title>Maestro</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}

function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
