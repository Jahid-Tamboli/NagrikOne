/**
 * NagrikOne Audio Analyzer
 * Captures microphone stream via Web Audio API and computes smoothed amplitude (0.0 to 1.0)
 * to drive the living 3D NOVA Core.
 */

export class MicAudioAnalyzer {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private dataArray: Uint8Array | null = null;
  private isAnalyzing: boolean = false;

  public async start(): Promise<boolean> {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return false;
    }

    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      
      const source = this.audioCtx.createMediaStreamSource(this.micStream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      source.connect(this.analyser);
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.isAnalyzing = true;
      return true;
    } catch (e) {
      console.warn('Microphone access or audio context initialization failed:', e);
      this.stop();
      return false;
    }
  }

  public getAmplitude(): number {
    if (!this.isAnalyzing || !this.analyser || !this.dataArray) {
      return 0;
    }

    (this.analyser as any).getByteFrequencyData(this.dataArray);
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    const avg = sum / this.dataArray.length;
    // Normalize to 0..1 range with a sensible boost
    return Math.min(1.0, Math.max(0.0, (avg / 128.0) * 1.5));
  }

  public stop() {
    this.isAnalyzing = false;
    if (this.micStream) {
      this.micStream.getTracks().forEach(track => track.stop());
      this.micStream = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
      this.audioCtx = null;
    }
    this.analyser = null;
    this.dataArray = null;
  }
}
