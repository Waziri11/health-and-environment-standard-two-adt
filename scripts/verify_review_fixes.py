#!/usr/bin/env python3
"""Check the document-review corrections against reader content and narration."""
import json
import re
from pathlib import Path
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parent.parent

def load(path):
    return json.loads((ROOT / path).read_text())

class Page(HTMLParser):
    def __init__(self, filename):
        super().__init__()
        self.tags = []
        self.feed((ROOT / filename).read_text())
    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))

pages = load('content/pages.json')
texts = load('content/i18n/en/texts.json')
audios = load('content/i18n/en/audios.json')
videos = load('content/i18n/en/videos.json')
assert len(pages) == 42
assert pages[0]['href'] == 'index.html' and pages[-1]['href'] == 'back-cover.html'
for index, entry in enumerate(pages, 1):
    page = Page(entry['href'])
    metas = {a.get('name'): a.get('content') for t, a in page.tags if t == 'meta'}
    assert metas['page-section-id'] == str(index), entry
    assert metas['title-id'] == entry['section_id'], entry
    assert any(t == 'link' and 'review-fixes.css' in a.get('href', '') for t, a in page.tags)
    assert not any('adt-page-number' in a.get('class', '').split() for _, a in page.tags)
    for tag, attrs in page.tags:
        if tag == 'img':
            assert (ROOT / attrs['src']).is_file(), attrs
    # Every reader page, including both covers, has its own sign-language video.
    filename = videos[f'video-{index}']
    assert filename == f'page_{index}.mp4'
    assert (ROOT / 'content/i18n/en/video' / filename).is_file(), filename
assert set(videos) == {f'video-{index}' for index in range(1, len(pages) + 1)}
assert {p.name for p in (ROOT / 'content/i18n/en/video').glob('*.mp4')} == set(videos.values())
for name in ['pg007_n0014', 'pg009_n0011']:
    assert texts[name].startswith('(i) ')
    assert texts[name + '_easy_read'].startswith('(i) ')
for name in ['pg007_n0015', 'pg009_n0012']:
    assert texts[name].startswith('(ii) ')
    assert texts[name + '_easy_read'].startswith('(ii) ')
for name in ['pg015_n0033', 'pg015_n0035']:
    assert 'a-l' in texts[name] and 'a-l' in texts[name + '_easy_read']
assert not any(re.search(r'\ba up to [a-z]\b', v) for v in texts.values())
for name in ['cover_front', 'cover_back', 'pg005_signature', 'pg012_table_animals',
             'pg012_table_living', 'pg032_table_columns', 'pg033_table_columns']:
    assert texts[name] and (ROOT / 'content/i18n/en/audio' / audios[name]).stat().st_size > 1000
for name in load('content/column-narration-ids.json'):
    assert name in texts and name not in audios, name
assert texts['pg032_table_columns'].index('4. Broom') < texts['pg032_table_columns'].index('A. Used')
assert texts['pg033_table_columns'].index('6. Dustbin') < texts['pg033_table_columns'].index('E. Used')
# The original shuffled options must remain a matching exercise.
assert texts['pg032_n0024'] == 'Hoe' and texts['pg032_n0026'] == 'A. Used for sweeping'
assert texts['pg033_n0006'] == 'Dustpan' and texts['pg033_n0008'] == 'E. Used to cut and trim flowers'
for n, expected in [(16, 2), (17, 7), (29, 2), (30, 5), (31, 5)]:
    assert sum('book-speech' in a.get('class', '').split() for _, a in Page(f'pg{n:03}_sec001.html').tags) == expected
page = Page('pg033_sec001.html')
assert len([a for t, a in page.tags if t == 'input' and a.get('maxlength') == '1']) == 6
page = Page('pg012_sec001.html')
assert len([a for t, a in page.tags if t == 'input']) == 22
assert 'fa-pen-to-square' not in (ROOT / 'pg024_sec001.html').read_text()
print('PASS: 42 reader pages; covers, navigation/video indices, labels, descriptions, column narration, 21 cartoon pointers and answer fields.')
