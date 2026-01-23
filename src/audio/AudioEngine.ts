/*
 * src/audio/AudioEngine.ts
 * This is the local backend that interprets the JSON.
 */

import { PatchNode } from "../model/PatchTypes";

let nextX = 40;

// export type OscillatorDef = {
//   id: string;
//   frequency: number;
//   type: OscillatorType;
// };

// export type GainDef = {
//   id: string;
//   value: number;
// };

// export type NodeKind = "osc" | "gain";

// export type NodeDef = {
//   id: string;
//   kind: NodeKind;
//   frequency?: number; // only for osc
//   type?: OscillatorType; // only for osc
//   value?: number; // only for gain
// };


export class AudioEngine {
  // private nodes: NodeDef[] = [];
  // private context: AudioContext;
  // private gain: GainNode;
  // private oscillators: OscillatorDef[] = [];
  // private gains: GainDef[] = [];
  // private analyser: AnalyserNode;
  // private analyserData: Uint8Array;
  // private outputGain: GainNode;

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

    // this.gain = this.context.createGain();
    // this.gain.gain.value = 0.5;
    // this.gain.connect(this.context.destination);
    // this.gain.connect(this.analyser);
    // this.analyser.connect(this.context.destination);

    this.outputGain = this.context.createGain();
    this.outputGain.gain.value = 0.5;

    // analyser sits just before destination
    this.outputGain.connect(this.analyser);
    this.analyser.connect(this.context.destination);

    // Default oscillator (440 Hz)
    // this.oscillators.push({
    //   id: "osc-440",
    //   frequency: 440,
    //   type: "sine",
    // });
  }

  async start() {
    
    if (this.started) return;
    // Must be called from a user gesture
    await this.context.resume();
    this.started = true;
  }


  addOscillator(freq: number) {
    // this.oscillators.push({
    //   id: crypto.randomUUID(),
    //   frequency: freq,
    //   type: "sine",
    // });

    // this.nodes.push({
    //   id: crypto.randomUUID(),
    //   kind: "osc",
    //   frequency: freq,
    //   type: "sine",
    // });


    // const node: NodeDef = {
    //   id: crypto.randomUUID(),
    //   kind: "osc",
    //   frequency: freq,
    //   type: "sine",
    // };

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
    // this.gains.push({
    //   id: crypto.randomUUID(),
    //   value,
    // });

    // this.nodes.push({
    //   id: crypto.randomUUID(),
    //   kind: "gain",
    //   value,
    // });

    // const node: NodeDef = {
    //   id: crypto.randomUUID(),
    //   kind: "gain",
    //   value,
    // };

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

    // create runtime gain nodes
    // const runtimeGains = this.gains.map(def => {
    //   const g = this.context.createGain();
    //   g.gain.value = def.value;
    //   g.connect(this.outputGain);
    //   return g;
    // });

    // const runtimeGains = this.nodes
    const gainNodes = this.nodes
      .filter(n => n.type === "gain")
      .map(n => {
        const g = this.context.createGain();
        g.gain.value = (n.params?.value as number) ?? 0.5;
        g.connect(this.outputGain);
        return g;
      });

    // fallback: if no gain exists, connect directly to output
    // const targets =
    //   runtimeGains.length > 0 ? runtimeGains : [this.outputGain];
    const targets = gainNodes.length ? gainNodes : [this.outputGain];


    // this.oscillators.forEach(def => {
    //   const osc = this.context.createOscillator();
    //   osc.type = def.type;
    //   osc.frequency.value = def.frequency;

    //   // osc.connect(this.gain);
    //   targets.forEach(t => osc.connect(t));

    //   osc.start(now);
    //   osc.stop(now + duration);
    // });

    // this.nodes
    //   .filter(n => n.kind === "osc")
    //   .forEach(def => {
    //     const osc = this.context.createOscillator();
    //     osc.type = def.type ?? "sine";
    //     osc.frequency.value = def.frequency ?? 440;

    //     targets.forEach(t => osc.connect(t));

    //     osc.start(now);
    //     osc.stop(now + duration);
    //   });

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


  // playTestTone() {
  //   const osc = this.context.createOscillator();
  //   const gain = this.context.createGain();

  //   osc.type = "sine";
  //   osc.frequency.value = 440;

  //   gain.gain.value = 0.5;

  //   // connect
  //   osc.connect(gain);
  //   gain.connect(this.context.destination);

  //   // play
  //   osc.start();

  //   // stop after 3 seconds
  //   osc.stop(this.context.currentTime + 3);
  // }

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
    console.log("RMS:", rms);

    return rms; // 0..1
  }

  
  setNodeFrequency(nodeId: string, frequency: number) {
    const node = this.nodes.find(n => n.id === nodeId);
    // if (!node || node.kind !== "osc") return;
    if (!node || node.type !== "oscillator") return;
    
    // node.frequency = frequency;
    node.params = { ...node.params, frequency };
  }
}
