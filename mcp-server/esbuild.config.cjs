// @ts-check
const esbuild = require('esbuild');
const path = require('path');

const isWatch = process.argv.includes('--watch');

/** @type {esbuild.BuildOptions} */
const config = {
  entryPoints: [path.join(__dirname, 'src', 'index.ts')],
  bundle: true,
  outfile: path.join(__dirname, 'dist', 'index.js'),
  format: 'esm',
  platform: 'node',
  target: 'node20',
  sourcemap: true,
  minify: !isWatch,
  banner: {
    js: '#!/usr/bin/env node',
  },
  // Express and MCP SDK are external — installed at runtime via npm
  // @maestro/core is NOT external — bundled inline to avoid file: path issues on npm
  external: [
    '@modelcontextprotocol/sdk',
    'express',
    'zod',
  ],
};

async function main() {
  if (isWatch) {
    const ctx = await esbuild.context(config);
    await ctx.watch();
    console.log('[esbuild] Watching for changes...');
  } else {
    await esbuild.build(config);
    console.log('[esbuild] MCP server built successfully.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
