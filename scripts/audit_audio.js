const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const i18n = path.join(root, 'content/i18n/en');
const audioDir = path.join(i18n, 'audio');
const texts = JSON.parse(fs.readFileSync(path.join(i18n, 'texts.json'), 'utf8'));
const audios = JSON.parse(fs.readFileSync(path.join(i18n, 'audios.json'), 'utf8'));
const htmlFiles = [...new Set(JSON.parse(fs.readFileSync(path.join(root, 'content/pages.json'), 'utf8')).map((entry) => entry.href))];
const htmlIds = new Set();
const imageIds = new Set();
const imageRecords = [];
const unclassifiedImages = [];
const legacyImageDataIds = [];
const narrationCounts = new Map();
const intentionallySilent = new Set([
  'pg012_n0005', 'pg012_n0007', 'pg012_n0024', 'pg012_n0025', 'pg012_n0039', 'pg012_n0041',
]);
const catNarration = 'There is an orange coloured cat sitting and looking forward directing attention as it introduces the next learning activity';
const catOccurrences = [
  ['pg007_sec001.html', 'images/pg009_im002.jpg', 'pg007_im002'],
  ['pg009_sec001.html', 'images/pg009_im002.jpg', 'pg009_im002'],
  ['pg009_sec002.html', 'images/pg009_im002.jpg', 'pg009_im002'],
  ['pg013_sec001.html', 'images/pg013_im002.jpg', 'pg013_im002'],
  ['pg016_sec001.html', 'images/pg016_im002.jpg', 'pg016_im002'],
  ['pg022_sec001.html', 'images/pg022_im002.jpg', 'pg022_im002'],
  ['pg026_sec001.html', 'images/pg026_im002.jpg', 'pg026_im002'],
  ['pg033_sec001.html', 'images/pg033_im002.jpg', 'pg033_im002'],
  ['pg037_sec001.html', 'images/pg037_im002.jpg', 'pg037_im002'],
];

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
const catNarrationMismatch = catOccurrences.flatMap(([file, src, id]) => {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const imageTag = [...html.matchAll(/<img\b[^>]*>/g)]
    .map((match) => match[0])
    .find((tag) => tag.includes(`src="${src}"`) || tag.includes(`src='${src}'`));
  const narrationTags = [...html.matchAll(/<[^>]*data-image-narration=["']true["'][^>]*data-id=["']([^"']+)["'][^>]*>([^<]*)<\/[^>]+>|<[^>]*data-id=["']([^"']+)["'][^>]*data-image-narration=["']true["'][^>]*>([^<]*)<\/[^>]+>/g)];
  const narrationText = narrationTags
    .filter((match) => (match[1] || match[3]) === id)
    .map((match) => (match[2] || match[4] || '').trim());
  const problems = [];
  if (!imageTag) problems.push('missing cat image');
  if (imageTag && !imageTag.includes(`data-audio-id="${id}"`)) problems.push(`missing data-audio-id ${id}`);
  if (imageTag && !imageTag.includes(`alt="${catNarration}"`)) problems.push('alt text differs');
  if (imageTag && (/role=["']presentation["']/.test(imageTag) || /aria-hidden=["']true["']/.test(imageTag))) problems.push('cat is decorative');
  if (narrationText.length !== 1 || narrationText[0] !== catNarration) problems.push('narration element differs or is missing');
  if (texts[id] !== catNarration) problems.push('texts.json differs');
  if (audios[id] !== `${id}.mp3`) problems.push('audio mapping differs');
  const audioFile = path.join(audioDir, `${id}.mp3`);
  if (!fs.existsSync(audioFile) || fs.statSync(audioFile).size < 1000) problems.push('audio file is missing or empty');
  return problems.map((problem) => `${file}: ${problem}`);
});
const report = {
  missingText: [...htmlIds].filter((id) => !(id in texts) && !/^qz\d{3}$/.test(id)),
  missingMap: nonemptyTexts.map(([id]) => id).filter((id) => !(id in audios) && !intentionallySilent.has(id)),
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
    (id) => id in texts && String(texts[id]).trim() && !(id in audios) && !intentionallySilent.has(id)
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
  catNarrationMismatch,
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
