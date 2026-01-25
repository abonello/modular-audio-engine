/*
 * src/context/PatchContext.tsx
 * This holds the patch JSON in React state.
 */


import React, { createContext, useContext, useState } from "react";
import { CONTROL_NODE_TYPES } from "../model/PatchTypes";
import type { Patch, PatchConnection } from "../model/PatchTypes";
import { audioEngine } from "../audio/engineInstance";

type PatchContextType = {
  patch: Patch;
  setPatch: React.Dispatch<React.SetStateAction<Patch>>;
  selectedNodeId: string | null;
  setSelectedNodeId: React.Dispatch<React.SetStateAction<string | null>>;

  deleteNode: (nodeId: string) => void;
  addConnection: (fromId: string, toId: string) => void;
  deleteConnection: (connectionId: string) => void;

  addOscillator: (frequency?: number) => void;
  addGain: (gain?: number) => void;
  addFilter: () => void;
  addEnvelope: () => void;
};

const defaultPatch: Patch = {
  version: "0.1",
  name: "Untitled Synth",
  nodes: [
    {
      id: crypto.randomUUID(),
      type: "destination",
      x: 400,
      y: 520,
    }
  ],
  connections: []
};

const PatchContext = createContext<PatchContextType | undefined>(undefined);

export function PatchProvider({ children }: { children: React.ReactNode }) {
  const [patch, setPatch] = useState<Patch>(defaultPatch);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const deleteNode = (nodeId: string) => {
    setPatch((prev) => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== nodeId),
      connections: prev.connections.filter(
        c => c.from !== nodeId && c.to !== nodeId
      ),
    }));

    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }

    audioEngine.deleteNode(nodeId);
  };

  const addOscillator = (frequency = 220) => {
    const node = audioEngine.addOscillator(frequency);
    setPatch(prev => ({
      ...prev,
      nodes: [...prev.nodes, node],
    }));
  };

  const addGain = (gain = 0.5) => {
    const node = audioEngine.addGain(gain);
    setPatch(prev => ({
      ...prev,
      nodes: [...prev.nodes, node],
    }));
  };

  const addFilter = () => {
    const node = audioEngine.addFilter();
    setPatch(prev => ({
      ...prev,
      nodes: [...prev.nodes, node],
    }));
  };

  const addEnvelope = () => {
    const node = audioEngine.addEnvelope();
    setPatch((prev) => ({
      ...prev,
      nodes: [...prev.nodes, node],
    }));
  };

  
  const addConnection = (fromId: string, toId: string) => {
    setPatch((prev) => {
      const exists = prev.connections.some(
        (c) => c.from === fromId && c.to === toId
      );
      
      if (exists) return prev;
      
      const fromNode = prev.nodes.find(n => n.id === fromId);
      const isControl = CONTROL_NODE_TYPES.includes(fromNode?.type as any);
      
      const connection: PatchConnection = {
        id: crypto.randomUUID(),
        from: fromId,
        to: toId,
        type: isControl ? "control" : "audio",
        target: isControl ? "gain" : undefined,
      };
      
      console.log("AB", `${isControl ? "this is a control" : "this is audio"}`)
      console.log("connection type:", connection.type, connection.target);

      return {
        ...prev,
        connections: [...prev.connections, connection],
      };
    });
  };

  const deleteConnection = (connectionId: string) => {
    setPatch((prev) => ({
      ...prev,
      connections: prev.connections.filter(c => c.id !== connectionId),
    }));
  };

  return (
    <PatchContext.Provider value={{
      patch,
      setPatch,
      selectedNodeId,
      setSelectedNodeId,
      deleteNode,
      addConnection,
      deleteConnection,
      addOscillator,
      addGain,
      addFilter,
      addEnvelope,
    }}>
      {children}
    </PatchContext.Provider>
  );
}

export function usePatch() {
  const context = useContext(PatchContext);
  if (!context) throw new Error("usePatch must be used within PatchProvider");
  return context;
}

