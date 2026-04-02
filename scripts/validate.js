/**
 * Maestro Validation Script
 * Validates all SKILL.md files have correct frontmatter and cross-references.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(ROOT, 'source', 'skills');

let errors = 0;
let warnings = 0;

function validate() {
  console.log('🔍 Maestro Validation');
  console.log('=====================\n');

  const skills = fs.readdirSync(SOURCE_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  console.log(`Checking ${skills.length} skills...\n`);

  for (const skill of skills) {
    const skillPath = path.join(SOURCE_DIR, skill, 'SKILL.md');

    if (!fs.existsSync(skillPath)) {
      error(`${skill}: Missing SKILL.md`);
      continue;
    }

    const content = fs.readFileSync(skillPath, 'utf-8');

    // Check frontmatter
    if (!content.startsWith('---')) {
      error(`${skill}: Missing YAML frontmatter`);
      continue;
    }

    const frontmatterEnd = content.indexOf('---', 3);
    if (frontmatterEnd === -1) {
      error(`${skill}: Malformed YAML frontmatter (no closing ---)`);
      continue;
    }

    const frontmatter = content.substring(3, frontmatterEnd).trim();

    // Check required fields
    if (!frontmatter.includes('name:')) {
      error(`${skill}: Missing 'name' in frontmatter`);
    }
    if (!frontmatter.includes('description:')) {
      error(`${skill}: Missing 'description' in frontmatter`);
    }

    // Check for user-invocable (command skills)
    if (skill !== 'agent-workflow' && !frontmatter.includes('user-invocable: true')) {
      warn(`${skill}: Missing 'user-invocable: true' — command won't be discoverable`);
    }

    // Check for Impeccable-specific terms (copyright safety)
    const impeccableTerms = ['impeccable', 'frontend-design', 'pbakaus', 'anthropic'];
    for (const term of impeccableTerms) {
      if (content.toLowerCase().includes(term)) {
        error(`${skill}: Contains Impeccable-specific term '${term}' — must be original content`);
      }
    }

    // Check reference file links resolve
    const refPattern = /\[.*?\]\(reference\/([^)]+)\)/g;
    let match;
    while ((match = refPattern.exec(content)) !== null) {
      const refFile = path.join(SOURCE_DIR, skill, 'reference', match[1]);
      if (!fs.existsSync(refFile)) {
        error(`${skill}: Reference file not found: reference/${match[1]}`);
      }
    }

    console.log(`  ✅ ${skill}`);
  }

  // Check reference files in agent-workflow
  const refDir = path.join(SOURCE_DIR, 'agent-workflow', 'reference');
  if (fs.existsSync(refDir)) {
    const refs = fs.readdirSync(refDir);
    console.log(`\n  📚 ${refs.length} reference files in agent-workflow/reference/`);
    refs.forEach(r => console.log(`     • ${r}`));
  }

  console.log(`\n${'='.repeat(40)}`);
  console.log(`Results: ${errors} errors, ${warnings} warnings`);

  if (errors > 0) {
    console.log('\n❌ Validation FAILED');
    process.exit(1);
  } else {
    console.log('\n✅ Validation PASSED');
  }
}

function error(msg) {
  console.error(`  ❌ ERROR: ${msg}`);
  errors++;
}

function warn(msg) {
  console.warn(`  ⚠️  WARN: ${msg}`);
  warnings++;
}

validate();
