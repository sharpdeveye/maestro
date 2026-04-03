/**
 * Maestro Build Script
 * Copies source skills to all provider-specific directories.
 * Source of truth: source/skills/
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(ROOT, 'source', 'skills');

// All supported provider directories
const PROVIDERS = [
  '.agents/skills',
  '.claude/skills',
  '.cursor/skills',
  '.gemini/skills',
  '.codex/skills',
  '.kiro/skills',
  '.trae/skills',
  '.trae-cn/skills',
  '.opencode/skills',
  '.pi/skills',
];

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function cleanDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function build() {
  console.log('Maestro Build');
  console.log('================\n');

  // Verify source exists
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error('[ERR] Source directory not found:', SOURCE_DIR);
    process.exit(1);
  }

  // List source skills
  const skills = fs.readdirSync(SOURCE_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  console.log(`Found ${skills.length} skills in source/skills/`);
  skills.forEach(s => console.log(`   • ${s}`));
  console.log('');

  // Copy to each provider
  for (const provider of PROVIDERS) {
    const providerDir = path.join(ROOT, provider);
    const providerName = provider.split('/')[0];

    // Clean existing
    cleanDir(providerDir);

    // Copy all skills
    copyDirRecursive(SOURCE_DIR, providerDir);

    console.log(`[OK] ${providerName.padEnd(15)} -> ${skills.length} skills copied`);
  }

  console.log(`\nBuild complete! ${PROVIDERS.length} providers x ${skills.length} skills = ${PROVIDERS.length * skills.length} skill copies`);
}

build();
