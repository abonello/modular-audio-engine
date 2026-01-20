/*
 * src/context/PatchContext.tsx
 * This holds the patch JSON in React state.
 */


import React, { createContext, useContext, useState } from "react";
import { Patch } from "../model/PatchTypes";

type PatchContextType = {
  patch: Patch;
  setPatch: React.Dispatch<React.SetStateAction<Patch>>;
};

const defaultPatch: Patch = {
  version: "0.1",
  nodes: [],
  connections: []
};

const PatchContext = createContext<PatchContextType | undefined>(undefined);

export function PatchProvider({ children }: { children: React.ReactNode }) {
  const [patch, setPatch] = useState<Patch>(defaultPatch);

  return (
    <PatchContext.Provider value={{ patch, setPatch }}>
      {children}
    </PatchContext.Provider>
  );
}

export function usePatch() {
  const context = useContext(PatchContext);
  if (!context) throw new Error("usePatch must be used within PatchProvider");
  return context;
}
