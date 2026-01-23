/* 
 * src/model/PatchTypes.ts
 * This is where the JSON schema that the editor will build and the engine will interpret are define.
 */

export type NodeType =
  | "oscillator"
  | "gain"
  | "filter"
  | "splitter"
  | "combiner"
  | "destination";

export type Waveform = "sine" | "square" | "sawtooth" | "triangle";

export type FilterType = "lowpass" | "highpass" | "bandpass";

export type NodeParam = {
  [key: string]: number | string | boolean;
};

export type OscillatorParams = {
  frequency: number;
  waveform: string;
};

export type GainParams = {
  value: number;
};

export type OscillatorNode = {
  id: string;
  type: "oscillator";
  params: OscillatorParams;
  x?: number;
  y?: number;
};

export type GainNode = {
  id: string;
  type: "gain";
  params: GainParams;
  x?: number;
  y?: number;
};

export type PatchNode = OscillatorNode | GainNode;

export type PatchConnection = {
  from: string;
  to: string;
};

export type Patch = {
  version: string;
  name: string; 
  nodes: PatchNode[];
  connections: PatchConnection[];
};

export const isOscillatorNode = (n: PatchNode): n is OscillatorNode =>
  n.type === "oscillator";

export const isGainNode = (n: PatchNode): n is GainNode =>
  n.type === "gain";
