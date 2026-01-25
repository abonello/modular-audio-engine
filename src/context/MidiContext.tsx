import React, { createContext, useState } from "react";
import type { Dispatch, SetStateAction } from "react";


type MidiContextType = {
  note: string;
  velocity: string;
  setNote: Dispatch<SetStateAction<string>>;
  setVelocity: Dispatch<SetStateAction<string>>;
};

type MidiProviderProps = {
  children: React.ReactNode;
};

export const MidiContext = createContext<MidiContextType>({
  note: "--",
  velocity: "--",
  setNote: () => {},
  setVelocity: () => {}
});

export function MidiProvider({ children }: MidiProviderProps) {
  const [note, setNote] = useState("--");
  const [velocity, setVelocity] = useState("--");

  return (
    <MidiContext.Provider value={{ note, velocity, setNote, setVelocity }}>
      {children}
    </MidiContext.Provider>
  );
}
