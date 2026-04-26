/**
 * Context utilities — parse and slice .maestro.md content.
 *
 * Used by both the VS Code extension (via ContextSlicer) and the
 * MCP server (via maestro_run_command with activeFile param).
 */

/** A parsed section from .maestro.md */
export interface MaestroSection {
  /** The heading text (e.g., "Tech Stack", "Conventions") */
  heading: string;
  /** Heading depth (2 for ##, 3 for ###, etc.) */
  depth: number;
  /** Raw content under this heading (excluding the heading line itself) */
  content: string;
  /** Lowercase keywords extracted from heading + first 200 chars of content */
  keywords: string[];
}

/** Criteria for matching relevant sections */
export interface SliceCriteria {
  /** The Maestro skill being invoked (e.g., "fortify", "diagnose") */
  skillName?: string;
  /** File extension of the active file (e.g., ".tsx", ".py") */
  fileExtension?: string;
  /** Directory name of the active file (e.g., "components", "api") */
  directoryName?: string;
  /** Detected language/framework keywords from the active file */
  languageHints?: string[];
}

/**
 * Skill-to-keyword mapping. Each skill is associated with keywords that
 * determine which .maestro.md sections are most relevant.
 */
const SKILL_KEYWORDS: Record<string, string[]> = {
  diagnose: ["architecture", "stack", "conventions", "quality", "testing", "tools"],
  evaluate: ["quality", "testing", "evaluation", "metrics", "conventions"],
  refine: ["conventions", "style", "patterns", "naming", "structure"],
  streamline: ["architecture", "complexity", "dependencies", "tools"],
  calibrate: ["conventions", "naming", "style", "patterns", "standards"],
  fortify: ["error", "handling", "retry", "fallback", "safety", "logging", "validation"],
  "zero-defect": ["conventions", "testing", "quality", "strict", "validation", "types"],
  amplify: ["tools", "context", "capabilities", "features"],
  chain: ["tools", "pipeline", "data", "flow", "orchestration"],
  compose: ["agents", "architecture", "delegation", "coordination"],
  enrich: ["knowledge", "data", "rag", "context", "sources"],
  guard: ["safety", "security", "validation", "constraints", "limits", "pii"],
  iterate: ["feedback", "evaluation", "testing", "monitoring", "loops"],
  accelerate: ["performance", "latency", "cost", "tokens", "caching", "optimization"],
  turbocharge: ["performance", "parallel", "streaming", "advanced"],
  "teach-maestro": ["stack", "conventions", "architecture", "overview"],
  "onboard-agent": ["setup", "configuration", "initialization"],
  "adapt-workflow": ["provider", "deployment", "environment", "migration"],
  specialize: ["domain", "industry", "terminology", "expertise"],
  "extract-pattern": ["patterns", "templates", "reusable", "library"],
  temper: ["complexity", "over-engineering", "simplify", "reduce"],
};

/**
 * File-extension-to-keyword mapping for matching sections to the active file's language.
 */
const EXTENSION_KEYWORDS: Record<string, string[]> = {
  ".ts": ["typescript", "ts", "node", "javascript", "js"],
  ".tsx": ["typescript", "ts", "react", "jsx", "frontend", "component", "ui"],
  ".js": ["javascript", "js", "node"],
  ".jsx": ["javascript", "js", "react", "jsx", "frontend", "component", "ui"],
  ".py": ["python", "py", "django", "flask", "fastapi"],
  ".rs": ["rust", "rs", "cargo"],
  ".go": ["go", "golang"],
  ".java": ["java", "jvm", "spring"],
  ".cs": ["csharp", "c#", "dotnet", ".net", "blazor"],
  ".rb": ["ruby", "rails"],
  ".swift": ["swift", "ios", "macos", "apple"],
  ".kt": ["kotlin", "android", "jvm"],
  ".css": ["css", "styling", "design", "ui", "frontend"],
  ".scss": ["css", "sass", "styling", "design", "ui", "frontend"],
  ".html": ["html", "frontend", "ui", "markup"],
  ".md": ["documentation", "docs", "markdown"],
  ".sql": ["sql", "database", "db", "query"],
  ".json": ["config", "configuration", "json"],
  ".yaml": ["config", "configuration", "yaml", "deployment"],
  ".yml": ["config", "configuration", "yaml", "deployment"],
  ".dockerfile": ["docker", "container", "deployment", "infrastructure"],
  ".tf": ["terraform", "infrastructure", "deployment", "iac"],
};

/**
 * Sections that are ALWAYS included regardless of matching criteria.
 * These provide essential context for any command.
 */
