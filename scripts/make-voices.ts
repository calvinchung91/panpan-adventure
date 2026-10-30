// Makes the voice pack: records every sentence the game can say with a Microsoft Azure neural voice
// and saves them as public/voice/<key>.mp3, plus public/voice/manifest.json listing them.
//
//   npm run voices            record anything new (already-recorded sentences are skipped)
//   npm run voices -- --dry   just count the sentences, no recording
//
// Needs .env.local in the project folder (never uploaded):
//   AZURE_SPEECH_KEY=...
//   AZURE_SPEECH_REGION=southeastasia
//   AZURE_VOICE_EN=en-US-AnaNeural       (optional)
//   AZURE_VOICE_ZH=zh-CN-XiaoyouNeural   (optional)
//   AZURE_RATE=-5%                       (optional: speaking speed)
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { allLines } from '../src/voice/allLines';
import { cleanSpeech, voiceKey } from '../src/voice/key';

const OUT = 'public/voice';
const dry = process.argv.includes('--dry');

function readEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  if (!existsSync('.env.local')) return env;
  for (const raw of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const m = raw.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return env;
}

/** Fixed sentences written as { en: '…', zh: '…' } anywhere in src/. */
function scanSource(): { text: string; lang: 'en' | 'zh' }[] {
  const out: { text: string; lang: 'en' | 'zh' }[] = [];
  const str = `(['"])((?:\\\\.|(?!\\1).)*)\\1`;
  const re = new RegExp(`\\{\\s*en:\\s*${str},\\s*zh:\\s*${str.replace(/\\1/g, '\\3')}`, 'g');
  const unescape = (s: string) => s.replace(/\\(.)/g, '$1');
  const walk = (dir: string) => {
    for (const f of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, f.name);
      if (f.isDirectory()) walk(p);
      else if (p.endsWith('.ts')) {
        for (const m of readFileSync(p, 'utf8').matchAll(re)) {
          out.push({ text: unescape(m[2]), lang: 'en' }, { text: unescape(m[4]), lang: 'zh' });
        }
      }
    }
  };
  walk('src');
  return out;
}

const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

async function main() {
  const env = readEnv();
  const voices = {
    en: env.AZURE_VOICE_EN || 'en-US-AnaNeural',
    zh: env.AZURE_VOICE_ZH || 'zh-CN-XiaoyouNeural',
    rate: env.AZURE_RATE || '-5%',
  };

  // every distinct sentence, keyed by its file name
  const jobs = new Map<string, { text: string; lang: 'en' | 'zh' }>();
  for (const l of [...allLines(), ...scanSource()]) {
    const text = cleanSpeech(l.text);
    if (!text) continue;
    const key = voiceKey(text, l.lang);
    const prev = jobs.get(key);
    if (prev && prev.text !== text) console.warn(`⚠ two sentences share a file name: "${prev.text}" / "${text}"`);
    jobs.set(key, { text, lang: l.lang });
  }

  mkdirSync(OUT, { recursive: true });
  // switching voices means everything must be recorded again
  const manifestPath = join(OUT, 'manifest.json');
  const old = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : null;
  if (old && JSON.stringify(old.voices) !== JSON.stringify(voices) && !dry) {
    console.log(`Voices changed (${JSON.stringify(old.voices)} → ${JSON.stringify(voices)}): re-recording everything.`);
    for (const f of readdirSync(OUT)) if (f.endsWith('.mp3')) rmSync(join(OUT, f));
  }

  const todo = [...jobs].filter(([key]) => !existsSync(join(OUT, `${key}.mp3`)));
  const chars = todo.reduce((n, [, j]) => n + j.text.length, 0);
  console.log(`${jobs.size} sentences in total, ${todo.length} to record (${chars} characters).`);
  console.log(`Voices: English ${voices.en}, Chinese ${voices.zh}, speed ${voices.rate}`);
  if (process.argv.includes('--list')) for (const [k, j] of jobs) console.log(`${k}	${j.text}`);
  if (dry) return;

  const key = env.AZURE_SPEECH_KEY, region = env.AZURE_SPEECH_REGION;
  if (!key || !region) {
    console.error('Missing AZURE_SPEECH_KEY / AZURE_SPEECH_REGION in .env.local');
    process.exit(1);
  }
  const url = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;

  let done = 0, failed = 0;
  const record = async (name: string, j: { text: string; lang: 'en' | 'zh' }) => {
    const voice = j.lang === 'en' ? voices.en : voices.zh;
    const locale = j.lang === 'en' ? 'en-US' : 'zh-CN';
    const ssml =
      `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${locale}">` +
      `<voice name="${voice}"><prosody rate="${voices.rate}">${escapeXml(j.text)}</prosody></voice></speak>`;
    for (let attempt = 1; attempt <= 8; attempt++) {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': key,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3',
          'User-Agent': 'panpan-voice-pack',
        },
        body: ssml,
      });
      if (res.ok) {
        writeFileSync(join(OUT, `${name}.mp3`), Buffer.from(await res.arrayBuffer()));
        return true;
      }
      if (res.status === 401 || res.status === 403) {
        console.error(`\nAzure refused the key (HTTP ${res.status}). Check AZURE_SPEECH_KEY and AZURE_SPEECH_REGION.`);
        process.exit(1);
      }
      // 429 = too many requests (the free tier is rate-limited): wait and try again
      const wait = Number(res.headers.get('retry-after')) * 1000 || Math.min(60000, 3000 * attempt);
      await new Promise((r) => setTimeout(r, wait));
    }
    return false;
  };

  // a few requests at a time; on the free tier Azure slows us down and we simply wait
  const queue = [...todo];
  const worker = async () => {
    for (let job = queue.shift(); job; job = queue.shift()) {
      if (await record(job[0], job[1])) done++;
      else failed++;
      if ((done + failed) % 25 === 0 || queue.length === 0) process.stdout.write(`\r  recorded ${done}/${todo.length}${failed ? `, failed ${failed}` : ''}   `);
    }
  };
  await Promise.all([worker(), worker(), worker()]);
  console.log();

  const keys = readdirSync(OUT).filter((f) => f.endsWith('.mp3')).map((f) => f.slice(0, -4)).sort();
  writeFileSync(manifestPath, JSON.stringify({ voices, keys }));
  console.log(`Done. ${keys.length} recordings in ${OUT}.${failed ? ` ${failed} failed: run again to retry them.` : ''}`);
}

main();
