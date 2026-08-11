const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const textPath = path.join(root, 'content/i18n/en/texts.json');
const audioPath = path.join(root, 'content/i18n/en/audios.json');
const pagesPath = path.join(root, 'content/pages.json');
const texts = JSON.parse(fs.readFileSync(textPath, 'utf8'));
const audios = JSON.parse(fs.readFileSync(audioPath, 'utf8'));

const updates = {
  pg001_n0010: 'Number 1645',
  pg003_n0005: 'Acknowledgement — iv',
  pg003_n0007: 'Introduction — vi',
  pg003_n0009: 'Chapter One — 1',
  pg003_n0011: 'Simple investigations in the environment — 1',
  pg003_n0013: 'Chapter Two — 10',
  pg003_n0015: 'Safety signs — 10',
  pg003_n0017: 'Chapter Three — 20',
  pg003_n0019: 'Caring for the environment — 20',
  pg007_n0014: 'Question one: What did you observe?',
  pg007_n0015: 'Question two: What things are found in the environment around your home?',
  pg008_n0002: 'Study the following picture or listen to its description, then answer the questions that follow.',
  pg008_n0010: 'What do you like most in the picture or its description?',
  pg008_im002: 'The picture shows a beautiful environment with two houses, a bicycle, a motorcycle, cows, chickens, a dog, a maize farm, banana plants, trees, a vegetable garden, a fence, a chicken house, a pawpaw tree and a water canal.',
  pg009_n0011: 'One. What living things did you observe?',
  pg009_n0012: 'Two. Explain the features of one of the living things you observed.',
  pg009_n0013: '(b) Use ICT tools to listen to or watch videos, or view pictures showing living things found in the environment.',
  pg010_n0008: 'Observe the following pictures or listen to their descriptions, then answer the questions that follow:',
  pg011_im007: 'A housefly.',
  pg011_n0020: 'Name the things you observed in pictures a up to m or heard in their descriptions.',
  pg011_n0022: 'Identify the animals and plants you observed in pictures a up to m or heard in their descriptions. Write the names of animals in the Animals column and the names of plants in the Plants column.',
  pg012_n0028: 'Explain the benefits of one of the animals you observed in pictures a up to m or heard in their descriptions.',
  pg012_n0031: 'Explain the benefits of one of the plants you observed in pictures a up to m or heard in their descriptions.',
  pg012_n0035: 'Identify the living and non-living things you observed in pictures a up to m or heard in their descriptions. Write the names of living things in the Living things column and the names of non-living things in the Non-living things column.',
  pg013_n0004: 'Domestic and wild animals are found in the environment.',
  pg013_n0011: '(a) Use ICT tools to listen to or watch videos, or view pictures showing different kinds of animals.',
  pg013_n0012: 'One. Name the animals you observed.',
  pg013_n0013: 'Two. Choose one animal you observed and boast about its features.',
  pg013_n0016: 'One. Name the animals you have observed.',
  pg013_n0017: 'Two. Tell a short story about the animals you have observed.',
  pg014_n0010: 'Observe the following pictures or listen to their descriptions, then answer the questions that follow.',
  pg015_n0033: 'Name the domestic animals you observed in pictures a up to l or heard in their descriptions.',
  pg015_n0035: 'Name the wild animals you observed in pictures a up to l or heard in their descriptions.',
  pg015_n0037: 'What other wild animals do you know apart from those described or shown in the pictures?',
  pg019_n0006: 'What actions are described or shown in pictures 1 up to 5?',
  pg020_n0006: 'Use ICT tools to listen to or watch videos, or view pictures showing how to adhere to various road safety signs.',
  pg021_n0016: 'Explain the safety measures you would take when you come across or see the following road safety signs:',
  pg021_im002: 'Narrow bridge.',
  pg021_im003: 'Road work ahead.',
  pg021_im004: 'Railway crossing ahead.',
  pg022_n0007: 'Use ICT tools to listen to or watch videos, or view pictures showing how to adhere to safety signs in the environment.',
  pg024_n0004: 'Write a short story about each action shown or described in pictures 1 up to 6.',
  pg026_n0012: 'Use ICT tools to listen to or watch videos, or view pictures of various items used for caring for the environment.',
  pg029_n0006: '1. Name the items used for caring for the environment shown or described in pictures a up to p.',
  pg029_n0011: 'Observe the following cartoons or listen to the words spoken by them, then boast about items for caring for the environment by mentioning their uses.',
  pg032_n0011: 'Match the items used for cleaning the environment with their uses by writing the letter of the correct answer.',
  pg032_n0015: 'Number',
  pg033_n0044: 'I clean my environment to keep it safe and healthy.',
  pg033_n0047: 'Use ICT tools to listen to or watch videos, or view pictures showing how to clean both the inside and outside of a house or classroom.',
  pg034_n0002: 'Observe the following pictures or listen to their descriptions, then answer the questions that follow.',
  pg034_n0014: '1. What actions are taking place or described in pictures a up to d?',
  pg037_n0008: 'Observe or listen to the descriptions of the pictures, then answer the questions that follow.',
  pg038_n0007: '1. What actions are described or shown in pictures (a) and (b)?',
  pg038_n0014: '(a) Use ICT tools to listen to or watch videos, or view pictures showing how to plant trees and flowers in the environment.',
  pg039_n0009: 'that surrounds us — repeat again',
  pg039_n0017: 'Love, protect, and care for the environment — repeat again',
};

