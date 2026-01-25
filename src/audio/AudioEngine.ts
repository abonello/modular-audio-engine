/*
 * src/audio/AudioEngine.ts
 * This is the local backend that interprets the JSON.
 */

import type {
  Patch,
  PatchNode,
  EnvelopeNode,
  Waveform,
  FilterType,
  EnvelopeParams,
  TargetConnectionType
} from "../model/PatchTypes";


// let nextX = 40;
// let nextY = 80;

export class AudioEngine {
  private graphBuilt = false;
  private workspaceEl: HTMLElement | null = null;
  private nodes: PatchNode[] = [];
  private webNodes: Map<string, AudioNode> = new Map();
  private context: AudioContext;
  private analyser: AnalyserNode;
  private analyserData: Uint8Array<ArrayBuffer>;
  private destinationInput: GainNode;
  private started = false;
  private nextX = 80;
  private nextY = 80;
  private readonly INITIAL_X = 80;
  private readonly INITIAL_Y = 80;
  private readonly SPACING = 50;
  private readonly ROW_HEIGHT = 80;
  private readonly MAX_ROWS = 2;
  private readonly MARGIN = 120;

  private activeReleases: Map<string, () => void> = new Map();


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

  // private advanceNextPosition(workspaceRef: React.RefObject<HTMLDivElement>) {
  private advanceNextPosition() {
    // const workspaceWidth = window.innerWidth;
    // const workspaceWidth =
    //   workspaceRef.current?.getBoundingClientRect().width ?? window.innerWidth;
    const workspaceWidth = this.workspaceEl?.getBoundingClientRect().width ?? window.innerWidth;

    // const margin = 120;
    // const maxX = workspaceWidth - margin;
    const maxX = workspaceWidth - this.MARGIN;

    // this.nextX += 140;
    this.nextX += this.SPACING;

    if (this.nextX > maxX) {
      // this.nextX = 80;
      this.nextX = this.INITIAL_X;
      // this.nextY += 160;
      this.nextY += this.ROW_HEIGHT;
    }

    if (this.nextY > this.ROW_HEIGHT * this.MAX_ROWS) {
      this.nextY = this.INITIAL_Y;
      // this.nextY = 80;
    }
  }

  addOscillator(freq: number) {
    const node: PatchNode = {
      id: crypto.randomUUID(),
      type: "oscillator",
      params: { frequency: freq, waveform: "sine" },
      x: this.nextX,
      y: this.nextY,
      // x: nextX,
      // y: 80,
    };

    // nextX += 140;
    this.advanceNextPosition();
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
      x: this.nextX,
      y: this.nextY,
      // x: nextX,   // default x
      // y: 80,    // default y
    };

    // nextX += 140;
    this.advanceNextPosition();
    this.nodes.push(node);

    // temporary UI hook
    (this as any)._notifyAdd?.();

