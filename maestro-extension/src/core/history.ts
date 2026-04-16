import * as vscode from 'vscode';

const HISTORY_KEY = 'maestro.commandHistory';
const MAX_HISTORY = 10;

export interface HistoryEntry {
  name: string;
  timestamp: number;
}

export class HistoryManager {
  constructor(private readonly context: vscode.ExtensionContext) {}

  /** Record a command execution */
  record(skillName: string): void {
    const history = this.getAll();

    // Remove duplicates of the same skill
    const filtered = history.filter(e => e.name !== skillName);

    // Add to front
    filtered.unshift({ name: skillName, timestamp: Date.now() });

    // Trim to max
    const trimmed = filtered.slice(0, MAX_HISTORY);

    this.context.globalState.update(HISTORY_KEY, trimmed);
  }

  /** Get all history entries */
  getAll(): HistoryEntry[] {
    return this.context.globalState.get<HistoryEntry[]>(HISTORY_KEY) || [];
  }

  /** Get the N most recent entries */
  getRecent(count: number = 5): HistoryEntry[] {
    return this.getAll().slice(0, count);
  }

  /** Clear history */
  clear(): void {
    this.context.globalState.update(HISTORY_KEY, []);
  }
}