const easyRead = {
  pg001_n0010_easy_read: 'Number 1645',
  pg003_n0005_easy_read: 'Acknowledgement, page iv',
  pg003_n0007_easy_read: 'Introduction, page vi',
  pg003_n0009_easy_read: 'Chapter 1, page 1',
  pg003_n0011_easy_read: 'Simple investigations in the environment, page 1',
  pg003_n0013_easy_read: 'Chapter 2, page 10',
  pg003_n0015_easy_read: 'Safety signs, page 10',
  pg003_n0017_easy_read: 'Chapter 3, page 20',
  pg003_n0019_easy_read: 'Caring for the environment, page 20',
};

const newTexts = {
  pg002_n0002: '© Tanzania Institute of Education 2019',
  pg002_n0003: 'First edition 2019',
  pg002_n0004: 'Second edition 2024',
  pg002_n0005: 'ISBN: 978-9912-753-57-0',
  pg002_n0006: 'Tanzania Institute of Education',
  pg002_n0007: 'Mikocheni Area',
  pg002_n0008: '132 Ali Hassan Mwinyi Road',
  pg002_n0009: 'P.O. Box 35094',
  pg002_n0010: '14112 Dar es Salaam',
  pg002_n0011: 'Mobile numbers: +255 735 041 168 / +255 735 041 170',
  pg002_n0012: 'Email: director.general@tie.go.tz',
  pg002_n0013: 'Website: www.tie.go.tz',
  pg002_n0014: 'All rights reserved. No part of this book may be reproduced, stored in any retrieval system, or transmitted in any form or by any means, whether electronic, mechanical, photocopying, recording or otherwise, without prior written permission of the Tanzania Institute of Education.',
  pg004_n0002: 'Acknowledgement',
  pg004_n0003: 'The Tanzania Institute of Education (TIE) would like to acknowledge the contribution of all public and private institutions that participated in one way or another in preparing this textbook. In particular, TIE wishes to thank the University of Dar es Salaam (UDSM), the Dar es Salaam University College of Education (DUCE), Sokoine University of Agriculture (SUA), teachers’ colleges, the School Quality Assurance (SQA) Department and primary schools. Besides, the following individuals are also acknowledged.',
  pg004_n0004: 'Translators:',
  pg004_n0005: 'Dr Cyrus Rumisha (SUA), Mr Marcus I. Kipangule and Ms Pamela R. Chalo (TIE), and Ms Neema M. Thomas (SQA)',
  pg004_n0006: 'Editors:',
  pg004_n0007: 'Dr Felista W. Mwingira (DUCE), Dr Charles Lyimo (SUA) and Dr Leonard Bakize (UDSM)',
  pg004_n0008: 'Designer:',
  pg004_n0009: 'Ms Rehema H. Maganga (TIE)',
  pg004_n0010: 'Illustrators:',
  pg004_n0011: 'Mr Fikiri A. Msimbe and Mr Hance E. Wawar (TIE)',
  pg004_n0012: 'Photographer:',
  pg004_n0013: 'Mr Chrisant Ignas (TIE)',
  pg004_n0014: 'Coordinator:',
  pg004_n0015: 'Mr Marcus I. Kipangule (TIE)',
  pg004_n0016: 'TIE also appreciates the contributions of the primary school teachers and pupils who participated in the trial phase of the manuscript.',
  pg005_n0002: 'Lastly, the Institute would like to thank the Government of the United Republic of Tanzania for the financial support and supervision that facilitated the translation of the Kiswahili manuscript into English and the publishing of this textbook.',
  pg005_n0003: 'Dr Aneth A. Komba',
  pg005_n0004: 'Director General',
  pg005_n0005: 'Tanzania Institute of Education',
};