    return node;
  }

  addFilter() {
    const node: PatchNode = {
      id: crypto.randomUUID(),
      type: "filter",
      params: {
        type: "lowpass",
        cutoff: 1000,
        resonance: 1.5,
      },
      x: this.nextX,
      y: this.nextY,
      // x: nextX,
      // y: 80,
    };

    // nextX += 140;
    this.advanceNextPosition();
    this.nodes.push(node);

    (this as any)._notifyAdd?.();

    return node;
  }

  addEnvelope() {
    const node: PatchNode = {
      id: crypto.randomUUID(),
      type: "envelope",
      params: {
        attack: 1.5,
        decay: 0.5,
        sustain: 0.1,
        release: 0.2,
      },
      // params: {
      //   attack: 0.05,
      //   decay: 0.1,
      //   sustain: 0.7,
      //   release: 0.2,
      // },
      x: this.nextX,
      y: this.nextY,
      // x: nextX,
      // y: 80,
    };

    // nextX += 140;
    this.advanceNextPosition();
    this.nodes.push(node);
    (this as any)._notifyAdd?.();

    return node;
  }


  deleteNode(nodeId: string) {
    this.nodes = this.nodes.filter(n => n.id !== nodeId);
  }


  // private triggerEnvelope(nodeId: string) {
  //   const node = this.nodes.find(n => n.id === nodeId);
  //   if (!node || node.type !== "envelope") return;

  //   const envGain = this.webNodes.get(nodeId) as GainNode | undefined;
  //   if (!envGain) return;

  //   const now = this.context.currentTime;
  //   const { attack, decay, sustain, release } = node.params;

  //   envGain.gain.cancelScheduledValues(now);
  //   envGain.gain.setValueAtTime(0, now);

  //   // Attack
  //   envGain.gain.linearRampToValueAtTime(1, now + attack);

  //   // Decay
  //   envGain.gain.linearRampToValueAtTime(sustain, now + attack + decay);

  //   // Release
  //   const releaseStart = now + attack + decay; 
  //   envGain.gain.linearRampToValueAtTime(0, releaseStart + release);
  // }

  // private connectControl(controlNode: AudioNode, targetParam: AudioParam) {
  //   // For now, we only support Envelope nodes.
  //   // The envelope output will be connected to the target parameter.

  //   controlNode.connect(targetParam);
  // }

  private applyEnvelopeToParam(envNode: EnvelopeNode, param: AudioParam, now: number) {
    const { attack, decay, sustain } = envNode.params;

    param.cancelScheduledValues(now);
    param.setValueAtTime(0, now);

    // Attack
    param.linearRampToValueAtTime(1, now + attack);

    // Decay
    param.linearRampToValueAtTime(sustain, now + attack + decay);

    // Return release callback
    return () => this.releaseEnvelopeOnParam(envNode, param, this.context.currentTime);
  }

  private releaseEnvelopeOnParam(envNode: EnvelopeNode, param: AudioParam, now: number) {
    const { release } = envNode.params;

    // Release starts from current value
    param.cancelScheduledValues(now);
    param.setValueAtTime(param.value, now);
    param.linearRampToValueAtTime(0, now + release);
  }

  private buildPatchNodes(patch: Patch) {
    this.webNodes.clear();

    patch.nodes.forEach((n) => {
      if (n.type === "oscillator") {
        const osc = this.context.createOscillator();
        osc.type = (n.params?.waveform as OscillatorType) ?? "sine";
        osc.frequency.value = (n.params?.frequency as number) ?? 440;
        this.webNodes.set(n.id, osc);
      }

      if (n.type === "gain") {
        const g = this.context.createGain();
        g.gain.value = (n.params?.value as number) ?? 0.5;
        this.webNodes.set(n.id, g);
      }

      if (n.type === "destination") {
        this.webNodes.set(n.id, this.destinationInput);
      }

      if (n.type === "filter") {
        const filter = this.context.createBiquadFilter();
        filter.type = n.params.type;
        filter.frequency.value = n.params.cutoff;
        filter.Q.value = n.params.resonance;
        this.webNodes.set(n.id, filter);
      }

      // if (n.type === "envelope") {
      //   const envGain = this.context.createGain();
      //   envGain.gain.value = 0;
      //   this.webNodes.set(n.id, envGain);
      // }
    });
  }

  private connectPatch(patch: Patch) {
    patch.connections.forEach((c) => {
      const fromNode = this.webNodes.get(c.from);
      const toNode = this.webNodes.get(c.to);

      if (!fromNode || !toNode) return;

      if (c.type === "audio") {
        fromNode.connect(toNode);
      }

      if (c.type === "control") {
        const envNode = patch.nodes.find(n => n.id === c.from);
        if (!envNode || envNode.type !== "envelope") return;

        const targetParam = this.getAudioParam(toNode, c.target);
        if (!targetParam) return;

        const releaseFn = this.applyEnvelopeToParam(envNode, targetParam, this.context.currentTime);
        this.activeReleases.set(c.id, releaseFn);
      }
    });
  }

  public rebuildPatchGraph(patch: Patch) {
    this.webNodes.clear();
    this.graphBuilt = false;
    this.buildPatchNodes(patch);
    this.connectPatch(patch);
    this.graphBuilt = true;
  }


  

  // public noteOn(noteId: string, frequency: number) {
  public noteOn(patch: Patch, frequency: number, velocity = 1) {
    const now = this.context.currentTime;

    // build nodes once
    // if (this.webNodes.size === 0) {
    if (!this.graphBuilt) {
      this.buildPatchNodes(patch);
      this.connectPatch(patch);
      this.graphBuilt = true;
    }

    console.log("noteOn called", { frequency, nodes: patch.nodes.length, timeNow: now });
    console.log("webNodes", this.webNodes);
    console.log("connections", patch.connections);

    // 1) Set frequency for all oscillators
    // this.nodes
    patch.nodes
      .filter(n => n.type === "oscillator")
      .forEach(n => {
        const osc = this.webNodes.get(n.id) as OscillatorNode;
        if (!osc) return;
        osc.type = (n.params?.waveform as OscillatorType) ?? "sine";
        osc.frequency.setValueAtTime(frequency, now);
        // (osc as any).startCalled = true;

        // start oscillator once
        if (!(osc as any).startCalled) {
          osc.start();
          (osc as any).startCalled = true;
        }
      });

    // trigger envelopes and store release functions
    // this.connections
    //   .filter(c => c.type === "control")
    //   .forEach(c => {
    //     const envNode = this.nodes.find(n => n.id === c.from);
    //     if (!envNode || envNode.type !== "envelope") return;

    //     const targetNode = this.webNodes.get(c.to);
    //     if (!targetNode) return;

    //     const targetParam = this.getAudioParam(targetNode, c.target);
    //     if (!targetParam) return;

    //     const releaseFn = this.applyEnvelopeToParam(envNode, targetParam, now);
    //     this.activeReleases.set(c.id, releaseFn);
    //   });

      // 2) Apply envelope for each control connection
      patch.connections
        .filter(c => c.type === "control")
        .forEach((c) => {
          const envNode = patch.nodes.find(n => n.id === c.from);
          if (!envNode || envNode.type !== "envelope") return;

          const targetNode = this.webNodes.get(c.to);
          if (!targetNode) return;

          const targetParam = this.getAudioParam(targetNode, c.target);
          if (!targetParam) return;

          const releaseFn = this.applyEnvelopeToParam(envNode, targetParam, now);
          this.activeReleases.set(c.id, releaseFn);
        });
  }

  // public noteOff(noteId: string) {
  public noteOff() {
    const now = this.context.currentTime;

    // call all release functions
    this.activeReleases.forEach((releaseFn, id) => {
      releaseFn();
      this.activeReleases.delete(id);
    });
  }

  stopAllOscillators() {
    console.log("Stop All Oscillators")
    this.webNodes.forEach((node) => {
      if (node instanceof OscillatorNode) {
        try {
          node.stop();
        } catch (e) {
          // ignore if already stopped
        }
      }
    });
  }

  public panic() {
    const now = this.context.currentTime;

    this.webNodes.forEach((node) => {
      // 1. Kill all gain nodes immediately
      if (node instanceof GainNode) {
        try {
          node.gain.cancelScheduledValues(now);
          node.gain.setValueAtTime(0, now);
        } catch {
          // ignore
        }
      }

      // 2. Stop oscillators
      // if (node instanceof OscillatorNode) {
      //   try {
      //     node.stop();
      //   } catch {
      //     // ignore
      //   }
      // }
      for (const node of this.webNodes.values()) {
        if (node instanceof OscillatorNode) {
          try {
            node.stop();
          } catch {
            // already stopped — ignore
          }
        }
      }

      // 3. Disconnect everything
      // try {
      //   node.disconnect();
      // } catch {
      //   // ignore
      // }

      for (const node of this.webNodes.values()) {
        try {
          node.disconnect();
        } catch {
          // some nodes may already be disconnected
        }
      }

    });

    // Optional but recommended:
    this.webNodes.clear();
    this.graphBuilt = false;
  }





  // playAll(patch: Patch, duration = 3) {
  //   const now = this.context.currentTime;

  //   // Map patch nodes to WebAudio objects
  //   // const webNodes = new Map<string, AudioNode>();
  //   // this.webNodes = new Map();
  //   // Reset web nodes map BEFORE building new nodes
  //   this.webNodes.clear();

  //   // First pass: create WebAudio nodes
  //   patch.nodes.forEach((n) => {
  //     if (n.type === "oscillator") {
  //       const osc = this.context.createOscillator();
  //       osc.type = (n.params?.waveform as OscillatorType) ?? "sine";
  //       osc.frequency.value = (n.params?.frequency as number) ?? 440;
  //       this.webNodes.set(n.id, osc);
  //     }

  //     if (n.type === "gain") {
  //       const g = this.context.createGain();
  //       g.gain.value = (n.params?.value as number) ?? 0.5;
  //       this.webNodes.set(n.id, g);
  //     }

  //     if (n.type === "destination") {
  //       this.webNodes.set(n.id, this.destinationInput);
  //     }

  //     if (n.type === "filter") {
  //       const filter = this.context.createBiquadFilter();
  //       filter.type = n.params.type;
  //       filter.frequency.value = n.params.cutoff;
  //       filter.Q.value = n.params.resonance;
  //       this.webNodes.set(n.id, filter);
  //     }

  //     // if (n.type === "envelope") {
  //     //   const envGain = this.context.createGain();
  //     //   envGain.gain.value = 0; // starts silent
  //     //   this.webNodes.set(n.id, envGain);
  //     // }
  //   });

  //   // Second pass: connect according to patch.connections
  //   // patch.connections.forEach((c) => {
  //   //   const fromNode = webNodes.get(c.from);
  //   //   const toNode = webNodes.get(c.to);

  //   //   if (fromNode && toNode) {
  //   //     fromNode.connect(toNode);
  //   //   }
  //   // });
  //   patch.connections.forEach((c) => {
  //     // const fromNode = this.webNodes.get(c.from);
  //     // const fromNode = patch.nodes.find(n => n.id === c.from);
  //     const toNode = this.webNodes.get(c.to);

  //     // if (!fromNode || !toNode) return;
  //     if (!toNode) return;

  //     if (c.type === "audio") {
  //       const fromNode = this.webNodes.get(c.from);
  //       if (!fromNode) return;
  //       fromNode.connect(toNode);
  //     }

  //     if (c.type === "control") {
  //       const envNode = patch.nodes.find(n => n.id === c.from);
  //       if (!envNode || envNode.type !== "envelope") return;

  //       const targetParam = this.getAudioParam(toNode, c.target);
  //       if (!targetParam) {
  //         console.warn(`Control connection target missing or invalid for connection ${c.id}`);
  //         return;
  //       }

  //       // this.connectControl(fromNode, targetParam);

  //       // trigger envelope
  //       // this.triggerEnvelope(c.from);

  //       this.applyEnvelopeToParam(envNode, targetParam, now);
  //     }
  //   });

  //   // after connecting all nodes... / before oscillators play
  //   // patch.nodes
  //   //   .filter(n => n.type === "envelope")
  //   //   .forEach(n => this.triggerEnvelope(n.id));

  //   // start all oscillators
  //   patch.nodes
  //     .filter(n => n.type === "oscillator")
  //     .forEach((n) => {
  //       const osc = this.webNodes.get(n.id) as OscillatorNode;
  //       osc.start(now);
  //       osc.stop(now + duration);
  //     });
  // }


  playAll(patch: Patch, duration = 3) {
    const now = this.context.currentTime;
    this.webNodes.clear();

    // First pass: create WebAudio nodes
    patch.nodes.forEach((n) => {
      if (n.type === "oscillator") {
        const osc = this.context.createOscillator();
        osc.type = (n.params?.waveform as OscillatorType) ?? "sine";
        osc.frequency.value = (n.params?.frequency as number) ?? 440;
        this.webNodes.set(n.id, osc);
      }

      if (n.type === "gain") {
        const g = this.context.createGain();
        g.gain.value = (n.params?.value as number) ?? 0.5;
        this.webNodes.set(n.id, g);
      }

      if (n.type === "destination") {
        this.webNodes.set(n.id, this.destinationInput);
      }

      if (n.type === "filter") {
        const filter = this.context.createBiquadFilter();
        filter.type = n.params.type;
        filter.frequency.value = n.params.cutoff;
        filter.Q.value = n.params.resonance;
        this.webNodes.set(n.id, filter);
      }
    });

    // Second pass: connect according to patch.connections
    patch.connections.forEach((c) => {
      const toNode = this.webNodes.get(c.to);
      if (!toNode) return;

      if (c.type === "audio") {
        const fromNode = this.webNodes.get(c.from);
        if (!fromNode) return;
        fromNode.connect(toNode);
      }

      if (c.type === "control") {
        const envNode = patch.nodes.find(n => n.id === c.from);
        if (!envNode || envNode.type !== "envelope") return;

        const targetParam = this.getAudioParam(toNode, c.target);
        if (!targetParam) {
          console.warn(`Control connection target missing or invalid for connection ${c.id}`);
          return;
        }

        this.applyEnvelopeToParam(envNode, targetParam, now);
      }
    });

    // start all oscillators
    patch.nodes
      .filter(n => n.type === "oscillator")
      .forEach((n) => {
        const osc = this.webNodes.get(n.id) as OscillatorNode;
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

  private getAudioParam(node: AudioNode, target?: TargetConnectionType): AudioParam | null {
    if (!target) return null;

    // Gain node
    if (node instanceof GainNode && target === "gain") {
      return node.gain;
    }

    // Oscillator node
    if (node instanceof OscillatorNode && target === "frequency") {
      return node.frequency;
    }

    // Filter node
    if (node instanceof BiquadFilterNode) {
      if (target === "cutoff") return node.frequency;
      if (target === "resonance") return node.Q;
    }

    return null;
  }



  setWorkspaceElement(el: HTMLElement | null) {
    this.workspaceEl = el;
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

  setNodeFilterType(nodeId: string, type: FilterType) {
    const node = this.nodes.find(n => n.id === nodeId);
    if (!node || node.type !== "filter") return;
    node.params = { ...node.params, type };
  }

  setNodeFilterCutoff(nodeId: string, cutoff: number) {
    const node = this.nodes.find(n => n.id === nodeId);
    if (!node || node.type !== "filter") return;
    node.params = { ...node.params, cutoff };
  }

  setNodeFilterResonance(nodeId: string, resonance: number) {
    const node = this.nodes.find(n => n.id === nodeId);
    if (!node || node.type !== "filter") return;
    node.params = { ...node.params, resonance };
    console.log("Resonance set to:", resonance);
  }

  setNodeFilter(nodeId: string, type: FilterType, cutoff: number, resonance: number) {
    const node = this.nodes.find(n => n.id === nodeId);
    if (!node || node.type !== "filter") return;

    console.log("Resonance set to:", resonance);

    node.params = {
      ...node.params,
      type,
      cutoff,
      resonance,
    };
  }

  setEnvelopeParams(nodeId: string, params: EnvelopeParams) {
    const node = this.nodes.find((n) => n.id === nodeId);
    if (!node || node.type !== "envelope") return;

    node.params = { ...node.params, ...params };
  }
}
