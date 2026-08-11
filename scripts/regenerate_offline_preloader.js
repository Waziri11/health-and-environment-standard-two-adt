const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outputPath = path.join(root, 'assets', 'offline-preloader.js');
const existing = fs.readFileSync(outputPath, 'utf8');
const marker = ';\n  var BASE_DIR';
const suffixAt = existing.indexOf(marker);
if (suffixAt < 0) throw new Error('Could not locate offline-preloader suffix');
const readerPages = JSON.parse(fs.readFileSync(path.join(root, 'content', 'pages.json'), 'utf8'));

const files = [
  'assets/config.json',
  'content/pages.json',
  'content/toc.json',
  'content/navigation/nav.html',
  ...readerPages.map((entry) => entry.href),
  'assets/interface_translations/en/interface_translations.json',
  'content/i18n/en/texts.json',
  'content/i18n/en/audios.json',
  'content/i18n/en/videos.json',
  'content/i18n/en/images.json',
  'content/i18n/en/glossary.json',
  'content/i18n/en/timecode/timecode_output.json',
];

const inline = {};
for (const relativePath of files) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) continue;
  const raw = fs.readFileSync(absolutePath, 'utf8');
  inline[`./${relativePath}`] = relativePath.endsWith('.json') ? JSON.parse(raw) : raw;
}

const generated = `// offline-preloader.js — auto-generated, do not edit by hand\n(function () {\n  var INLINE = ${JSON.stringify(inline)}${existing.slice(suffixAt)}`;
fs.writeFileSync(outputPath, generated);
console.log(`Regenerated ${path.relative(root, outputPath)} with ${files.length} sources.`);
