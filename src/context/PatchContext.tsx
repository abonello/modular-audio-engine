/*
 * src/context/PatchContext.tsx
 * This holds the patch JSON in React state.
 */


import React, { createContext, useContext, useState } from "react";
import type { Patch } from "../model/PatchTypes";
import { audioEngine } from "../audio/engineInstance";

type PatchContextType = {
  patch: Patch;
  setPatch: React.Dispatch<React.SetStateAction<Patch>>;
  selectedNodeId: string | null;
  setSelectedNodeId: React.Dispatch<React.SetStateAction<string | null>>;
  deleteNode: (nodeId: string) => void;
};

const defaultPatch: Patch = {
  version: "0.1",
  name: "Untitled Synth",
  nodes: [],
  connections: []
};

const PatchContext = createContext<PatchContextType | undefined>(undefined);

export function PatchProvider({ children }: { children: React.ReactNode }) {
  const [patch, setPatch] = useState<Patch>(defaultPatch);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // ---- Add this here ----
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

  return (
    <PatchContext.Provider value={{
      patch,
      setPatch,
      selectedNodeId,
      setSelectedNodeId,
      deleteNode,
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

