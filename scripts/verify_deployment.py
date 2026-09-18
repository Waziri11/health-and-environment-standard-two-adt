#!/usr/bin/env python3
"""Validate static deployment references and detect leftover reader media."""
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
REFERENCED = set()
ERRORS = []


def load(relative):
    return json.loads((ROOT / relative).read_text(encoding='utf-8'))


def reference(value, owner):
    parsed = urlsplit(value)
    if parsed.scheme or parsed.netloc or not parsed.path:
        return
    path = (ROOT / unquote(parsed.path).lstrip('/') if parsed.path.startswith('/')
            else owner.parent / unquote(parsed.path)).resolve()
    if not path.is_relative_to(ROOT):
        ERRORS.append(f'{owner.name}: reference leaves the book: {value}')
    elif not path.is_file():
        ERRORS.append(f'{owner.name}: missing {value}')
    else:
        REFERENCED.add(path)


class Page(HTMLParser):
    def __init__(self, filename):
        super().__init__()
        self.path = ROOT / filename
        self.meta = {}
        self.feed(self.path.read_text(encoding='utf-8'))

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'meta':
            self.meta[attrs.get('name')] = attrs.get('content')
        for name in ['src', 'href', 'poster']:
            if name in attrs:
                reference(attrs[name], self.path)


pages = load('content/pages.json')
config = load('assets/config.json')
version = config['bundleVersion']
expected_html = {entry['href'] for entry in pages}
actual_html = {path.name for path in ROOT.glob('*.html')}
if actual_html != expected_html:
    ERRORS.append(f'HTML differs from reading order: {sorted(actual_html ^ expected_html)}')

for index, entry in enumerate(pages, 1):
    page = Page(entry['href'])
    if page.meta.get('page-section-id') != str(index):
        ERRORS.append(f'{entry["href"]}: incorrect reader page index')
    html = page.path.read_text(encoding='utf-8')
    for asset in ['assets/base.bundle.local.js', 'assets/offline-preloader.js', 'content/tailwind_output.css']:
        if f'{asset}?v={version}' not in html:
            ERRORS.append(f'{entry["href"]}: stale cache version for {asset}')

for entry in load('content/toc.json'):
    reference(entry['href'], ROOT / 'index.html')

# Follow fonts and other stylesheet resources without scanning retired pages.
pending = [path for path in REFERENCED if path.suffix == '.css']
visited_css = set()
while pending:
    path = pending.pop()
    if path in visited_css:
        continue
    visited_css.add(path)
    css = path.read_text(encoding='utf-8')
    for url in re.findall(r'url\(\s*[\"\']?([^\"\')]+)', css):
        reference(url.strip(), path)
    pending.extend(p for p in REFERENCED if p.suffix == '.css' and p not in visited_css)

for language in config['languages']['available']:
    directory = ROOT / 'content/i18n' / language
    audios = load(f'content/i18n/{language}/audios.json')
    videos = load(f'content/i18n/{language}/videos.json')
    for kind, mappings in [('audio', audios), ('video', videos)]:
        for filename in mappings.values():
            reference(f'{kind}/{filename}', directory / f'{kind}s.json')
        actual = {path.name for path in (directory / kind).iterdir() if path.is_file()}
        if actual != set(mappings.values()):
            ERRORS.append(f'{language}/{kind}: unmapped or missing files {sorted(actual ^ set(mappings.values()))}')
    if videos != {f'video-{number}': f'page_{number}.mp4' for number in range(1, len(pages) + 1)}:
        ERRORS.append(f'{language}: video numbering does not match every reader page')
    timecodes = load(f'content/i18n/{language}/timecode/timecode_output.json')
    if set(timecodes) - set(audios):
        ERRORS.append(f'{language}: timecodes reference retired audio IDs')

unused_images = [path.name for path in (ROOT / 'images').iterdir() if path.is_file() and path.resolve() not in REFERENCED]
if unused_images:
    ERRORS.append(f'Unreferenced images: {unused_images}')

runtime = (ROOT / 'assets/base.bundle.local.js').read_text(encoding='utf-8')
for path in re.findall(r'[\"\'](\./assets/[^\"\']+)[\"\']', runtime):
    if '${' not in path and not path.endswith('/'):
        reference(path, ROOT / 'index.html')
for name in ['drop', 'success', 'error', 'reset', 'validate_success']:
    reference(f'./assets/sounds/{name}.mp3', ROOT / 'index.html')
manifest = ROOT / 'assets/favicon_io/site.webmanifest'
for icon in json.loads(manifest.read_text(encoding='utf-8'))['icons']:
    reference(icon['src'], manifest)

# Validate the existing metadata without creating or rebuilding a package.
package_manifest = ROOT / 'imsmanifest.xml'
if package_manifest.exists():
    for element in ET.parse(package_manifest).getroot().iter():
        if element.tag.endswith('}file'):
            reference(element.attrib['href'], package_manifest)

if ERRORS:
    raise SystemExit('\n'.join(ERRORS))
print(f'PASS: {len(pages)} pages, all local references, 42 sign videos, and no orphaned images/audio/video or stale timecodes.')