const ALWAYS_INCLUDE_PATTERNS = [
  "tech stack",
  "stack",
  "conventions",
  "project overview",
  "overview",
  "architecture",
];

/**
 * Parse .maestro.md content into structured sections.
 * Splits on ## and ### headings, extracting keywords from each section.
 */
export function parseMaestroSections(content: string): MaestroSection[] {
  if (!content || !content.trim()) return [];

  const lines = content.split("\n");
  const sections: MaestroSection[] = [];
  let currentHeading = "";
  let currentDepth = 0;
  let currentLines: string[] = [];

  const flush = () => {
    if (currentHeading) {
      const sectionContent = currentLines.join("\n").trim();
      const keywordSource = `${currentHeading} ${sectionContent.slice(0, 200)}`.toLowerCase();
      const keywords = extractKeywords(keywordSource);

      sections.push({
        heading: currentHeading,
        depth: currentDepth,
        content: sectionContent,
        keywords,
      });
    }
  };

  for (const line of lines) {
    const headingMatch = line.match(/^(#{2,4})\s+(.+)$/);
    if (headingMatch) {
      flush();
      currentDepth = headingMatch[1].length;
      currentHeading = headingMatch[2].trim();
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }
  flush();

  return sections;
}

/**
 * Match sections against criteria, returning only the relevant ones.
 * Always includes "essential" sections (Tech Stack, Conventions, etc.).
 */
export function matchSections(
  sections: MaestroSection[],
  criteria: SliceCriteria
): MaestroSection[] {
  if (sections.length === 0) return [];

  // Build the keyword set from criteria
  const targetKeywords = new Set<string>();

  // Add skill-specific keywords
  if (criteria.skillName && SKILL_KEYWORDS[criteria.skillName]) {
    for (const kw of SKILL_KEYWORDS[criteria.skillName]) {
      targetKeywords.add(kw);
    }
  }

  // Add file-extension keywords
  if (criteria.fileExtension && EXTENSION_KEYWORDS[criteria.fileExtension]) {
    for (const kw of EXTENSION_KEYWORDS[criteria.fileExtension]) {
      targetKeywords.add(kw);
    }
  }

  // Add directory name as a keyword
  if (criteria.directoryName) {
    targetKeywords.add(criteria.directoryName.toLowerCase());
  }

  // Add language hints
  if (criteria.languageHints) {
    for (const hint of criteria.languageHints) {
      targetKeywords.add(hint.toLowerCase());
    }
  }

  const matched: MaestroSection[] = [];

  for (const section of sections) {
    const headingLower = section.heading.toLowerCase();

    // Always include essential sections
    if (ALWAYS_INCLUDE_PATTERNS.some((p) => headingLower.includes(p))) {
      matched.push(section);
      continue;
    }

    // If no criteria provided, include everything (fallback)
    if (targetKeywords.size === 0) {
      matched.push(section);
      continue;
    }

    // Score: how many target keywords appear in this section's keywords
    let score = 0;
    for (const kw of targetKeywords) {
      if (section.keywords.some((sk) => sk.includes(kw) || kw.includes(sk))) {
        score++;
      }
    }

    // Include if at least 1 keyword matches
    if (score > 0) {
      matched.push(section);
    }
  }

  return matched;
}

/**
 * Reconstruct sliced .maestro.md content from matched sections.
 */
export function reconstructContent(sections: MaestroSection[]): string {
  return sections
    .map((s) => {
      const prefix = "#".repeat(s.depth);
      return `${prefix} ${s.heading}\n\n${s.content}`;
    })
    .join("\n\n---\n\n");
}

/**
 * Extract meaningful keywords from text.
 * Strips common words and returns unique lowercase tokens.
 */
function extractKeywords(text: string): string[] {
  const STOP_WORDS = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "to", "of", "in", "for",
    "on", "with", "at", "by", "from", "as", "into", "through", "during",
    "before", "after", "above", "below", "between", "out", "off", "over",
    "under", "again", "further", "then", "once", "here", "there", "when",
    "where", "why", "how", "all", "each", "every", "both", "few", "more",
    "most", "other", "some", "such", "no", "nor", "not", "only", "own",
    "same", "so", "than", "too", "very", "just", "because", "but", "and",
    "or", "if", "while", "about", "use", "using", "used", "etc", "e.g",
    "i.e", "this", "that", "these", "those", "it", "its",
  ]);

  const tokens = text
    .replace(/[^a-z0-9\s\-.#]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));

  return [...new Set(tokens)];
}
