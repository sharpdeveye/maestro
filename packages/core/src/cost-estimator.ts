/**
 * Cost estimation — approximate USD cost per LLM call.
 *
 * Uses published model pricing (hardcoded, updated per release).
 * Accuracy: ±20% — useful for trends, not invoicing.
 */

/** Cost per 1 million tokens (USD) */
interface ModelCost {
  input: number;
  output: number;
}

/**
 * Published pricing as of April 2026.
 * "default" is used when model is unknown.
 */
const MODEL_COSTS: Record<string, ModelCost> = {
  // Anthropic
  'claude-sonnet-4':      { input: 3.00,  output: 15.00 },
  'claude-sonnet-4-0':    { input: 3.00,  output: 15.00 },
  'claude-haiku-3.5':     { input: 0.80,  output: 4.00  },
  'claude-opus-4':        { input: 15.00, output: 75.00 },

  // OpenAI
  'gpt-4o':               { input: 2.50,  output: 10.00 },
  'gpt-4o-mini':          { input: 0.15,  output: 0.60  },
  'gpt-4.1':              { input: 2.00,  output: 8.00  },
  'gpt-4.1-mini':         { input: 0.40,  output: 1.60  },
  'gpt-4.1-nano':         { input: 0.10,  output: 0.40  },
  'o3':                   { input: 10.00, output: 40.00 },
  'o4-mini':              { input: 1.10,  output: 4.40  },

  // Google
  'gemini-2.5-pro':       { input: 1.25,  output: 10.00 },
  'gemini-2.5-flash':     { input: 0.15,  output: 0.60  },

  // Fallback
  'default':              { input: 2.00,  output: 8.00  },
};

/**
 * Estimate the USD cost of a model call.
 *
 * @param model - Model name (case-insensitive, partial match supported)
 * @param inputTokens - Number of input tokens
 * @param outputTokens - Number of output tokens
 * @returns Estimated cost in USD
 */
export function estimateCost(
  model: string | null,
  inputTokens: number,
  outputTokens: number
): number {
  const costs = resolveModelCost(model);
  const inputCost = (inputTokens / 1_000_000) * costs.input;
  const outputCost = (outputTokens / 1_000_000) * costs.output;
  return Math.round((inputCost + outputCost) * 10000) / 10000; // 4 decimal places
}

/**
 * Resolve a model name to its cost entry.
 * Supports partial matching (e.g., "sonnet" → "claude-sonnet-4").
 */
function resolveModelCost(model: string | null): ModelCost {
  if (!model) return MODEL_COSTS['default'];

  const normalized = model.toLowerCase().trim();

  // Exact match
  if (MODEL_COSTS[normalized]) {
    return MODEL_COSTS[normalized];
  }

  // Partial match — find first key that contains the model string
  for (const [key, cost] of Object.entries(MODEL_COSTS)) {
    if (key.includes(normalized) || normalized.includes(key)) {
      return cost;
    }
  }

  return MODEL_COSTS['default'];
}

/**
 * Get all known model names.
 */
export function getKnownModels(): string[] {
  return Object.keys(MODEL_COSTS).filter((k) => k !== 'default');
}
