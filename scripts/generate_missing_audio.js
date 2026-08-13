const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const i18n = path.join(root, 'content/i18n/en');
const audioDir = path.join(i18n, 'audio');
const texts = JSON.parse(fs.readFileSync(path.join(i18n, 'texts.json'), 'utf8'));
const audios = JSON.parse(fs.readFileSync(path.join(i18n, 'audios.json'), 'utf8'));
const ffmpeg = process.env.FFMPEG_PATH ||
  '/tmp/adt-ffmpeg/node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg';
const requested = process.argv.slice(2);
const spokenOverrides = {
  pg010_n0013: 'Picture a', pg010_n0016: 'Picture b', pg010_n0020: 'Picture c',
  pg010_n0023: 'Picture d', pg010_n0027: 'Picture e', pg010_n0030: 'Picture f',
  pg011_n0003: 'Picture g', pg011_n0005: 'Picture h', pg011_n0007: 'Picture i',
  pg011_n0009: 'Picture j', pg011_n0011: 'Picture k', pg011_n0013: 'Picture l', pg011_n0015: 'Picture m',
  pg014_n0015: 'Picture a', pg014_n0018: 'Picture b', pg014_n0022: 'Picture c', pg014_n0025: 'Picture d',
  pg015_n0005: 'Picture e', pg015_n0008: 'Picture f', pg015_n0012: 'Picture g',
  pg015_n0015: 'Picture h', pg015_n0019: 'Picture i', pg015_n0022: 'Picture j',
  pg015_n0026: 'Picture k', pg015_n0029: 'Picture l',
  pg018_n0004: 'Picture number 1 a', pg018_n0006: 'Picture b',
  pg018_n0008: 'Picture number 2 a', pg018_n0010: 'Picture b',
  pg018_n0012: 'Picture number 3', pg018_n0014: 'Picture number 4', pg018_n0016: 'Picture number 5',
  pg021_n0018: 'Safety sign a', pg021_n0020: 'Safety sign b', pg021_n0022: 'Safety sign c',
  pg022_n0011: 'Picture number 1', pg022_n0013: 'Picture number 2',
  pg023_n0002: 'Picture number 3 a', pg023_n0003: 'Picture b',
  pg023_n0004: 'Picture number 4 a', pg023_n0005: 'Picture b',
  pg023_n0006: 'Picture number 5', pg023_n0007: 'Picture number 6',
  pg025_n0002: 'Safety sign a', pg025_n0004: 'Safety sign b', pg025_n0006: 'Safety sign c',
  pg025_n0008: 'Safety sign d', pg025_n0010: 'Safety sign e', pg025_n0012: 'Safety sign f',
  pg025_n0014: 'Safety sign g', pg025_n0016: 'Safety sign h', pg025_n0018: 'Safety sign i',
  pg027_n0002: 'Picture a', pg027_n0004: 'Picture b', pg027_n0006: 'Picture c',
  pg027_n0008: 'Picture d', pg027_n0010: 'Picture e', pg027_n0012: 'Picture f',
  pg027_n0014: 'Picture g', pg027_n0016: 'Picture h',
  pg028_n0002: 'Picture i', pg028_n0004: 'Picture j', pg028_n0006: 'Picture k',
  pg028_n0008: 'Picture l', pg028_n0010: 'Picture m', pg028_n0012: 'Picture n',
  pg028_n0014: 'Picture o', pg028_n0016: 'Picture p',
  pg034_n0005: 'Picture a', pg034_n0007: 'Picture b', pg034_n0009: 'Picture c', pg034_n0011: 'Picture d',
  pg037_n0010: 'Picture a', pg038_n0002: 'Picture b',
  pg036_n0006: 'One', pg036_n0009: 'Two', pg036_n0012: 'Three',
};
const ids = requested.length
  ? requested
  : Object.entries(audios)
      .filter(([, file]) => {
        const target = path.join(audioDir, file);
        return !fs.existsSync(target) || fs.statSync(target).size < 1000;
      })
      .map(([id]) => id);

if (!fs.existsSync(ffmpeg)) {
  throw new Error(`FFmpeg was not found at ${ffmpeg}`);
}

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'adt-audio-'));
let generated = 0;

try {
  for (const id of ids) {
    const baseId = id.replace(/_easy_read$/, '');
    const text = spokenOverrides[id] || spokenOverrides[baseId] || texts[id];
    const filename = audios[id];
    if (typeof text !== 'string' || !text.trim()) throw new Error(`Missing text for ${id}`);
    if (!filename) throw new Error(`Missing audio mapping for ${id}`);

    const aiff = path.join(tempDir, `${id}.aiff`);
    const output = path.join(audioDir, filename);
    const say = spawnSync('/usr/bin/say', ['-v', 'Samantha', '-r', '155', '-o', aiff, text], {
      encoding: 'utf8',
    });
    if (say.status !== 0) throw new Error(`say failed for ${id}: ${say.stderr}`);

    const encode = spawnSync(ffmpeg, [
      '-loglevel', 'error', '-y', '-i', aiff,
      '-ar', '24000', '-ac', '1', '-b:a', '128k', output,
    ], { encoding: 'utf8' });
    if (encode.status !== 0) throw new Error(`ffmpeg failed for ${id}: ${encode.stderr}`);
    if (fs.statSync(output).size < 1000) throw new Error(`Generated audio is empty for ${id}`);
    const decode = spawnSync(ffmpeg, [
      '-loglevel', 'error', '-i', output, '-f', 'null', '-',
    ], { encoding: 'utf8' });
    if (decode.status !== 0) throw new Error(`Generated audio is invalid for ${id}: ${decode.stderr}`);
    generated += 1;
    console.log(`${id} -> ${filename}`);
  }
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}

console.log(`Generated ${generated} audio files.`);
