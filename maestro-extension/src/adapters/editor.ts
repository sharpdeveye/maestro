import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const MARKER_START = '<!-- maestro:zero-defect:start -->';
const MARKER_END = '<!-- maestro:zero-defect:end -->';

/**
 * Detects the current editor environment.
 */
export type EditorType = 'vscode' | 'cursor' | 'antigravity' | 'claude-code';

export function detectEditor(): EditorType {
  const config = vscode.workspace
    .getConfiguration('maestro')
    .get<string>('editorAdapter');

  if (config && config !== 'auto') {
    return config as EditorType;
  }

  // Auto-detect based on app name
  const appName = vscode.env.appName.toLowerCase();
  if (appName.includes('cursor')) return 'cursor';
  if (appName.includes('antigravity')) return 'antigravity';
  // Default to vscode (covers VS Code, Windsurf, etc.)
  return 'vscode';
}

/**
 * Injects or removes Maestro content in a file using markers.
 */
export async function injectIntoFile(
  filePath: string,
  content: string,
  active: boolean
): Promise<void> {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) return;

  const fullPath = path.join(workspaceRoot, filePath);
  let existing = '';

  try {
    existing = fs.readFileSync(fullPath, 'utf-8');
  } catch {
    // File doesn't exist yet
    if (!active) return;
  }

  // Remove existing injected block
  const startIdx = existing.indexOf(MARKER_START);
  const endIdx = existing.indexOf(MARKER_END);
  if (startIdx !== -1 && endIdx !== -1) {
    existing =
      existing.slice(0, startIdx).trimEnd() +
      '\n' +
      existing.slice(endIdx + MARKER_END.length).trimStart();
    existing = existing.trim();
  }

  if (active) {
    // Append the new block
    const block = `\n\n${MARKER_START}\n${content}\n${MARKER_END}\n`;
    existing = existing ? existing + block : block.trim();
  }

  if (existing.trim()) {
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, existing.trim() + '\n', 'utf-8');
  }
}

/**
 * Inject zero-defect rules into .cursorrules
 */
export async function syncCursorRules(
  zeroDefectContent: string,
  active: boolean
): Promise<void> {
  await injectIntoFile('.cursorrules', zeroDefectContent, active);
}

/**
 * Inject zero-defect rules into CLAUDE.md
 */
export async function syncClaudeMd(
  zeroDefectContent: string,
  active: boolean
): Promise<void> {
  await injectIntoFile('CLAUDE.md', zeroDefectContent, active);
}

/**
 * Sync zero-defect rules to Antigravity's rules system.
 * Writes .agents/rules/maestro-zero-defect.md with YAML frontmatter.
 *
 * - active=true  → trigger: always_on (injected into every prompt)
 * - active=false → trigger: manual (only when explicitly invoked)
 */
export async function syncAntigravityRule(
  zeroDefectContent: string,
  active: boolean
): Promise<void> {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) return;

  const rulesDir = path.join(workspaceRoot, '.agents', 'rules');
  const rulePath = path.join(rulesDir, 'maestro-zero-defect.md');

  const trigger = active ? 'always_on' : 'manual';
  const fileContent = `---\ntrigger: ${trigger}\n---\n\n${zeroDefectContent}\n`;

  if (!fs.existsSync(rulesDir)) {
    fs.mkdirSync(rulesDir, { recursive: true });
  }
  fs.writeFileSync(rulePath, fileContent, 'utf-8');
}