Object.assign(texts, updates, easyRead, newTexts);
for (const [id, value] of Object.entries(updates)) {
  const easyId = `${id}_easy_read`;
  if (easyId in texts && !(easyId in easyRead)) texts[easyId] = value;
}

const footerIds = Object.entries(texts)
  .filter(([, value]) => /HEALTH AND ENVIRONMENT STD TWO.*\.indd|17\/09\/2025\s+12:11:/i.test(String(value)))
  .map(([id]) => id);
const removedIds = new Set([
  ...footerIds,
  'pg024_n0019', 'pg024_n0019_easy_read',
  'pg033_n0020', 'pg033_n0020_easy_read', 'pg033_n0022', 'pg033_n0022_easy_read',
  'pg033_n0024', 'pg033_n0024_easy_read', 'pg033_n0026', 'pg033_n0026_easy_read',
  'pg033_n0028', 'pg033_n0028_easy_read', 'pg033_n0030', 'pg033_n0030_easy_read',
  'pg033_n0032', 'pg033_n0032_easy_read', 'pg033_n0035', 'pg033_n0035_easy_read',
  'pg033_sec001_ans_item-5', 'pg033_sec001_ans_item-6',
  'pg033_im002', 'pg033_ai1',
]);
for (const id of Object.keys(texts)) if (/^qz\d{3}/.test(id)) removedIds.add(id);

const escapeHtml = (value) => value
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

function replaceInlineText(html, id, value) {
  const safeId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(<([a-z][a-z0-9]*)\\b[^>]*data-id=["']${safeId}["'][^>]*>)([\\s\\S]*?)(<\\/\\2>)`, 'i');
  return html.replace(pattern, `$1${escapeHtml(value)}$4`);
}

function removeElement(html, id) {
  const safeId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`\\s*<([a-z][a-z0-9]*)\\b[^>]*data-id=["']${safeId}["'][^>]*>[\\s\\S]*?<\\/\\1>`, 'gi');
  return html.replace(pattern, '');
}

for (const file of fs.readdirSync(root).filter((name) => name.endsWith('.html') && !/^qz\d{3}\.html$/.test(name))) {
  const target = path.join(root, file);
  let html = fs.readFileSync(target, 'utf8');
  for (const [id, value] of Object.entries(updates)) html = replaceInlineText(html, id, value);
  for (const id of removedIds) html = removeElement(html, id);
  fs.writeFileSync(target, html);
}

function editHtml(file, transform) {
  const target = path.join(root, file);
  const before = fs.readFileSync(target, 'utf8');
  const after = transform(before);
  if (after === before) return;
  fs.writeFileSync(target, after);
}

function replaceBetween(html, startMarker, endMarker, replacement) {
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker, start + startMarker.length);
  if (start < 0 || end < 0) return html;
  return `${html.slice(0, start)}${replacement}${html.slice(end)}`;
}

