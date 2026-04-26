import { describe, it, expect } from 'vitest';
import { estimateTokens, estimateTokensFast } from '../src/token-estimator';

describe('estimateTokens', () => {
  it('returns 0 for empty input', () => {
    expect(estimateTokens('')).toBe(0);
  });

  it('returns reasonable count for short text', () => {
    // "Hello world" = 11 chars → ~3 tokens
    const result = estimateTokens('Hello world');
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(10);
  });

  it('returns reasonable count for code', () => {
    const code = `function add(a: number, b: number): number {
  return a + b;
}`;
    const result = estimateTokens(code);
    // ~60 chars → ~16 tokens
    expect(result).toBeGreaterThan(10);
    expect(result).toBeLessThan(30);
  });

  it('scales linearly with content length', () => {
    const short = 'a'.repeat(100);
    const long = 'a'.repeat(1000);

    const shortTokens = estimateTokens(short);
    const longTokens = estimateTokens(long);

    // 10x input should give ~10x tokens (within 20%)
    const ratio = longTokens / shortTokens;
    expect(ratio).toBeGreaterThan(8);
    expect(ratio).toBeLessThan(12);
  });

  it('handles null/undefined gracefully via empty check', () => {
    // @ts-expect-error — testing runtime safety
    expect(estimateTokens(null)).toBe(0);
    // @ts-expect-error — testing runtime safety
    expect(estimateTokens(undefined)).toBe(0);
  });
});

describe('estimateTokensFast', () => {
  it('returns same result as estimateTokens (they use the same heuristic)', () => {
    const text = 'Some test content for estimation.';
    expect(estimateTokensFast(text)).toBe(estimateTokens(text));
  });
});
