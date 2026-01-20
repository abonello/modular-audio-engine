/*
 * src/audio/AudioEngine.ts
 * This is the local backend that interprets the JSON.
 */

import { Patch } from "../model/PatchTypes";


export class AudioEngine {
  private context: AudioContext;

  constructor() {
    this.context = new AudioContext();
  }

  async start() {
    // Must be called from a user gesture
    await this.context.resume();
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
