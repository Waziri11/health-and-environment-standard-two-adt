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
    const text = texts[id];
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
