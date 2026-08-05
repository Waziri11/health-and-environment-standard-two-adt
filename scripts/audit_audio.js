const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const i18n = path.join(root, 'content/i18n/en');
const audioDir = path.join(i18n, 'audio');
const texts = JSON.parse(fs.readFileSync(path.join(i18n, 'texts.json'), 'utf8'));
const audios = JSON.parse(fs.readFileSync(path.join(i18n, 'audios.json'), 'utf8'));
const htmlFiles = fs.readdirSync(root).filter((file) => file.endsWith('.html'));
const htmlIds = new Set();
const imageIds = new Set();
const imagesWithoutId = [];

for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  for (const match of html.matchAll(/data-id=["']([^"']+)["']/g)) htmlIds.add(match[1]);
  for (const match of html.matchAll(/data-explanation-id=["']([^"']+)["']/g)) htmlIds.add(match[1]);
  for (const match of html.matchAll(/<img\b[^>]*>/g)) {
    const idMatch = match[0].match(/data-id=["']([^"']+)["']/);
    if (idMatch) imageIds.add(idMatch[1]);
    else imagesWithoutId.push(`${file}: ${match[0].slice(0, 160)}`);
  }
}

const nonemptyTexts = Object.entries(texts).filter(([, value]) =>
  typeof value === 'string' && value.trim()
);
const report = {
  missingText: [...htmlIds].filter((id) => !(id in texts) && !/^qz\d{3}$/.test(id)),
  missingMap: nonemptyTexts.map(([id]) => id).filter((id) => !(id in audios)),
  missingFile: Object.entries(audios)
    .filter(([, file]) => !fs.existsSync(path.join(audioDir, file)))
    .map(([id]) => id),
  emptyFile: Object.entries(audios)
    .filter(([, file]) => {
      const target = path.join(audioDir, file);
      return fs.existsSync(target) && fs.statSync(target).size < 100;
    })
    .map(([id]) => id),
  unmappedHtml: [...htmlIds].filter(
    (id) => id in texts && String(texts[id]).trim() && !(id in audios)
  ),
  orphanMap: Object.keys(audios).filter((id) => !(id in texts)),
  imagesWithoutId,
  imageMissingText: [...imageIds].filter(
    (id) => !(id in texts) || !String(texts[id]).trim()
  ),
  imageMissingMap: [...imageIds].filter(
    (id) => id in texts && String(texts[id]).trim() && !(id in audios)
  ),
};

console.log(JSON.stringify({
  htmlFiles: htmlFiles.length,
  htmlIds: htmlIds.size,
  imageIds: imageIds.size,
  texts: Object.keys(texts).length,
  nonemptyTexts: nonemptyTexts.length,
  audioMappings: Object.keys(audios).length,
  ...Object.fromEntries(Object.entries(report).map(([key, values]) => [key, values.length])),
}, null, 2));

for (const [label, values] of Object.entries(report)) {
  if (values.length) console.log(`\n${label}\n${values.join('\n')}`);
}

process.exitCode = Object.values(report).some((values) => values.length) ? 1 : 0;
