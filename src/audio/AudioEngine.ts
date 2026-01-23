/*
 * src/audio/AudioEngine.ts
 * This is the local backend that interprets the JSON.
 */

import type { PatchNode } from "../model/PatchTypes";

let nextX = 40;

export class AudioEngine {
  private nodes: PatchNode[] = [];
  private context: AudioContext;
  private analyser: AnalyserNode;
  private analyserData: Uint8Array;
  private outputGain: GainNode;
  private started = false;

  constructor() {
    this.context = new AudioContext();

    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyserData = new Uint8Array(this.analyser.frequencyBinCount);

    this.outputGain = this.context.createGain();
    this.outputGain.gain.value = 0.5;

    // analyser sits just before destination
    this.outputGain.connect(this.analyser);
    this.analyser.connect(this.context.destination);
  }

  async start() {
    
    if (this.started) return;

    // Must be called from a user gesture
    await this.context.resume();
    this.started = true;
  }

  addOscillator(freq: number) {
    const node: PatchNode = {
      id: crypto.randomUUID(),
      type: "oscillator",
      params: { frequency: freq, waveform: "sine" },
      x: nextX,
      y: 80,
    };

    nextX += 140;
    this.nodes.push(node);
    // temporary UI hook
    (this as any)._notifyAdd?.();

    return node;
  }

  addGain(value = 0.5) {
    const node: PatchNode = {
      id: crypto.randomUUID(),
      type: "gain",
      params: { value },
      x: nextX,   // default x
      y: 80,    // default y
    };

    nextX += 140;
    this.nodes.push(node);

    // temporary UI hook
    (this as any)._notifyAdd?.();

    return node;
  }

  deleteNode(nodeId: string) {
    this.nodes = this.nodes.filter(n => n.id !== nodeId);
  }

  playAll(duration = 3) {
    const now = this.context.currentTime;

    const gainNodes = this.nodes
      .filter(n => n.type === "gain")
      .map(n => {
        const g = this.context.createGain();
        g.gain.value = (n.params?.value as number) ?? 0.5;
        g.connect(this.outputGain);
        return g;
      });

    // fallback: if no gain exists, connect directly to output
    const targets = gainNodes.length ? gainNodes : [this.outputGain];

    this.nodes
      .filter(n => n.type === "oscillator")
      .forEach(n => {
        const osc = this.context.createOscillator();
        osc.type = (n.params?.waveform as OscillatorType) ?? "sine";
        osc.frequency.value = (n.params?.frequency as number) ?? 440;

        targets.forEach(t => osc.connect(t));
        osc.start(now);
        osc.stop(now + duration);
      });
  }

  get isStarted() {
    return this.started;
  }

  getNodes() {
    return this.nodes;
  }

  getAudioLevel(): number {
    this.analyserData = new Uint8Array(this.analyser.frequencyBinCount) as Uint8Array;


    // compute RMS
    let sum = 0;
    for (let i = 0; i < this.analyserData.length; i++) {
      const v = (this.analyserData[i] - 128) / 128;
      sum += v * v;
    }

    const rms = Math.sqrt(sum / this.analyserData.length);
    console.log("RMS:", rms);

    return rms; // 0..1A
  }

  
  setNodeFrequency(nodeId: string, frequency: number) {
    const node = this.nodes.find(n => n.id === nodeId);

    if (!node || node.type !== "oscillator") return;

    node.params = { ...node.params, frequency };
  }
}
