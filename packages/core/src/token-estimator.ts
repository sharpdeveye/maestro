/**
 * Token estimation — heuristic approach.
 *
 * Uses a character-based formula calibrated against tiktoken's cl100k_base:
 *   ~3.5 chars/token for code, ~4.0 chars/token for prose.
 *   Blended ratio of 3.7 covers mixed content within ±10% accuracy.
 *
 * v1.5 shipped js-tiktoken for exact counts, but the 4MB vocabulary bundle
 * inflated the VS Code extension from ~1MB to 5.45MB. Since Maestro only
 * uses token counts for context budget display (not billing), the heuristic
 * is sufficient and saves 4MB of bundle size.
 */

/**
 * Estimate token count for a string.
 *
 * @param text - Input text (code, prose, or mixed)
 * @returns Estimated token count
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 3.7);
}

/**
 * Alias for clarity — both functions now use the same heuristic.
 * Kept for backward compatibility with call sites using the "fast" variant.
 */
export function estimateTokensFast(text: string): number {
  return estimateTokens(text);
}
