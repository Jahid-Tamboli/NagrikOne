/**
 * NagrikOne Speech-to-Text (STT) Engine
 * Listens to microphone input, computes transcripts, and handles interruptions.
 */

export interface STTOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (err: any) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

class NovaSTTEngine {
  private recognition: any = null;
  private isListening: boolean = false;
  private currentTranscript: string = '';

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
      }
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public startListening(options: STTOptions = {}): boolean {
    if (!this.recognition) {
      if (options.onError) options.onError('Speech recognition not supported in this browser.');
      return false;
    }

    // Stop any existing session
    this.stopListening();

    this.currentTranscript = '';
    this.recognition.lang = options.lang || 'en-IN';
    this.recognition.continuous = options.continuous !== undefined ? options.continuous : false;
    this.recognition.interimResults = options.interimResults !== undefined ? options.interimResults : true;
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.isListening = true;
      if (options.onStart) options.onStart();
    };

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const text = final || interim;
      this.currentTranscript = text;

      if (options.onResult) {
        options.onResult(text, !!final);
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      if (options.onError) {
        options.onError(event.error || event);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (options.onEnd) options.onEnd();
    };

    try {
      this.recognition.start();
      return true;
    } catch (e) {
      this.isListening = false;
      if (options.onError) options.onError(e);
      return false;
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.isListening = false;
  }

  public listening(): boolean {
    return this.isListening;
  }
}

export const novaSTT = new NovaSTTEngine();
