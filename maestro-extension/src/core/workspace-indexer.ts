import * as vscode from 'vscode';
import * as path from 'path';

/**
 * A node in the workspace dependency graph.
 */
export interface FileNode {
  /** Relative path from workspace root */
  path: string;
  /** Files this file imports/references (relative paths) */
  imports: string[];
  /** Files that import this file (relative paths) */
  importedBy: string[];
  /** Detected language identifier */
  language: string;
  /** Timestamp of last indexing */
  lastIndexed: number;
}

/**
 * Import patterns per language for extracting file dependencies.
 */
const IMPORT_PATTERNS: Record<string, RegExp[]> = {
  typescript: [
    /(?:import|export)\s+.*?\s+from\s+['"]([^'"]+)['"]/g,
    /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ],
  javascript: [
    /(?:import|export)\s+.*?\s+from\s+['"]([^'"]+)['"]/g,
    /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ],
  python: [
    /from\s+([\w.]+)\s+import/g,
    /^import\s+([\w.]+)/gm,
  ],
  go: [
    /import\s+"([^"]+)"/g,
    /import\s+\w+\s+"([^"]+)"/g,
  ],
  rust: [
    /use\s+([\w:]+)/g,
    /mod\s+(\w+)/g,
  ],
  csharp: [
    /using\s+([\w.]+)\s*;/g,
  ],
  ruby: [
    /require\s+['"]([^'"]+)['"]/g,
    /require_relative\s+['"]([^'"]+)['"]/g,
  ],
  java: [
    /import\s+([\w.]+)\s*;/g,
  ],
};

/**
 * Map file extensions to language identifiers for pattern selection.
 */
const EXT_TO_LANGUAGE: Record<string, string> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.py': 'python',
  '.go': 'go',
  '.rs': 'rust',
  '.cs': 'csharp',
  '.rb': 'ruby',
  '.java': 'java',
  '.kt': 'java',
};

/** Supported file extensions for indexing */
const INDEXABLE_EXTENSIONS = Object.keys(EXT_TO_LANGUAGE).map((e) => `**/*${e}`).join(',');

/** Maximum files to index to avoid performance issues */
const MAX_FILES = 5000;

/**
 * Background worker that indexes workspace file relationships.
 *
 * Builds an in-memory dependency graph on activation and maintains it
 * incrementally on file saves. Used by ContextSlicer to determine
 * which parts of .maestro.md are relevant to the current file.
 */
export class WorkspaceIndexer implements vscode.Disposable {
  private graph = new Map<string, FileNode>();
  private watcher: vscode.FileSystemWatcher | undefined;
  private saveListener: vscode.Disposable | undefined;
  private workspaceRoot: string | undefined;
  private indexingPromise: Promise<void> | undefined;

  /**
   * Initialize the indexer. Performs a full workspace index in the
   * background (does not block extension activation).
   */
  async initialize(): Promise<void> {
    this.workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!this.workspaceRoot) return;

    // Watch for file changes
    this.watcher = vscode.workspace.createFileSystemWatcher(
      `**/*.{ts,tsx,js,jsx,mjs,cjs,py,go,rs,cs,rb,java,kt}`
    );
    this.watcher.onDidCreate((uri) => this.reindex(uri));
    this.watcher.onDidChange((uri) => this.reindex(uri));
    this.watcher.onDidDelete((uri) => this.removeFile(uri));

    // Also reindex on save (more reliable for content changes)
    this.saveListener = vscode.workspace.onDidSaveTextDocument((doc) => {
      this.reindex(doc.uri);
    });

