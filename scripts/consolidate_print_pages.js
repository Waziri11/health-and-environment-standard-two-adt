const fs = require('fs');

const pagesPath = 'content/pages.json';
const pages = JSON.parse(fs.readFileSync(pagesPath, 'utf8'));
const prelim = [
  { section_id: 'pg001_sec001', href: 'index.html' },
  { section_id: 'pg002_sec001', href: 'pg002_sec001.html' },
  { section_id: 'pg003_sec001', href: 'pg003_sec001.html' },
  { section_id: 'pg004_sec001', href: 'pg004_sec001.html' },
  { section_id: 'pg005_sec001', href: 'pg005_sec001.html' },
  { section_id: 'pg006_sec001', href: 'pg006_sec001.html' },
];
const numbered = new Map();

for (let sourcePage = 7; sourcePage <= 40; sourcePage += 1) {
  const pageNumber = sourcePage - 6;
  const prefix = `pg${String(sourcePage).padStart(3, '0')}_sec`;
  const entries = fs.readdirSync('.').filter((name) => name.startsWith(prefix) && name.endsWith('.html')).sort().map((href) => ({
    section_id: href.replace(/\.html$/, ''),
    href,
    page_number: pageNumber,
  }));
  numbered.set(pageNumber, entries);
}

function extractSections(html) {
  const contentStart = html.indexOf('<div', html.indexOf('id="content"') - 200);
  const scriptStart = html.indexOf('<div class="relative z-50" id="interface-container"');
  if (contentStart < 0 || scriptStart < 0) throw new Error('Could not find content boundaries');
  const chunk = html.slice(contentStart, scriptStart);
  const firstSection = chunk.indexOf('<section');
  const lastSection = chunk.lastIndexOf('</section>');
  if (firstSection < 0 || lastSection < 0) throw new Error('Could not find section markup');
  return chunk.slice(firstSection, lastSection + '</section>'.length);
}

function splitSections(html) {
  return [...html.matchAll(/<section\b[\s\S]*?<\/section>/g)].map((match) => match[0]);
}

const consolidated = [...prelim];
for (const [pageNumber, entries] of [...numbered.entries()].sort((a, b) => a[0] - b[0])) {
  const primary = entries[0];
  let html = fs.readFileSync(primary.href, 'utf8');
  const uniqueSections = new Map();
  for (const entry of entries) {
    for (const section of splitSections(extractSections(fs.readFileSync(entry.href, 'utf8')))) {
      const id = section.match(/data-section-id="([^"]+)"/)?.[1];
      if (id && !uniqueSections.has(id)) uniqueSections.set(id, section);
    }
  }
  const sections = [...uniqueSections.values()].join('\n');

  const contentStart = html.indexOf('<div', html.indexOf('id="content"') - 200);
  const interfaceStart = html.indexOf('<div class="relative z-50" id="interface-container"');
  const openEnd = html.indexOf('>', contentStart) + 1;
  const replacement = `<div id="content" class="adt-print-page opacity-0">\n  <div class="adt-page-flow">\n${sections}\n  </div>\n  <div class="adt-page-number" aria-hidden="true">${pageNumber}</div>\n</div>\n    </main>\n\n    `;
  html = html.slice(0, contentStart) + replacement + html.slice(interfaceStart);
  html = html.replace(/<body[^>]*>/, '<body class="source-faithful">');
  if (!html.includes('source-fidelity.css')) {
    html = html.replace('<link href="./assets/fonts.css" rel="stylesheet">', '<link href="./assets/fonts.css" rel="stylesheet">\n    <link href="./content/source-fidelity.css?v=9" rel="stylesheet">');
  }
  if (!html.includes('source-fidelity.js')) {
    html = html.replace('<script src="./assets/scorm.js"></script>', '<script src="./assets/scorm.js"></script>\n    <script src="./assets/source-fidelity.js?v=9"></script>');
  }
  fs.writeFileSync(primary.href, html);
  consolidated.push(primary);
}

for (const [href, label] of [['pg004_sec001.html', 'iv'], ['pg005_sec001.html', 'v'], ['pg006_sec001.html', 'vi']]) {
  let html = fs.readFileSync(href, 'utf8');
  const sections = [...new Map(splitSections(extractSections(html)).map((section) => [section.match(/data-section-id="([^"]+)"/)?.[1], section])).values()].join('\n');
  const contentStart = html.indexOf('<div', html.indexOf('id="content"') - 200);
  const interfaceStart = html.indexOf('<div class="relative z-50" id="interface-container"');
  const replacement = `<div id="content" class="adt-print-page opacity-0">\n  <div class="adt-page-flow">\n${sections}\n  </div>\n  <div class="adt-page-number" aria-hidden="true">${label}</div>\n</div>\n    </main>\n\n    `;
  html = html.slice(0, contentStart) + replacement + html.slice(interfaceStart);
  html = html.replace(/<body[^>]*>/, '<body class="source-faithful">');
  if (!html.includes('source-fidelity.css')) html = html.replace('<link href="./assets/fonts.css" rel="stylesheet">', '<link href="./assets/fonts.css" rel="stylesheet">\n    <link href="./content/source-fidelity.css?v=9" rel="stylesheet">');
  if (!html.includes('source-fidelity.js')) html = html.replace('<script src="./assets/scorm.js"></script>', '<script src="./assets/scorm.js"></script>\n    <script src="./assets/source-fidelity.js?v=9"></script>');
  fs.writeFileSync(href, html);
}

fs.writeFileSync(pagesPath, `${JSON.stringify(consolidated, null, 2)}\n`);

for (const [index, entry] of consolidated.entries()) {
  let html = fs.readFileSync(entry.href, 'utf8');
  html = html.replace(/<meta name="page-section-id" content="\d+" \/>/, `<meta name="page-section-id" content="${index + 1}" />`);
  fs.writeFileSync(entry.href, html);
}

const primaryForPage = Object.fromEntries([...numbered].map(([number, entries]) => [number, entries[0].href]));
const sectionPage = {};
for (const [number, entries] of numbered) for (const entry of entries) sectionPage[entry.section_id] = number;
const tocPath = 'content/toc.json';
const toc = JSON.parse(fs.readFileSync(tocPath, 'utf8')).map((item) => ({
  ...item,
  href: sectionPage[item.section_id] ? primaryForPage[sectionPage[item.section_id]] : item.href,
}));
fs.writeFileSync(tocPath, `${JSON.stringify(toc, null, 2)}\n`);

console.log(`Consolidated ${pages.length} reader screens into ${consolidated.length} print-faithful pages.`);
