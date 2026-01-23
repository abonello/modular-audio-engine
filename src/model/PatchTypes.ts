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

export type PatchNode = {
  id: string;
  type: NodeType;
  params?: NodeParam;
  x?: number;
  y?: number;
};

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


export const isOsc = (n: PatchNode): n is PatchNode & { type: "oscillator" } =>
  n.type === "oscillator";

export const isGain = (n: PatchNode): n is PatchNode & { type: "gain" } =>
  n.type === "gain";