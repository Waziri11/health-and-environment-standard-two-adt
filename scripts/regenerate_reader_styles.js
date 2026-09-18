// Rebuild styles from this book's HTML and its installed shared reader runtime.
// Dependencies (in the book or a separate build directory): postcss@8.5.6,
// tailwindcss@4.2.4, @tailwindcss/postcss@4.2.4, tw-animate-css@1.4.0.
// Usage: node scripts/regenerate_reader_styles.js [build-directory]
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const buildDirectory = process.argv[2] ? path.resolve(process.argv[2]) : root;
const dependency = (name) => require(require.resolve(name, { paths: [buildDirectory] }));
const postcss = dependency('postcss');
const tailwind = dependency('@tailwindcss/postcss');
const posix = (value) => value.replace(/\\/g, '/');
const sources = [
  `@source "${posix(root)}/*.html";`,
  `@source "${posix(path.join(root, 'assets/base.bundle.local.js'))}";`,
].join('\n');
const input = fs.readFileSync(path.join(root, 'assets/tailwind_css.css'), 'utf8')
  .replace('@import "tailwindcss";', '@import "tailwindcss" source(none);');

postcss([tailwind({ base: root, optimize: { minify: true } })])
  .process(`${sources}\n${input}`, {
    from: path.join(buildDirectory, 'reader-input.css'),
    to: path.join(root, 'content/tailwind_output.css'),
  })
  .then((result) => {
    fs.writeFileSync(path.join(root, 'content/tailwind_output.css'), `${result.css.trimEnd()}\n`);
    console.log('Regenerated reader and book styles from local HTML and runtime sources.');
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
