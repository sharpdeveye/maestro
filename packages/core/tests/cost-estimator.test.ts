import { describe, it, expect } from 'vitest';
import { estimateCost, getKnownModels } from '../src/cost-estimator';

describe('estimateCost', () => {
  it('returns 0 for zero tokens', () => {
    expect(estimateCost('gpt-4o', 0, 0)).toBe(0);
  });

  it('calculates cost for known model', () => {
    // gpt-4o: $2.50/1M input, $10.00/1M output
    const cost = estimateCost('gpt-4o', 1_000_000, 1_000_000);
    expect(cost).toBe(12.5); // 2.50 + 10.00
  });

  it('uses default pricing for unknown model', () => {
    const cost = estimateCost('unknown-model', 1_000_000, 1_000_000);
    // default: $2.00/1M input, $8.00/1M output
    expect(cost).toBe(10.0);
  });

  it('uses default for null model', () => {
    const cost = estimateCost(null, 1_000_000, 1_000_000);
    expect(cost).toBe(10.0);
  });

  it('supports partial model name matching', () => {
    // "sonnet" should match "claude-sonnet-4"
    const cost = estimateCost('sonnet', 1_000_000, 0);
    expect(cost).toBe(3.0); // claude-sonnet-4 input rate
  });

  it('returns reasonable cost for typical usage', () => {
    // 4000 input, 2000 output with gpt-4o
    const cost = estimateCost('gpt-4o', 4000, 2000);
    expect(cost).toBeGreaterThan(0);
    expect(cost).toBeLessThan(0.05); // should be ~$0.03
  });
});

describe('getKnownModels', () => {
  it('returns non-empty array', () => {
    const models = getKnownModels();
    expect(models.length).toBeGreaterThan(5);
  });

  it('does not include default', () => {
    const models = getKnownModels();
    expect(models).not.toContain('default');
  });

  it('includes major models', () => {
    const models = getKnownModels();
    expect(models).toContain('gpt-4o');
    expect(models).toContain('claude-sonnet-4');
    expect(models).toContain('gemini-2.5-pro');
  });
});