    // Full index in background — fire and forget
    this.indexingPromise = this.fullIndex();
  }

  /**
   * Wait for the initial indexing to complete.
   * Used by tests and when we need guaranteed graph state.
   */
  async waitForIndex(): Promise<void> {
    if (this.indexingPromise) {
      await this.indexingPromise;
    }
  }

  /**
   * Full workspace index. Finds all supported files and extracts imports.
   */
  private async fullIndex(): Promise<void> {
    if (!this.workspaceRoot) return;

    try {
      const files = await vscode.workspace.findFiles(
        `{${INDEXABLE_EXTENSIONS}}`,
        '**/node_modules/**',
        MAX_FILES
      );

      // First pass: extract imports for each file
      for (const uri of files) {
        await this.indexFile(uri);
      }

      // Second pass: build reverse edges (importedBy)
      this.buildReverseEdges();
    } catch (err) {
      console.error('[Maestro] Workspace indexing failed:', err);
    }
  }

  /**
   * Index a single file — extract its imports.
   */
  private async indexFile(uri: vscode.Uri): Promise<void> {
    if (!this.workspaceRoot) return;

    const relativePath = path.relative(this.workspaceRoot, uri.fsPath);
    const ext = path.extname(uri.fsPath);
    const language = EXT_TO_LANGUAGE[ext];
    if (!language) return;

    try {
      const doc = await vscode.workspace.openTextDocument(uri);
      const content = doc.getText();
      const imports = this.extractImports(content, language, relativePath);

      const existing = this.graph.get(relativePath);
      this.graph.set(relativePath, {
        path: relativePath,
        imports,
        importedBy: existing?.importedBy ?? [],
        language,
        lastIndexed: Date.now(),
      });
    } catch {
      // File may have been deleted between find and open — skip
    }
  }

  /**
   * Extract import paths from file content.
   * Returns resolved relative paths where possible.
   */
  private extractImports(
    content: string,
    language: string,
    filePath: string
  ): string[] {
    const patterns = IMPORT_PATTERNS[language];
    if (!patterns) return [];

    const imports = new Set<string>();
    const fileDir = path.dirname(filePath);

    for (const pattern of patterns) {
      // Reset regex state for each run
      const regex = new RegExp(pattern.source, pattern.flags);
      let match: RegExpExecArray | null;

      while ((match = regex.exec(content)) !== null) {
        const raw = match[1];
        if (!raw) continue;

        // Skip node_modules / external packages
        if (!raw.startsWith('.') && !raw.startsWith('/')) continue;

        // Resolve relative import to workspace-relative path
        const resolved = this.resolveImport(raw, fileDir);
        if (resolved) {
          imports.add(resolved);
        }
      }
    }

    return [...imports];
  }

  /**
   * Resolve a relative import path to a workspace-relative path.
   * Handles extension-less imports (tries .ts, .tsx, /index.ts, etc.).
   */
  private resolveImport(raw: string, fromDir: string): string | null {
    const joined = path.posix.join(fromDir, raw);
    // Normalize to forward slashes
    const normalized = joined.replace(/\\/g, '/');

    // Try exact match first
    if (this.graph.has(normalized)) return normalized;

    // Try common extensions
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs'];
    for (const ext of extensions) {
      const withExt = normalized + ext;
      if (this.graph.has(withExt)) return withExt;
    }

    // Try index files
    for (const ext of extensions) {
      const indexPath = `${normalized}/index${ext}`;
      if (this.graph.has(indexPath)) return indexPath;
    }

    // Return the normalized path even if not yet in graph
    // (it may be indexed later in the first pass)
    return normalized;
  }

  /**
   * Build reverse edges (importedBy) from forward edges (imports).
   */
  private buildReverseEdges(): void {
    // Clear all importedBy first
    for (const node of this.graph.values()) {
      node.importedBy = [];
    }

    // Rebuild from imports
    for (const node of this.graph.values()) {
      for (const imp of node.imports) {
        const target = this.graph.get(imp);
        if (target && !target.importedBy.includes(node.path)) {
          target.importedBy.push(node.path);
        }
      }
    }
  }

  /**
   * Reindex a single file (incremental update).
   */
  async reindex(uri: vscode.Uri): Promise<void> {
    await this.indexFile(uri);
    this.buildReverseEdges();
  }

  /**
   * Remove a file from the graph.
   */
  private removeFile(uri: vscode.Uri): void {
    if (!this.workspaceRoot) return;
    const relativePath = path.relative(this.workspaceRoot, uri.fsPath);
    this.graph.delete(relativePath);
    this.buildReverseEdges();
  }

  /**
   * Get the direct dependencies of a file (depth 1).
   */
  getDependencies(filePath: string, depth: number = 1): FileNode[] {
    const relativePath = this.toRelative(filePath);
    const node = this.graph.get(relativePath);
    if (!node) return [];

    if (depth <= 1) {
      return node.imports
        .map((p) => this.graph.get(p))
        .filter((n): n is FileNode => !!n);
    }

    // BFS for deeper traversal
    const visited = new Set<string>();
    const queue = [{ path: relativePath, currentDepth: 0 }];
    const result: FileNode[] = [];

    while (queue.length > 0) {
      const item = queue.shift()!;
      if (visited.has(item.path) || item.currentDepth >= depth) continue;
      visited.add(item.path);

      const current = this.graph.get(item.path);
      if (!current) continue;

      if (item.currentDepth > 0) {
        result.push(current);
      }

      for (const imp of current.imports) {
        if (!visited.has(imp)) {
          queue.push({ path: imp, currentDepth: item.currentDepth + 1 });
        }
      }
    }

    return result;
  }

  /**
   * Get all files related to the given file (imports + importedBy).
   */
  getRelatedFiles(filePath: string): FileNode[] {
    const relativePath = this.toRelative(filePath);
    const node = this.graph.get(relativePath);
    if (!node) return [];

    const related = new Set<string>();
    for (const p of node.imports) related.add(p);
    for (const p of node.importedBy) related.add(p);

    return [...related]
      .map((p) => this.graph.get(p))
      .filter((n): n is FileNode => !!n);
  }

  /**
   * Get graph statistics for diagnostics.
   */
  getGraphStats(): { files: number; edges: number; languages: Record<string, number> } {
    let edges = 0;
    const languages: Record<string, number> = {};

    for (const node of this.graph.values()) {
      edges += node.imports.length;
      languages[node.language] = (languages[node.language] || 0) + 1;
    }

    return { files: this.graph.size, edges, languages };
  }

  /**
   * Get the file node for a given path.
   */
  getNode(filePath: string): FileNode | undefined {
    return this.graph.get(this.toRelative(filePath));
  }

  /**
   * Convert an absolute path to workspace-relative.
   */
  private toRelative(filePath: string): string {
    if (!this.workspaceRoot) return filePath;
    if (path.isAbsolute(filePath)) {
      return path.relative(this.workspaceRoot, filePath);
    }
    return filePath;
  }

  dispose(): void {
    this.watcher?.dispose();
    this.saveListener?.dispose();
    this.graph.clear();
  }
}