// Restore the source-book mascot on the Chapter One opener.
editHtml('pg007_sec001.html', (html) => replaceBetween(
  html,
  '      <div class="mt-10 flex w-[70%] justify-center',
  '      <div class="mt-12 w-[78%]',
  `      <div class="mt-10 flex w-[70%] justify-center max-lg:w-[80%] max-sm:w-full">
        <img src="images/pg009_im002.jpg" alt="" role="presentation" aria-hidden="true" class="block h-auto w-[300px] max-w-full object-contain max-lg:w-[260px] max-sm:w-[220px]">
      </div>

`
));

// Put the picture and the Questions heading before the instruction on page 2.
editHtml('pg008_sec001.html', (html) => {
  if (!html.includes('data-review-fix="picture-and-questions"')) {
    html = html.replace(
      '  <section data-section-type="activity_fill_in_the_blank" data-section-id="pg008_sec001" class="mx-auto max-w-5xl">',
      `  <section data-section-type="activity_fill_in_the_blank" data-section-id="pg008_sec001" class="mx-auto max-w-5xl" data-review-fix="picture-and-questions">
    <h1 class="mb-5 text-3xl font-bold text-purple-700 max-sm:text-2xl" data-id="pg008_n0007">Questions</h1>`
    );
    html = html.replace(
      '    <div class="mx-auto max-w-4xl">',
      `    <figure class="mx-auto mb-8 max-w-4xl overflow-hidden rounded-2xl bg-white">
      <img src="images/pg008_im002.jpg" alt="${escapeHtml(texts.pg008_im002)}" data-audio-id="pg008_im002" class="block h-auto w-full object-contain">
      <figcaption class="sr-only" data-id="pg008_im002" data-image-narration="true">${escapeHtml(texts.pg008_im002)}</figcaption>
    </figure>

    <div class="mx-auto max-w-4xl">`
    );
  }
  return html;
});
editHtml('pg008_sec003.html', (html) => replaceBetween(
  html,
  '      <div class="overflow-hidden rounded-none bg-white">',
  '      <div class="mt-8 text-left',
  ''
));
editHtml('pg008_sec002.html', (html) => html.replace(/\s*<div class="absolute left-0 top-0 flex items-center">[\s\S]*?<\/div>\n\n      <div class="rounded/, '\n      <div class="rounded'));

// Add the missing introductory sentence to the animals section.
editHtml('pg013_sec001.html', (html) => {
  if (html.includes('data-id="pg013_n0004"')) return html;
  return html.replace(
    '      <div class="mx-auto flex max-w-[980px] justify-center pt-4 max-sm:pt-2">',
    `      <p class="mx-auto mb-8 max-w-3xl text-center text-[1.45rem] leading-relaxed text-neutral-800 max-lg:text-[1.2rem] max-sm:text-[1rem]" data-id="pg013_n0004">${escapeHtml(texts.pg013_n0004)}</p>

      <div class="mx-auto flex max-w-[980px] justify-center pt-4 max-sm:pt-2">`
  );
});

// Remove the unrequested coloured emphasis from the case study.
editHtml('pg019_sec002.html', (html) => html.replaceAll(' class="bg-amber-600 text-white py-1 px-2 rounded-full mx-1"', ''));

// Keep image alt text synchronized with the corrected sign names/descriptions.
for (const file of fs.readdirSync(root).filter((name) => name.endsWith('.html'))) {
  editHtml(file, (html) => html.replace(/<img\b[^>]*>/g, (tag) => {
    const id = tag.match(/data-audio-id=["']([^"']+)["']/)?.[1];
    if (!id || !(id in texts)) return tag;
    const alt = `alt="${escapeHtml(texts[id])}"`;
    return /\balt=["'][^"']*["']/.test(tag) ? tag.replace(/\balt=["'][^"']*["']/, alt) : tag.replace(/>$/, ` ${alt}>`);
  }));
}

// Remove the answer grid at the end of Exercise 1 while keeping tool rows 5 and 6.
editHtml('pg033_sec001.html', (html) => {
  const answerTable = html.indexOf('<div class="overflow-x-auto"><table');
  if (answerTable >= 0) {
    const end = html.indexOf('</div>', html.indexOf('</table>', answerTable)) + '</div>'.length;
    html = `${html.slice(0, answerTable)}${html.slice(end)}`;
  }
  return html.replace(/\s*<script type="text\/javascript">[\s\S]*?<\/script>/, '');
});

// Remove the cat artwork and add the missing health statement.
editHtml('pg033_sec002.html', (html) => {
  html = replaceBetween(
    html,
    '    <div class="mb-10 flex items-end justify-center',
    '    <div class="relative rounded-[26px]',
    `    <p class="mb-10 text-[1.45rem] leading-relaxed text-neutral-800 max-lg:text-[1.2rem] max-sm:mb-8 max-sm:text-[1rem]" data-id="pg033_n0044">${escapeHtml(texts.pg033_n0044)}</p>

`
  );
  return html;
});

// Remove the empty answer area mistakenly inserted between case-study pages.
editHtml('pg034_sec002.html', (html) => replaceBetween(
  html,
  '    <div class="mb-8 rounded-md border border-slate-400',
  '    <div class="mt-8 flex items-start justify-between',
  ''
));

// Remove all quiz pages from the reading order and restore the missing preliminary pages.
let pages = JSON.parse(fs.readFileSync(pagesPath, 'utf8')).filter((entry) =>
  !/^qz\d{3}$/.test(entry.section_id) && !/^pg00[245]_sec001$/.test(entry.section_id)
);
const preliminary = [
  { section_id: 'pg002_sec001', href: 'pg002_sec001.html' },
  { section_id: 'pg004_sec001', href: 'pg004_sec001.html' },
  { section_id: 'pg005_sec001', href: 'pg005_sec001.html' },
];
pages = [pages[0], preliminary[0], pages[1], preliminary[1], preliminary[2], ...pages.slice(2)];
fs.writeFileSync(pagesPath, `${JSON.stringify(pages, null, 2)}\n`);

// Keep page-section-id synchronized with the final manifest.
pages.forEach((entry, index) => {
  const target = path.join(root, entry.href);
  let html = fs.readFileSync(target, 'utf8');
  html = html.replace(/<meta name="page-section-id" content="\d+" \/>/, `<meta name="page-section-id" content="${index + 1}" />`);
  fs.writeFileSync(target, html);
});

// Audio policy from the review: table headings on page 12 must remain silent.
for (const id of ['pg012_n0005', 'pg012_n0007', 'pg012_n0024', 'pg012_n0025', 'pg012_n0039', 'pg012_n0041']) delete audios[id];
for (const id of removedIds) {
  delete texts[id];
  delete audios[id];
}
for (const id of [...Object.keys(updates), ...Object.keys(easyRead), ...Object.keys(newTexts)]) {
  if (!['pg012_n0005', 'pg012_n0007', 'pg012_n0024', 'pg012_n0025', 'pg012_n0039', 'pg012_n0041'].includes(id)) {
    audios[id] ||= `${id}.mp3`;
  }
}

const timecodePath = path.join(root, 'content/i18n/en/timecode/timecode_output.json');
if (fs.existsSync(timecodePath)) {
  const timecodes = JSON.parse(fs.readFileSync(timecodePath, 'utf8'));
  for (const id of Object.keys(timecodes)) if (/^qz\d{3}/.test(id)) delete timecodes[id];
  fs.writeFileSync(timecodePath, `${JSON.stringify(timecodes, null, 2)}\n`);
}

fs.writeFileSync(textPath, `${JSON.stringify(texts, null, 2)}\n`);
fs.writeFileSync(audioPath, `${JSON.stringify(audios, null, 2)}\n`);

if (process.env.INVALIDATE_REVIEW_AUDIO === '1') {
  const changedIds = [
    ...Object.keys(updates), ...Object.keys(updates).map((id) => `${id}_easy_read`).filter((id) => id in texts),
    ...Object.keys(easyRead), ...Object.keys(newTexts),
  ];
  for (const id of changedIds) {
    const filename = audios[id];
    if (filename) fs.rmSync(path.join(root, 'content/i18n/en/audio', filename), { force: true });
  }
}

console.log(`Updated ${Object.keys(updates).length} text entries, added ${Object.keys(newTexts).length}, removed ${removedIds.size}, and rebuilt ${pages.length} reading-order entries.`);
