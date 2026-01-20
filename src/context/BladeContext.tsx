/*
 * src/context/BladeContext.tsx
 */

import React, { createContext, useContext, useState } from "react";

type BladeContextType = {
  leftOpen: boolean;
  rightOpen: boolean;
  toggleLeft: () => void;
  toggleRight: () => void;
};

const BladeContext = createContext<BladeContextType | undefined>(undefined);

export function BladeProvider({ children }: { children: React.ReactNode }) {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  const toggleLeft = () => setLeftOpen((v) => !v);
  const toggleRight = () => setRightOpen((v) => !v);

  return (
    <BladeContext.Provider
      value={{ leftOpen, rightOpen, toggleLeft, toggleRight }}
    >
      {children}
    </BladeContext.Provider>
  );
}

export function useBlade() {
  const context = useContext(BladeContext);
  if (!context) {
    throw new Error("useBlade must be used within BladeProvider");
  }
  return context;
}
