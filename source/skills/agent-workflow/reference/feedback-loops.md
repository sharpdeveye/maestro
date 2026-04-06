## Evaluation-Driven Development

### Why Evaluation Matters

"It seems to work" is not evaluation. Models are probabilistic — the same input can produce different outputs. Without systematic evaluation, you're shipping randomness.

### The Golden Test Set

Every workflow needs a golden test set:

```text
Golden test: {
  id: "test_001",
  input: [known input],
  expected_output: [known good output],
  evaluation_criteria: [
    { dimension: "accuracy", weight: 0.4 },
    { dimension: "completeness", weight: 0.3 },
    { dimension: "format_compliance", weight: 0.2 },
    { dimension: "tone", weight: 0.1 }
  ]
}
```

- Minimum 10-20 test cases for production workflows
- Include edge cases, not just happy path
- Update the test set when requirements change
- Version the test set with the workflow

### Evaluator Patterns

**Self-check** (fast, cheap, less reliable):
The same model checks its own output.

```text
Given this task: [original task]
And this output: [generated output]
Rate the output on: accuracy (1-5), completeness (1-5), format (1-5).
If any score is below 3, explain what's wrong and provide a corrected version.
```

**Cross-model evaluation** (slower, moderate cost, more reliable):
A different model evaluates the output.

```text
Generator: Model A (fast, cheap)
Evaluator: Model B (slower, more capable)
Use when: Quality is more important than speed/cost
```

**Rule-based validation** (fast, free, limited scope):
Programmatic checks on the output.

```text
- Output is valid JSON? ✓/✗
- Required fields present? ✓/✗
- Values within expected ranges? ✓/✗
- No PII detected? ✓/✗
- Output length within limits? ✓/✗
```

**Human-in-the-loop** (slowest, most expensive, most reliable):
Human review for critical decisions.

```text
Use when: High-stakes decisions, legal/medical/financial content, edge cases
Don't use when: High-volume, low-stakes tasks (doesn't scale)
```

### Self-Correction Loops

When quality is insufficient:

```python
attempt = 0
max_attempts = 3

while attempt < max_attempts:
    output = generate(input)
    score = evaluate(output)
    if score >= threshold:
        return output
    else:
        input = enrich(input, feedback=score.explanation)
        attempt += 1

return fallback_or_escalate()
```

**Critical**: The input to the retry MUST be different from the original. Retrying with the same input is the definition of insanity. Enrich with:

- The evaluator's feedback
- Additional context
- Modified instructions
- A different approach

### Regression Detection

When you change prompts, models, or tools:

```text
1. Run the golden test set with the OLD configuration → baseline scores
2. Run the golden test set with the NEW configuration → new scores
3. Compare dimension by dimension:
   - Improvement ≥ 5%: Accept with documentation
   - Change < 5%: Neutral, accept if needed
   - Regression ≥ 5%: REJECT or investigate

4. Check for "regression by improvement":
   - Did improving accuracy break format compliance?
   - Did improving speed degrade quality?
```

### Continuous Monitoring

For production workflows:

- Log every input/output pair (redact PII)
- Sample 1-5% of outputs for automated evaluation
- Track quality scores over time — alert on trends, not just thresholds
- A/B test prompt changes before full rollout

### Anti-Patterns

- **The "it works" test**: Running the workflow 3 times manually and calling it tested.
- **The evaluator who can't evaluate**: Using the same weak model to both generate and evaluate. Use a more capable evaluator.
- **The static test set**: Golden test set from 6 months ago that doesn't reflect current requirements.
- **The retry clone**: Retrying with the exact same input and expecting different results. Change the input.
- **The vanity metric**: Tracking "model ran without errors" instead of output quality.
