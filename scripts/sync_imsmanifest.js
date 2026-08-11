const fs = require('fs');

const pages = JSON.parse(fs.readFileSync('content/pages.json', 'utf8'));
const hrefs = [...new Set(pages.map((entry) => entry.href))];
let manifest = fs.readFileSync('imsmanifest.xml', 'utf8');
const start = manifest.indexOf('      <file href="index.html"/>');
const end = manifest.indexOf('    </resource>', start);
if (start < 0 || end < 0) throw new Error('Could not find IMS manifest file list');
const files = hrefs.map((href) => `      <file href="${href}"/>`).join('\n') + '\n';
manifest = manifest.slice(0, start) + files + manifest.slice(end);
fs.writeFileSync('imsmanifest.xml', manifest);
console.log(`Synchronized IMS manifest with ${hrefs.length} reader pages.`);
