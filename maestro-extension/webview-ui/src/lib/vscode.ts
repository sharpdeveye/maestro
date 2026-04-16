/**
 * Type-safe VS Code webview API wrapper.
 * Provides postMessage communication between the webview and extension host.
 */

// Acquire the VS Code API (available in webview context)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const vscode = (window as any).acquireVsCodeApi?.() ?? {
  postMessage: (msg: unknown) => console.log('[dev] postMessage:', msg),
  getState: () => null,
  setState: (_state: unknown) => {},
};

export default vscode;
