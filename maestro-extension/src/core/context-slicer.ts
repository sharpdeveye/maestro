import * as path from 'path';
import {
  parseMaestroSections,
  matchSections,
  reconstructContent,
  type SliceCriteria,
} from '@maestro/core';
import { estimateTokens } from '@maestro/core';
import { ContextManager } from './context';
import { WorkspaceIndexer } from './workspace-indexer';

/**
 * Result of a context slicing operation.
 */
export interface SlicedContext {
  /** The relevant sections of .maestro.md, reconstructed */
  maestroSlice: string;
  /** Summary of the active file's dependencies */
  fileContext: string;
  /** Estimated token count of the sliced context */
  tokenEstimate: number;
  /** Estimated token count if the full .maestro.md were injected */
  fullTokenEstimate: number;
  /** Percentage of tokens saved by slicing */
  savings: number;
}

/**
 * Extracts only the relevant portions of .maestro.md and workspace
 * metadata for a given command invocation.
 *
 * Uses the WorkspaceIndexer to understand the active file's dependencies
 * and the @maestro/core section matcher to select relevant sections.
 */
export class ContextSlicer {
  constructor(
    private readonly indexer: WorkspaceIndexer,
    private readonly contextManager: ContextManager
  ) {}

  /**
   * Slice the project context for a specific command invocation.
   *
   * @param activeFile - Absolute path to the currently active file (or null)
   * @param skillName - The Maestro skill being invoked (e.g., "fortify")
   */
  slice(activeFile: string | null, skillName: string): SlicedContext {
    const fullContent = this.contextManager.getContent();

    // No .maestro.md — return empty
    if (!fullContent) {
      return {
        maestroSlice: '',
        fileContext: '',
        tokenEstimate: 0,
        fullTokenEstimate: 0,
        savings: 0,
      };
    }

    const fullTokenEstimate = estimateTokens(fullContent);

    // Build slice criteria from the active file
    const criteria = this.buildCriteria(activeFile, skillName);

    // Parse and match sections
    const sections = parseMaestroSections(fullContent);
    const matched = matchSections(sections, criteria);
    const maestroSlice = reconstructContent(matched);

    // Build file dependency context
    const fileContext = this.buildFileContext(activeFile);

    // Calculate token estimates
    const slicedContent = `${maestroSlice}\n\n${fileContext}`;
    const tokenEstimate = estimateTokens(slicedContent);

    // Calculate savings (avoid division by zero)
    const savings = fullTokenEstimate > 0
      ? Math.round(((fullTokenEstimate - tokenEstimate) / fullTokenEstimate) * 100)
      : 0;

    return {
      maestroSlice,
      fileContext,
      tokenEstimate,
      fullTokenEstimate,
      savings: Math.max(0, savings),
    };
  }

  /**
   * Build slice criteria from the active file and skill name.
   */
  private buildCriteria(activeFile: string | null, skillName: string): SliceCriteria {
    const criteria: SliceCriteria = {
      skillName: skillName || undefined,
    };

    if (activeFile) {
      criteria.fileExtension = path.extname(activeFile);
      criteria.directoryName = path.basename(path.dirname(activeFile));

      // Add language hints from the indexer
      const node = this.indexer.getNode(activeFile);
      if (node) {
        criteria.languageHints = [node.language];
      }
    }

    return criteria;
  }

  /**
   * Build a compact file dependency summary for the active file.
   * This gives the AI awareness of the file's place in the project graph.
   */
  private buildFileContext(activeFile: string | null): string {
    if (!activeFile) return '';

    const related = this.indexer.getRelatedFiles(activeFile);
    if (related.length === 0) return '';

    const imports = related.filter((n) => {
      const node = this.indexer.getNode(activeFile);
      return node?.imports.includes(n.path);
    });

    const importedBy = related.filter((n) => {
      const node = this.indexer.getNode(activeFile);
      return node?.importedBy.includes(n.path);
    });

    const lines: string[] = ['### Active File Dependencies\n'];

    if (imports.length > 0) {
      lines.push('**Imports:**');
      for (const imp of imports.slice(0, 15)) {
        lines.push(`- \`${imp.path}\` (${imp.language})`);
      }
      if (imports.length > 15) {
        lines.push(`- ... and ${imports.length - 15} more`);
      }
      lines.push('');
    }

    if (importedBy.length > 0) {
      lines.push('**Imported by:**');
      for (const dep of importedBy.slice(0, 10)) {
        lines.push(`- \`${dep.path}\` (${dep.language})`);
      }
      if (importedBy.length > 10) {
        lines.push(`- ... and ${importedBy.length - 10} more`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }
}
