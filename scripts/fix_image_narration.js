const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const texts = JSON.parse(fs.readFileSync(path.join(root, 'content/i18n/en/texts.json'), 'utf8'));

const decorative = new Set([
  'pg009_im002', 'pg013_im002', 'pg016_im002', 'pg020_im008',
  'pg022_im002', 'pg024_im003', 'pg024_im004', 'pg024_im005',
  'pg026_im002', 'pg026_im003', 'pg032_im003', 'pg032_im004',
  'pg033_im002', 'pg037_im002',
]);

const labelled = {
  pg010_im002: 'pg010_n0013', pg010_im003: 'pg010_n0016', pg010_im004: 'pg010_n0020',
  pg010_im005: 'pg010_n0023', pg010_im006: 'pg010_n0027', pg010_im007: 'pg010_n0030',
  pg011_im002: 'pg011_n0003', pg011_im003: 'pg011_n0005', pg011_im004: 'pg011_n0007',
  pg011_im005: 'pg011_n0009', pg011_im006: 'pg011_n0011', pg011_im007: 'pg011_n0013',
  pg011_im008: 'pg011_n0015',
  pg014_im002: 'pg014_n0015', pg014_im003: 'pg014_n0018', pg014_im004: 'pg014_n0022',
  pg014_im005: 'pg014_n0025',
  pg015_im002: 'pg015_n0005', pg015_im003: 'pg015_n0008', pg015_im004: 'pg015_n0012',
  pg015_im005: 'pg015_n0015', pg015_im006: 'pg015_n0019', pg015_im007: 'pg015_n0022',
  pg015_im008: 'pg015_n0026', pg015_im009: 'pg015_n0029',
  pg018_im002: 'pg018_n0004', pg018_im003: 'pg018_n0006', pg018_im004: 'pg018_n0008',
  pg018_im005: 'pg018_n0010', pg018_im006: 'pg018_n0012', pg018_im007: 'pg018_n0014',
  pg018_im008: 'pg018_n0016',
  pg021_im002: 'pg021_n0018', pg021_im003: 'pg021_n0020', pg021_im004: 'pg021_n0022',
  pg022_im003: 'pg022_n0011', pg022_im004: 'pg022_n0013',
  pg023_im002: 'pg023_n0002', pg023_im003: 'pg023_n0003', pg023_im004: 'pg023_n0004',
  pg023_im005: 'pg023_n0005', pg023_im006: 'pg023_n0006', pg023_im007: 'pg023_n0007',
  pg025_im002: 'pg025_n0002', pg025_im003: 'pg025_n0004', pg025_im004: 'pg025_n0006',
  pg025_im005: 'pg025_n0008', pg025_im006: 'pg025_n0010', pg025_im007: 'pg025_n0012',
  pg025_im008: 'pg025_n0014', pg025_im009: 'pg025_n0016', pg025_im010: 'pg025_n0018',
  pg027_im002: 'pg027_n0002', pg027_im003: 'pg027_n0004', pg027_im004: 'pg027_n0006',
  pg027_im005: 'pg027_n0008', pg027_im006: 'pg027_n0010', pg027_im007: 'pg027_n0012',
  pg027_im008: 'pg027_n0014', pg027_im009: 'pg027_n0016',
  pg028_im002: 'pg028_n0002', pg028_im003: 'pg028_n0004', pg028_im004: 'pg028_n0004',
  pg028_im005: 'pg028_n0006', pg028_im006: 'pg028_n0008', pg028_im007: 'pg028_n0010',
  pg028_im008: 'pg028_n0012', pg028_im009: 'pg028_n0014', pg028_im010: 'pg028_n0016',
  pg034_im002: 'pg034_n0005', pg034_im003: 'pg034_n0007', pg034_im004: 'pg034_n0009',
  pg034_im005: 'pg034_n0011', pg037_im003: 'pg037_n0010', pg038_im002: 'pg038_n0002',
};

const escapeAttribute = (value) => value
  .replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

for (const file of fs.readdirSync(root).filter((name) => /^pg\d+_sec\d+\.html$/.test(name))) {
  const target = path.join(root, file);
  let html = fs.readFileSync(target, 'utf8');
  const narrationAfterLabel = new Map();

  html = html.replace(/<img\b[^>]*\bdata-id=["']([^"']+)["'][^>]*>/g, (tag, id) => {
    const description = texts[id];
    if (!description) throw new Error(`${file}: no description for ${id}`);

    if (decorative.has(id)) {
      let updated = tag.replace(/\sdata-id=["'][^"']+["']/, '');
      updated = updated.replace(/\salt=["'][^"']*["']/, ' alt=""');
      if (!/\srole=/.test(updated)) updated = updated.replace(/>$/, ' role="presentation">');
      if (!/\saria-hidden=/.test(updated)) updated = updated.replace(/>$/, ' aria-hidden="true">');
      return updated;
    }

    let updated = tag.replace(/\sdata-id=["'][^"']+["']/, ` data-audio-id="${id}"`);
    const alt = ` alt="${escapeAttribute(description)}"`;
    if (/\salt=["'][^"']*["']/.test(updated)) updated = updated.replace(/\salt=["'][^"']*["']/, alt);
    else updated = updated.replace(/>$/, `${alt}>`);
    updated = updated.replace(/\srole=["']presentation["']/, '').replace(/\saria-hidden=["']true["']/, '');

    const narration = `<span class="sr-only" data-id="${id}" data-image-narration="true">${description}</span>`;
    const labelId = labelled[id];
    if (labelId) {
      const list = narrationAfterLabel.get(labelId) || [];
      list.push(narration);
      narrationAfterLabel.set(labelId, list);
      return updated;
    }
    return `${updated}${narration}`;
  });

  for (const [labelId, narrations] of narrationAfterLabel) {
    const pattern = new RegExp(`(<([a-z][a-z0-9]*)\\b[^>]*data-id=["']${labelId}["'][^>]*>[\\s\\S]*?<\\/\\2>)`);
    if (!pattern.test(html)) throw new Error(`${file}: label ${labelId} not found for image narration`);
    html = html.replace(pattern, `$1${narrations.join('')}`);
  }

  fs.writeFileSync(target, html);
}

console.log('Image narration markup updated.');
