import { describe, it, expect } from 'vitest';
import {
  parseMaestroSections,
  matchSections,
  reconstructContent,
  type SliceCriteria,
} from '../src/context-utils';

describe('parseMaestroSections', () => {
  it('returns empty array for empty input', () => {
    expect(parseMaestroSections('')).toEqual([]);
    expect(parseMaestroSections('   ')).toEqual([]);
  });

  it('parses ## headings into sections', () => {
    const input = `## Tech Stack
We use TypeScript and React.

## Conventions
Use camelCase for variables.`;

    const sections = parseMaestroSections(input);
    expect(sections).toHaveLength(2);
    expect(sections[0].heading).toBe('Tech Stack');
    expect(sections[0].depth).toBe(2);
    expect(sections[0].content).toContain('TypeScript');
    expect(sections[1].heading).toBe('Conventions');
    expect(sections[1].content).toContain('camelCase');
  });

  it('parses ### headings with correct depth', () => {
    const input = `### API Design
REST endpoints use /api/v1 prefix.`;

    const sections = parseMaestroSections(input);
    expect(sections).toHaveLength(1);
    expect(sections[0].depth).toBe(3);
  });

  it('extracts keywords from heading and content', () => {
    const input = `## Testing Strategy
We use Vitest for unit tests and Playwright for e2e.`;

    const sections = parseMaestroSections(input);
    expect(sections[0].keywords).toContain('testing');
    expect(sections[0].keywords).toContain('vitest');
  });

  it('ignores # (h1) headings — only ## and deeper', () => {
    const input = `# Maestro Workflow Context
This is the title.

## Real Section
Content here.`;

    const sections = parseMaestroSections(input);
    expect(sections).toHaveLength(1);
    expect(sections[0].heading).toBe('Real Section');
  });
});

describe('matchSections', () => {
  const sections = parseMaestroSections(`## Tech Stack
TypeScript, React, Node.js

## Testing
Vitest for unit tests

## Deployment
Docker + Kubernetes

## Conventions
Use strict TypeScript`);

  it('always includes essential sections (Tech Stack, Conventions)', () => {
    const criteria: SliceCriteria = { skillName: 'fortify' };
    const matched = matchSections(sections, criteria);

    const headings = matched.map((s) => s.heading);
    expect(headings).toContain('Tech Stack');
    expect(headings).toContain('Conventions');
  });

  it('matches sections by skill keywords', () => {
    const criteria: SliceCriteria = { skillName: 'fortify' };
    const matched = matchSections(sections, criteria);

    // fortify keywords include "error", "handling", "validation" — Testing section
    // should match because of the validation/testing keywords
    expect(matched.length).toBeGreaterThanOrEqual(2);
  });

  it('matches sections by file extension', () => {
    const criteria: SliceCriteria = { fileExtension: '.ts' };
    const matched = matchSections(sections, criteria);

    const headings = matched.map((s) => s.heading);
    // .ts maps to "typescript", "node" etc — Tech Stack mentions TypeScript
    expect(headings).toContain('Tech Stack');
  });

  it('includes everything when no criteria provided', () => {
    const criteria: SliceCriteria = {};
    const matched = matchSections(sections, criteria);
    expect(matched).toHaveLength(sections.length);
  });
});

describe('reconstructContent', () => {
  it('reconstructs sections with proper heading levels', () => {
    const sections = parseMaestroSections(`## Heading A
Content A

## Heading B
Content B`);

    const result = reconstructContent(sections);
    expect(result).toContain('## Heading A');
    expect(result).toContain('## Heading B');
    expect(result).toContain('Content A');
    expect(result).toContain('---'); // separator
  });

  it('returns empty string for empty sections', () => {
    expect(reconstructContent([])).toBe('');
  });
});
