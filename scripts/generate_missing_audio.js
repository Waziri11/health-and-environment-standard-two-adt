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
  pg010_n0013: 'Letter a', pg010_n0016: 'Letter b', pg010_n0020: 'Letter c',
  pg010_n0023: 'Letter d', pg010_n0027: 'Letter e', pg010_n0030: 'Letter f',
  pg011_n0003: 'Letter g', pg011_n0005: 'Letter h', pg011_n0007: 'Letter i',
  pg011_n0009: 'Letter j', pg011_n0011: 'Letter k', pg011_n0013: 'Letter l', pg011_n0015: 'Letter m',
  pg014_n0015: 'Letter a', pg014_n0018: 'Letter b', pg014_n0022: 'Letter c', pg014_n0025: 'Letter d',
  pg015_n0005: 'Letter e', pg015_n0008: 'Letter f', pg015_n0012: 'Letter g',
  pg015_n0015: 'Letter h', pg015_n0019: 'Letter i', pg015_n0022: 'Letter j',
  pg015_n0026: 'Letter k', pg015_n0029: 'Letter l',
  pg021_n0018: 'Letter a', pg021_n0020: 'Letter b', pg021_n0022: 'Letter c',
  pg025_n0002: 'Letter a', pg025_n0004: 'Letter b', pg025_n0006: 'Letter c',
  pg025_n0008: 'Letter d', pg025_n0010: 'Letter e', pg025_n0012: 'Letter f',
  pg025_n0014: 'Letter g', pg025_n0016: 'Letter h', pg025_n0018: 'Letter i',
  pg027_n0002: 'Letter a', pg027_n0004: 'Letter b', pg027_n0006: 'Letter c',
  pg027_n0008: 'Letter d', pg027_n0010: 'Letter e', pg027_n0012: 'Letter f',
  pg027_n0014: 'Letter g', pg027_n0016: 'Letter h',
  pg028_n0002: 'Letter i', pg028_n0004: 'Letter j', pg028_n0006: 'Letter k',
  pg028_n0008: 'Letter l', pg028_n0010: 'Letter m', pg028_n0012: 'Letter n',
  pg028_n0014: 'Letter o', pg028_n0016: 'Letter p',
  pg034_n0005: 'Letter a', pg034_n0007: 'Letter b', pg034_n0009: 'Letter c', pg034_n0011: 'Letter d',
  pg037_n0010: 'Letter a', pg038_n0002: 'Letter b',
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
    const text = spokenOverrides[id] || texts[id];
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
