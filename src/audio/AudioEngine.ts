/*
 * src/audio/AudioEngine.ts
 * This is the local backend that interprets the JSON.
 */

import type { Patch, PatchNode, Waveform } from "../model/PatchTypes";

let nextX = 40;

export class AudioEngine {
  private nodes: PatchNode[] = [];
  private context: AudioContext;
  private analyser: AnalyserNode;
  private analyserData: Uint8Array<ArrayBuffer>;
  private destinationInput: GainNode;
  private started = false;

  constructor() {
    this.context = new AudioContext();

    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyserData = new Uint8Array(this.analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;

    // Internal destination input node
    this.destinationInput = this.context.createGain();
    this.destinationInput.gain.value = 1;

    // chain: destinationInput -> analyser -> real destination
    this.destinationInput.connect(this.analyser);
    console.log("Analyser node:", this.analyser);
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

  playAll(patch: Patch, duration = 3) {
    const now = this.context.currentTime;

    // Map patch nodes to WebAudio objects
    const webNodes = new Map<string, AudioNode>();

    // First pass: create WebAudio nodes
    patch.nodes.forEach((n) => {
      if (n.type === "oscillator") {
        const osc = this.context.createOscillator();
        osc.type = (n.params?.waveform as OscillatorType) ?? "sine";
        osc.frequency.value = (n.params?.frequency as number) ?? 440;
        webNodes.set(n.id, osc);
      }

      if (n.type === "gain") {
        const g = this.context.createGain();
        g.gain.value = (n.params?.value as number) ?? 0.5;
        webNodes.set(n.id, g);
      }

      if (n.type === "destination") {
        webNodes.set(n.id, this.destinationInput);
      }
    });

    // Second pass: connect according to patch.connections
    patch.connections.forEach((c) => {
      const fromNode = webNodes.get(c.from);
      const toNode = webNodes.get(c.to);

      if (fromNode && toNode) {
        fromNode.connect(toNode);
      }
    });

    // start all oscillators
    patch.nodes
      .filter(n => n.type === "oscillator")
      .forEach((n) => {
        const osc = webNodes.get(n.id) as OscillatorNode;
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
    this.analyser.getByteTimeDomainData(this.analyserData);

    // compute RMS
    let sum = 0;
    for (let i = 0; i < this.analyserData.length; i++) {
      const v = (this.analyserData[i] - 128) / 128;
      sum += v * v;
    }

    const rms = Math.sqrt(sum / this.analyserData.length);

    return rms;
  }

  
  setNodeFrequency(nodeId: string, frequency: number) {
    const node = this.nodes.find(n => n.id === nodeId);

    if (!node || node.type !== "oscillator") return;

    node.params = { ...node.params, frequency };
  }

  setNodeWaveform(nodeId: string, waveform: Waveform) {
    const node = this.nodes.find(n => n.id === nodeId);
    if (!node || node.type !== "oscillator") return;

    node.params = { ...node.params, waveform };
  }
}
