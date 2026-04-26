// @ts-check
const esbuild = require('esbuild');
const path = require('path');

const isWatch = process.argv.includes('--watch');

/** @type {esbuild.BuildOptions} */
const config = {
  entryPoints: [path.join(__dirname, 'src', 'extension.ts')],
  bundle: true,
  outfile: path.join(__dirname, 'dist', 'extension.js'),
  external: ['vscode'],
  format: 'cjs',
  platform: 'node',
  target: 'node20',
  sourcemap: true,
  minify: !isWatch,
  alias: {
    '@maestro/core': path.join(__dirname, '..', 'packages', 'core', 'src', 'index.ts'),
  },
};

async function main() {
  if (isWatch) {
    const ctx = await esbuild.context(config);
    await ctx.watch();
    console.log('[esbuild] Watching for changes...');
  } else {
    await esbuild.build(config);
    console.log('[esbuild] Extension built successfully.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
