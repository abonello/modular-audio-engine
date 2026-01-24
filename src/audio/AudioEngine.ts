/*
 * src/audio/AudioEngine.ts
 * This is the local backend that interprets the JSON.
 */

import type { Patch, PatchNode } from "../model/PatchTypes";

let nextX = 40;

export class AudioEngine {
  private nodes: PatchNode[] = [];
  private context: AudioContext;
  private analyser: AnalyserNode;
  // private analyserData: Uint8Array; 
  private analyserData: Uint8Array<ArrayBuffer>;
  // private outputGain: GainNode;
  private destinationInput: GainNode;
  private started = false;

  constructor() {
    this.context = new AudioContext();

    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 2048;
    // this.analyserData = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyserData = new Uint8Array(this.analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;

    // this.outputGain = this.context.createGain();
    // this.outputGain.gain.value = 0.5;

    // // analyser sits just before destination
    // this.outputGain.connect(this.analyser);


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

    // const gainNodes = this.nodes
    //   .filter(n => n.type === "gain")
    //   .map(n => {
    //     const g = this.context.createGain();
    //     g.gain.value = (n.params?.value as number) ?? 0.5;
    //     g.connect(this.outputGain);
    //     return g;
    //   });

    // // fallback: if no gain exists, connect directly to output
    // const targets = gainNodes.length ? gainNodes : [this.outputGain];

    // this.nodes
    //   .filter(n => n.type === "oscillator")
    //   .forEach(n => {
    //     const osc = this.context.createOscillator();
    //     osc.type = (n.params?.waveform as OscillatorType) ?? "sine";
    //     osc.frequency.value = (n.params?.frequency as number) ?? 440;

    //     targets.forEach(t => osc.connect(t));
    //     osc.start(now);
    //     osc.stop(now + duration);
    //   });


    // create a map of patch nodes
    // const nodeMap = new Map<string, AudioNode>();

    // Map patch nodes to WebAudio objects
    const webNodes = new Map<string, AudioNode>();

    // create audio nodes for each patch node
    // patch.nodes.forEach((n) => {
    //   if (n.type === "oscillator") {
    //     const osc = this.context.createOscillator();
    //     osc.type = n.params.waveform as OscillatorType;
    //     osc.frequency.value = n.params.frequency;
    //     nodeMap.set(n.id, osc);
    //   } else if (n.type === "gain") {
    //     const gain = this.context.createGain();
    //     gain.gain.value = n.params.value;
    //     nodeMap.set(n.id, gain);
    //   }
    // });

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
        // webNodes.set(n.id, this.outputGain);
        webNodes.set(n.id, this.destinationInput);
      }
    });

    // connect nodes based on patch connections
    // patch.connections.forEach((c) => {
    //   const from = nodeMap.get(c.from);
    //   const to = nodeMap.get(c.to);
    //   if (from && to) from.connect(to);
    // });

    // Second pass: connect according to patch.connections
    patch.connections.forEach((c) => {
      const fromNode = webNodes.get(c.from);
      const toNode = webNodes.get(c.to);

      if (fromNode && toNode) {
        fromNode.connect(toNode);
      }
    });

    // connect any nodes that have no output to the final output gain
    // (this part is optional, but useful)
    // patch.nodes.forEach((n) => {
    //   if (n.type === "gain") {
    //     const gainNode = nodeMap.get(n.id) as GainNode;
    //     gainNode.connect(this.outputGain);
    //   }
    // });

    // start all oscillators
    patch.nodes
      .filter(n => n.type === "oscillator")
      .forEach((n) => {
        // const osc = nodeMap.get(n.id) as OscillatorNode;
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

  // getAudioLevel(): number {
  //   // this.analyserData = new Uint8Array(this.analyser.frequencyBinCount) as Uint8Array;
  //   this.analyser.getByteTimeDomainData(this.analyserData);

  //   // compute RMS
  //   let sum = 0;
  //   for (let i = 0; i < this.analyserData.length; i++) {
  //     const v = (this.analyserData[i] - 128) / 128;
  //     sum += v * v;
  //   }

  //   const rms = Math.sqrt(sum / this.analyserData.length);
  //   console.log("RMS:", rms);

  //   return rms; // 0..1A
  // }

  getAudioLevel(): number {
    // this.analyser.getByteTimeDomainData(this.analyserData);
    this.analyser.getByteTimeDomainData(this.analyserData);
    // this.analyserData = new Uint8Array(this.analyser.frequencyBinCount) as Uint8Array;
    // this.analyserData = new Uint8Array(this.analyser.frequencyBinCount) as unknown as Uint8Array;


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
}
