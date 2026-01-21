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

  constructor() {
    this.context = new AudioContext();

    this.gain = this.context.createGain();
    this.gain.gain.value = 0.5;
    this.gain.connect(this.context.destination);

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
}
