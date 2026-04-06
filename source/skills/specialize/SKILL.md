---
name: specialize
description: "Use when the user wants to tailor a workflow for a specific industry, domain, or vertical with specialized expertise, terminology, and guardrails."
argument-hint: "[domain]"
category: utility
version: 1.1.0
user-invocable: true
---

## MANDATORY PREPARATION

Invoke {{command_prefix}}agent-workflow — it contains workflow principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no workflow context exists yet, you MUST run {{command_prefix}}teach-maestro first.

---

Transform a general-purpose workflow into a domain expert.

### Step 1: Domain Discovery

- **Terminology**: What domain-specific language must the agent use?
- **Regulations**: What compliance requirements apply? (HIPAA, SOC2, GDPR)
- **Standards**: What industry standards govern output format or quality?
- **Expert expectations**: What would a domain expert check first?
- **Common errors**: What mistakes would a non-expert make?

### Step 2: Specialize Prompts

```markdown
## Generic: You are an assistant that analyzes documents.
## Specialized (legal): You are a senior legal analyst specializing in contract review.
   You understand common law jurisdictions, standard contract clauses, and the
   difference between representations and warranties. Always caveat that this
   is not legal advice.
```

### Step 3: Specialized Evaluation

| Domain | Evaluation Criteria |
|--------|-------------------|
| Legal | Clause completeness, regulatory compliance, jurisdiction accuracy |
| Medical | Clinical accuracy, guideline adherence, contraindication checks |
| Financial | Calculation accuracy, regulatory disclosure, risk assessment |
| Code | Test coverage, security vulnerabilities, performance |
| Customer Support | Tone, escalation accuracy, resolution completeness |

### Step 4: Domain Guardrails

- **Legal**: "Not legal advice" disclaimer, jurisdiction limitations
- **Medical**: "Not medical advice" disclaimer, emergency detection
- **Financial**: Regulatory disclosures, suitability warnings
- **Code**: Security scanning, dependency vulnerability checks

### Recommended Next Step

After specialization, run `{{command_prefix}}evaluate` with domain-specific scenarios, then `{{command_prefix}}guard` to add domain-appropriate safety guardrails.

**NEVER**:

- Specialize without consulting domain experts or authoritative sources
- Skip domain-specific guardrails
- Use generic evaluation for specialized domains
- Cut corners on terminology
