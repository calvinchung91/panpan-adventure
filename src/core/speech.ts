// Speech. If a voice pack has been made (`npm run voices`, see README), sentences play as recorded
// neural-voice audio. Anything not recorded uses the phone's built-in text-to-speech
// (Google TTS on Android: an en-US voice for English, a Mandarin zh-CN voice for Chinese).
import type { Lang } from './lang';
import { cleanSpeech, voiceKey } from '../voice/key';
import { music } from './music';

export interface Line {
  text: string;
  lang: Lang;
}

type VoiceTest = (lang: string, v: SpeechSynthesisVoice) => boolean;

const EN_TESTS: VoiceTest[] = [
  (l, v) => l === 'en-us' && /google/i.test(v.name),
  (l) => l === 'en-us',
  (l) => l === 'en-gb',
  (l) => l.startsWith('en'),
];
const ZH_CN = (l: string) => ['zh-cn', 'cmn-cn', 'cmn-hans-cn', 'zh-hans-cn'].includes(l);
const ZH_TESTS: VoiceTest[] = [
  (l, v) => ZH_CN(l) && /google/i.test(v.name),
  (l) => ZH_CN(l),
  (l) => l.startsWith('cmn'),
  (l) => l.startsWith('zh') && !/(tw|hk|hant|yue)/.test(l),
];

class Speech {
  private synth: SpeechSynthesis | null = 'speechSynthesis' in window ? window.speechSynthesis : null;
  enVoice: SpeechSynthesisVoice | null = null;
  zhVoice: SpeechSynthesisVoice | null = null;
  private token = 0;
  private keep: SpeechSynthesisUtterance[] = []; // stops Chrome garbage-collecting utterances mid-sentence
  private pack: Set<string> | null = null; // recorded sentences (voice pack), if one is installed
  private audio: HTMLAudioElement | null = null;

  constructor() {
    this.loadPack();
    if (!this.synth) return;
    this.pickVoices();
    this.synth.onvoiceschanged = () => this.pickVoices();
  }

  /** Loads the list of recorded sentences made by `npm run voices`. Without it, the phone's voice is used. */
  private loadPack(): void {
    fetch('voice/manifest.json', { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : null))
      .then((m: { keys?: string[] } | null) => {
        if (m?.keys?.length) this.pack = new Set(m.keys);
      })
      .catch(() => {});
  }

  /** True when a recorded voice pack is in use. */
  get hasPack(): boolean {
    return this.pack !== null;
  }

  private pickVoices(): void {
    const voices = this.synth!.getVoices();
    const find = (tests: VoiceTest[]) => {
      for (const t of tests) {
        const v = voices.find((v) => t(v.lang.toLowerCase().replace(/_/g, '-'), v));
        if (v) return v;
      }
      return null;
    };
    this.enVoice = find(EN_TESTS);
    this.zhVoice = find(ZH_TESTS);
  }

  /** Speaks the lines one after another, interrupting anything already playing. Resolves when done. */
  say(lines: Line[]): Promise<void> {
    const synth = this.synth;
    if (lines.length === 0) return Promise.resolve();
    const my = ++this.token;
    music.setSpeaking(true);
    synth?.cancel();
    this.audio?.pause();
    this.keep = [];
    return new Promise((resolve) => {
      let i = 0;
      const next = () => {
        if (my !== this.token) return resolve();
        if (i >= lines.length) {
          music.setSpeaking(false);
          return resolve();
        }
        const l = lines[i++];
        const text = cleanSpeech(l.text); // never read emoji aloud ("party popper"…)
        if (!text) return next();
        // a recorded voice if we have one for this sentence, otherwise the phone's voice
        const key = voiceKey(text, l.lang);
        if (this.pack?.has(key)) return this.playFile(`voice/${key}.mp3`, text, my, next, () => tts());
        if (this.pack && import.meta.env.DEV) console.warn(`[voice] not recorded yet (${l.lang}): ${text}`);
        tts();

        function tts() {
          speakTTS(text, l.lang);
        }
      };
      const speakTTS = (text: string, lang: 'en' | 'zh') => {
        if (!synth || my !== this.token) return next();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang === 'zh' ? 'zh-CN' : 'en-US';
        const voice = lang === 'zh' ? this.zhVoice : this.enVoice;
        if (voice) u.voice = voice;
        u.rate = lang === 'zh' ? 0.85 : 0.9;
        u.pitch = 1.15;
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          clearTimeout(timer);
          next();
        };
        // Some devices never fire onend; don't let the game wait forever.
        const timer = setTimeout(finish, 2500 + text.length * 180);
        u.onend = finish;
        u.onerror = finish;
        this.keep.push(u);
        synth.speak(u);
      };
      next();
    });
  }

  /** Plays one recorded sentence; if the file can't play (e.g. offline and not cached yet), uses the phone voice. */
  private playFile(url: string, text: string, my: number, next: () => void, fallback: () => void): void {
    const a = (this.audio ??= new Audio());
    let settled = false;
    const settle = (fn: () => void) => {
      if (settled || my !== this.token) return;
      settled = true;
      clearTimeout(timer);
      a.onended = a.onerror = null;
      fn();
    };
    const timer = setTimeout(() => settle(next), 3000 + text.length * 250);
    a.onended = () => settle(next);
    a.onerror = () => settle(fallback);
    a.src = url;
    a.play().catch(() => settle(fallback));
  }

  stop(): void {
    this.token++;
    music.setSpeaking(false);
    this.synth?.cancel();
    this.audio?.pause();
  }

  get available(): boolean {
    return this.synth !== null;
  }
}

export const speech = new Speech();
