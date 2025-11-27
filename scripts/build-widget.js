import esbuild from 'esbuild';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.argv.includes('--watch');
const projectRoot = path.resolve(__dirname, '..');

async function build() {
  try {
    console.log('🏗️  Building widget...');
    
    // Process CSS separately with PostCSS
    const cssPath = path.resolve(projectRoot, 'src/styles/globals.css');
    const cssContent = await fs.readFile(cssPath, 'utf-8');
    
    const result = await postcss([
      tailwindcss({
        config: path.resolve(projectRoot, 'tailwind.config.cjs'),
      }),
      autoprefixer,
    ]).process(cssContent, { from: cssPath });
    
    // Write processed CSS
    await fs.writeFile(path.resolve(projectRoot, 'public/widget.css'), result.css);
    
    // Build JS with esbuild (no CSS processing)
    await esbuild.build({
      entryPoints: [path.resolve(projectRoot, 'src/widget-entry.tsx')],
      bundle: true,
      outfile: path.resolve(projectRoot, 'public/widget.js'),
      format: 'iife',
      minify: !isDev,
      sourcemap: isDev ? 'inline' : true,
      target: ['es2020', 'chrome90', 'firefox88', 'safari14'],
      jsx: 'automatic',
      loader: {
        '.tsx': 'tsx',
        '.ts': 'ts',
        '.js': 'jsx',
        '.css': 'empty', // Ignore CSS imports in JS
      },
      define: {
        'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
      },
      logLevel: 'info',
    });
    
    const jsStats = await fs.stat(path.resolve(projectRoot, 'public/widget.js'));
    const cssStats = await fs.stat(path.resolve(projectRoot, 'public/widget.css'));
    
    console.log(`✅ Widget built successfully!`);
    console.log(`📦 JS Size: ${(jsStats.size / 1024).toFixed(2)} KB`);
    console.log(`🎨 CSS Size: ${(cssStats.size / 1024).toFixed(2)} KB`);
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();
