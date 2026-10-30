// Makes the voice pack: records every sentence the game can say with a natural-sounding cloud voice
// (Google Cloud Text-to-Speech, or Microsoft Azure) and saves them as public/voice/<key>.mp3,
// plus public/voice/manifest.json listing them.
//
//   npm run voices            record anything new (already-recorded sentences are skipped)
//   npm run voices -- --dry   just count the sentences, no recording
//
// Needs .env.local in the project folder (never uploaded). Either Google:
//   GOOGLE_TTS_KEY=...
//   GOOGLE_VOICE_EN=en-US-Wavenet-F      (optional)
//   GOOGLE_VOICE_ZH=cmn-CN-Wavenet-A     (optional)
//   GOOGLE_RATE=0.95                     (optional: speaking speed, 1 = normal)
// or Azure:
//   AZURE_SPEECH_KEY=...
//   AZURE_SPEECH_REGION=southeastasia
//   AZURE_VOICE_EN=en-US-AnaNeural       (optional)
//   AZURE_VOICE_ZH=zh-CN-XiaoyouNeural   (optional)
//   AZURE_RATE=-5%                       (optional)
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { allLines } from '../src/voice/allLines';
import { cleanSpeech, voiceKey } from '../src/voice/key';

const OUT = 'public/voice';
const dry = process.argv.includes('--dry');

type Job = { text: string; lang: 'en' | 'zh' };
/** Returns the mp3 bytes, or 'retry' (busy, try again later). Throws on a problem retrying won't fix. */
type Recorder = (j: Job) => Promise<Buffer | 'retry'>;

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
function scanSource(): Job[] {
  const out: Job[] = [];
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

/** Picks Google or Azure from .env.local and describes the voices used. */
function setup(env: Record<string, string>): { voices: Record<string, string>; record?: Recorder; workers: number } {
  const useAzure = !env.GOOGLE_TTS_KEY && !!env.AZURE_SPEECH_KEY;

  if (!useAzure) {
    const voices = {
      provider: 'google',
      en: env.GOOGLE_VOICE_EN || 'en-US-Wavenet-F',
      zh: env.GOOGLE_VOICE_ZH || 'cmn-CN-Wavenet-A',
      rate: env.GOOGLE_RATE || '0.95',
    };
    const key = env.GOOGLE_TTS_KEY;
    if (!key) return { voices, workers: 4 };
    const record: Recorder = async (j) => {
      const res = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key },
        body: JSON.stringify({
          input: { text: j.text },
          voice: { languageCode: j.lang === 'en' ? 'en-US' : 'cmn-CN', name: j.lang === 'en' ? voices.en : voices.zh },
          audioConfig: { audioEncoding: 'MP3', speakingRate: Number(voices.rate) },
        }),
      });
      if (res.ok) return Buffer.from(((await res.json()) as { audioContent: string }).audioContent, 'base64');
      if (res.status === 429 || res.status >= 500) return 'retry';
      // 400 = e.g. unknown voice name; 403 = key wrong, API not enabled, or billing not set up
      throw new Error(`Google refused (HTTP ${res.status}): ${(await res.text()).slice(0, 400)}`);
    };
    return { voices, record, workers: 4 };
  }

  const voices = {
    provider: 'azure',
    en: env.AZURE_VOICE_EN || 'en-US-AnaNeural',
    zh: env.AZURE_VOICE_ZH || 'zh-CN-XiaoyouNeural',
    rate: env.AZURE_RATE || '-5%',
  };
  const key = env.AZURE_SPEECH_KEY, region = env.AZURE_SPEECH_REGION;
  if (!region) throw new Error('Missing AZURE_SPEECH_REGION in .env.local');
  const record: Recorder = async (j) => {
    const locale = j.lang === 'en' ? 'en-US' : 'zh-CN';
    const ssml =
      `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${locale}">` +
      `<voice name="${j.lang === 'en' ? voices.en : voices.zh}"><prosody rate="${voices.rate}">${escapeXml(j.text)}</prosody></voice></speak>`;
    const res = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3',
        'User-Agent': 'panpan-voice-pack',
      },
      body: ssml,
    });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    if (res.status === 429 || res.status >= 500) return 'retry'; // the free tier is rate-limited
    throw new Error(`Azure refused (HTTP ${res.status}). Check AZURE_SPEECH_KEY and AZURE_SPEECH_REGION.`);
  };
  return { voices, record, workers: 3 };
}

async function main() {
  const { voices, record, workers } = setup(readEnv());

  // every distinct sentence, keyed by its file name
  const jobs = new Map<string, Job>();
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
  console.log(`Voices (${voices.provider}): English ${voices.en}, Chinese ${voices.zh}, speed ${voices.rate}`);
  if (process.argv.includes('--list')) for (const [k, j] of jobs) console.log(`${k}\t${j.text}`);
  const sample = process.argv.find((a) => a.startsWith('--sample='));
  const limit = sample ? Number(sample.split('=')[1]) : Infinity; // --sample=10: record just a few to listen first
  if (dry) return;
  if (!record) {
    console.error('Missing GOOGLE_TTS_KEY (or AZURE_SPEECH_KEY) in .env.local');
    process.exit(1);
  }

  let done = 0, failed = 0;
  const recordOne = async (name: string, j: Job) => {
    for (let attempt = 1; attempt <= 8; attempt++) {
      const out = await record(j);
      if (out !== 'retry') {
        writeFileSync(join(OUT, `${name}.mp3`), out);
        return true;
      }
      await new Promise((r) => setTimeout(r, Math.min(60000, 3000 * attempt)));
    }
    return false;
  };

  // a few requests at a time; if the service says "too busy" we wait and retry
  const queue = todo.slice(0, limit);
  const total = queue.length;
  const worker = async () => {
    for (let job = queue.shift(); job; job = queue.shift()) {
      try {
        if (await recordOne(job[0], job[1])) done++;
        else failed++;
      } catch (e) {
        console.error(`\n${(e as Error).message}`);
        process.exit(1);
      }
      if ((done + failed) % 25 === 0 || queue.length === 0) process.stdout.write(`\r  recorded ${done}/${total}${failed ? `, failed ${failed}` : ''}   `);
    }
  };
  await Promise.all(Array.from({ length: workers }, worker));
  console.log();

  const keys = readdirSync(OUT).filter((f) => f.endsWith('.mp3')).map((f) => f.slice(0, -4)).sort();
  writeFileSync(manifestPath, JSON.stringify({ voices, keys }));
  console.log(`Done. ${keys.length} recordings in ${OUT}.${failed ? ` ${failed} failed: run again to retry them.` : ''}`);
}

main().catch((e) => {
  console.error((e as Error).message);
  process.exit(1);
});
