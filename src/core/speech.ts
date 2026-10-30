// Text-to-speech using the phone's built-in voices (Google TTS on Android).
// English uses an en-US voice, Chinese uses a Mandarin zh-CN voice.
import type { Lang } from './lang';

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

  constructor() {
    if (!this.synth) return;
    this.pickVoices();
    this.synth.onvoiceschanged = () => this.pickVoices();
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
    if (!synth || lines.length === 0) return Promise.resolve();
    const my = ++this.token;
    synth.cancel();
    this.keep = [];
    return new Promise((resolve) => {
      let i = 0;
      const next = () => {
        if (my !== this.token || i >= lines.length) return resolve();
        const l = lines[i++];
        // never read emoji aloud ("party popper"…)
        const text = l.text.replace(/[\p{Extended_Pictographic}️‍]/gu, '').trim();
        if (!text) return next();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = l.lang === 'zh' ? 'zh-CN' : 'en-US';
        const voice = l.lang === 'zh' ? this.zhVoice : this.enVoice;
        if (voice) u.voice = voice;
        u.rate = l.lang === 'zh' ? 0.85 : 0.9;
        u.pitch = 1.15;
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          clearTimeout(timer);
          next();
        };
        // Some devices never fire onend; don't let the game wait forever.
        const timer = setTimeout(finish, 2500 + l.text.length * 180);
        u.onend = finish;
        u.onerror = finish;
        this.keep.push(u);
        synth.speak(u);
      };
      next();
    });
  }

  stop(): void {
    this.token++;
    this.synth?.cancel();
  }

  get available(): boolean {
    return this.synth !== null;
  }
}

export const speech = new Speech();
