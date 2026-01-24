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

// export type Waveform = "sine" | "square" | "sawtooth" | "triangle";
export type Waveform = Exclude<OscillatorType, "custom">;

// export type FilterType = "lowpass" | "highpass" | "bandpass";
export type FilterType = "lowpass" | "highpass";

export type NodeParam = {
  [key: string]: number | string | boolean;
};

export type OscillatorParams = {
  frequency: number;
  waveform: Waveform;
};

export type GainParams = {
  value: number;
};

export type FilterParams = {
  type: FilterType;
  cutoff: number;
  resonance: number;
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

export type DestinationNode = {
  id: string;
  type: "destination";
  x?: number;
  y?: number;
};

export type FilterNode = {
  id: string;
  type: "filter";
  params: FilterParams;
  x?: number;
  y?: number;
};

export type PatchNode = OscillatorNode | GainNode | FilterNode | DestinationNode;

export type PatchConnection = {
  id: string;
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

export const isDestinationNode = (n: PatchNode): n is DestinationNode =>
  n.type === "destination";

export const isFilterNode = (n: PatchNode): n is FilterNode =>
  n.type === "filter";
