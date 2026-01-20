/*
 *  src/context/ModeContext.tsx
 * This controls the different modes that this App is in.
 */

import React, { createContext, useContext, useState } from "react";

export type AppMode = "synth-editor" | "ui-editor" | "play-mode";

type ModeContextType = {
  mode: AppMode;
  setMode: React.Dispatch<React.SetStateAction<AppMode>>;
};

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AppMode>("synth-editor");

  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (!context) throw new Error("useMode must be used within ModeProvider");
  return context;
}
