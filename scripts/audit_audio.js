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
const imageRecords = [];
const unclassifiedImages = [];
const legacyImageDataIds = [];
const narrationCounts = new Map();

for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  for (const match of html.matchAll(/data-id=["']([^"']+)["']/g)) htmlIds.add(match[1]);
  for (const match of html.matchAll(/data-explanation-id=["']([^"']+)["']/g)) htmlIds.add(match[1]);
  for (const match of html.matchAll(/<[^>]*data-image-narration=["']true["'][^>]*data-id=["']([^"']+)["'][^>]*>|<[^>]*data-id=["']([^"']+)["'][^>]*data-image-narration=["']true["'][^>]*>/g)) {
    const id = match[1] || match[2];
    narrationCounts.set(id, (narrationCounts.get(id) || 0) + 1);
  }
  for (const match of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = match[0];
    const legacyId = tag.match(/data-id=["']([^"']+)["']/)?.[1];
    const audioId = tag.match(/data-audio-id=["']([^"']+)["']/)?.[1];
    const alt = tag.match(/alt=["']([^"']*)["']/)?.[1] ?? null;
    const decorative = /role=["']presentation["']/.test(tag) && /aria-hidden=["']true["']/.test(tag);
    if (legacyId) legacyImageDataIds.push(`${file}: ${legacyId}`);
    if (audioId) {
      imageIds.add(audioId);
      imageRecords.push({ file, id: audioId, alt });
    } else if (!decorative) {
      unclassifiedImages.push(`${file}: ${tag.slice(0, 160)}`);
    }
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
      return fs.existsSync(target) && fs.statSync(target).size < 1000;
    })
    .map(([id]) => id),
  unmappedHtml: [...htmlIds].filter(
    (id) => id in texts && String(texts[id]).trim() && !(id in audios)
  ),
  orphanMap: Object.keys(audios).filter((id) => !(id in texts)),
  legacyImageDataIds,
  unclassifiedImages,
  imageMissingText: [...imageIds].filter(
    (id) => !(id in texts) || !String(texts[id]).trim()
  ),
  imageMissingMap: [...imageIds].filter(
    (id) => id in texts && String(texts[id]).trim() && !(id in audios)
  ),
  imageMissingNarration: [...imageIds].filter((id) => narrationCounts.get(id) !== 1),
  imageAltMismatch: imageRecords
    .filter(({ id, alt }) => alt !== texts[id])
    .map(({ file, id, alt }) => `${file}: ${id} alt=${JSON.stringify(alt)}`),
  weakImageDescription: [...imageIds]
    .filter((id) => {
      const value = String(texts[id] || '').trim();
      return /^(?:\(?[a-z0-9]+\)?[.)]?|image|picture|photo|illustration|sign)$/i.test(value);
    }),
};

console.log(JSON.stringify({
  htmlFiles: htmlFiles.length,
  htmlIds: htmlIds.size,
  imageIds: imageIds.size,
  imageNarrations: narrationCounts.size,
  texts: Object.keys(texts).length,
  nonemptyTexts: nonemptyTexts.length,
  audioMappings: Object.keys(audios).length,
  ...Object.fromEntries(Object.entries(report).map(([key, values]) => [key, values.length])),
}, null, 2));

for (const [label, values] of Object.entries(report)) {
  if (values.length) console.log(`\n${label}\n${values.join('\n')}`);
}

process.exitCode = Object.values(report).some((values) => values.length) ? 1 : 0;
