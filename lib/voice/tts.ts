/**
 * NagrikOne Voice & Text-to-Speech Engine
 * Personality: Young adult female, warm, friendly, intelligent, calm, reassuring, Indian-friendly English / Hinglish
 */

export interface TTSOptions {
  rate?: number;
  pitch?: number;
  lang?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
  onBoundary?: (charIndex: number) => void;
}

class NovaVoiceEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking: boolean = false;
  private selectedVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  private initVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return;

    // Prefer Indian English female or natural female voices
    const preferred = voices.find(v => 
      (v.lang.includes('en-IN') || v.lang.includes('hi-IN') || v.name.toLowerCase().includes('india')) &&
      (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('swara') || v.name.toLowerCase().includes('geeta') || v.name.toLowerCase().includes('priya') || v.name.toLowerCase().includes('neerja'))
    ) || voices.find(v => 
      v.lang.includes('en-IN')
    ) || voices.find(v => 
      v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('karen') || v.name.toLowerCase().includes('victoria')
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

    this.selectedVoice = preferred || null;
  }

  public speak(text: string, options: TTSOptions = {}): boolean {
    if (!this.synth) {
      if (options.onError) options.onError('Speech synthesis not supported in this environment');
      return false;
    }

    // Cancel any ongoing speech for instantaneous interruption
    this.stop();

    if (!text || !text.trim()) return false;

    try {
      const utterance = new SpeechSynthesisUtterance(text.trim());
      
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }
      
      utterance.rate = options.rate ?? 1.02; // Warm, natural cadence
      utterance.pitch = options.pitch ?? 1.05; // Friendly, intelligent tone
      utterance.lang = options.lang ?? (this.selectedVoice?.lang || 'en-IN');

      utterance.onstart = () => {
        this.isSpeaking = true;
        if (options.onStart) options.onStart();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        if (options.onEnd) options.onEnd();
      };

      utterance.onerror = (e) => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        if (options.onError) options.onError(e);
      };

      if (options.onBoundary) {
        utterance.onboundary = (e) => {
          options.onBoundary?.(e.charIndex);
        };
      }

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
      return true;
    } catch (err) {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (options.onError) options.onError(err);
      return false;
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    this.currentUtterance = null;
  }

  public speaking(): boolean {
    return this.isSpeaking || (this.synth ? this.synth.speaking : false);
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synth ? this.synth.getVoices() : [];
  }
}

export const novaVoice = new NovaVoiceEngine();
