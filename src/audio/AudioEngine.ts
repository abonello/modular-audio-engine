/*
 * src/audio/AudioEngine.ts
 * This is the local backend that interprets the JSON.
 */

export type OscillatorDef = {
  id: string;
  frequency: number;
  type: OscillatorType;
};


export class AudioEngine {
  private context: AudioContext;
  private gain: GainNode;
  private oscillators: OscillatorDef[] = [];
  private analyser: AnalyserNode;
  private analyserData: Uint8Array;

  constructor() {
    this.context = new AudioContext();

    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyserData = new Uint8Array(this.analyser.frequencyBinCount);

    this.gain = this.context.createGain();
    this.gain.gain.value = 0.5;
    // this.gain.connect(this.context.destination);
    this.gain.connect(this.analyser);
    this.analyser.connect(this.context.destination);

    // Default oscillator (440 Hz)
    this.oscillators.push({
      id: "osc-440",
      frequency: 440,
      type: "sine",
    });
  }

  async start() {
    // Must be called from a user gesture
    await this.context.resume();
  }

  addOscillator(freq: number) {
    this.oscillators.push({
      id: crypto.randomUUID(),
      frequency: freq,
      type: "sine",
    });

    // temporary UI hook
    (this as any)._notifyAdd?.();
  }

  playAll(duration = 3) {
    const now = this.context.currentTime;

    this.oscillators.forEach(def => {
      const osc = this.context.createOscillator();
      osc.type = def.type;
      osc.frequency.value = def.frequency;

      osc.connect(this.gain);

      osc.start(now);
      osc.stop(now + duration);
    });
  }

  playTestTone() {
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = "sine";
    osc.frequency.value = 440;

    gain.gain.value = 0.5;

    // connect
    osc.connect(gain);
    gain.connect(this.context.destination);

    // play
    osc.start();

    // stop after 3 seconds
    osc.stop(this.context.currentTime + 3);
  }

  getAudioLevel(): number {
    this.analyser.getByteTimeDomainData(this.analyserData);

    // compute RMS
    let sum = 0;
    for (let i = 0; i < this.analyserData.length; i++) {
      const v = (this.analyserData[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / this.analyserData.length);
    console.log("RMS:", rms);

    return rms; // 0..1
  }
}
