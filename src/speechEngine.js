/**
 * SpeechEngine — Wraps the Web Speech API (SpeechSynthesis).
 * Queue-based so announcements never overlap.
 * Tuned for low pitch + slow rate for a dramatic "God" voice.
 */

class SpeechEngine {
  constructor() {
    this.queue = [];
    this.speaking = false;
    this.enabled = true;
    this.voices = [];
    this.preferredVoice = null;

    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        this.voices = window.speechSynthesis.getVoices();
        this.preferredVoice = this._pickVoice();
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  _pickVoice() {
    const preferred = [
      'Google UK English Male',
      'Microsoft David Desktop',
      'Alex',
      'Daniel',
      'Google US English',
    ];
    for (const name of preferred) {
      const v = this.voices.find((v) => v.name === name);
      if (v) return v;
    }
    // Fall back to first English voice
    return this.voices.find((v) => /en/i.test(v.lang)) || this.voices[0] || null;
  }

  speak(text, callback) {
    this.queue.push({ text, callback });
    if (!this.speaking) this._processQueue();
  }

  speakQueue(texts, onAllDone) {
    const wrapped = texts.map((t, i) => ({
      text: t,
      callback: i === texts.length - 1 ? onAllDone : null,
    }));
    this.queue.push(...wrapped);
    if (!this.speaking) this._processQueue();
  }

  _processQueue() {
    if (this.queue.length === 0) {
      this.speaking = false;
      return;
    }
    this.speaking = true;
    const { text, callback } = this.queue.shift();

    if (!this.enabled || !('speechSynthesis' in window)) {
      if (callback) callback();
      this._processQueue();
      return;
    }

    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    if (this.preferredVoice) utt.voice = this.preferredVoice;
    utt.pitch = 0.82;
    utt.rate = 0.88;
    utt.volume = 1;

    utt.onend = () => {
      if (callback) callback();
      setTimeout(() => this._processQueue(), 300);
    };
    utt.onerror = () => {
      if (callback) callback();
      setTimeout(() => this._processQueue(), 300);
    };

    window.speechSynthesis.speak(utt);
  }

  cancel() {
    this.queue = [];
    this.speaking = false;
    window.speechSynthesis.cancel();
  }

  setEnabled(val) {
    this.enabled = val;
  }
}

export const speechEngine = new SpeechEngine();
