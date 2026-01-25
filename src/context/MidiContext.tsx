import React, { createContext, useState } from "react";
import type { Dispatch, SetStateAction } from "react";


type MidiContextType = {
  note: string;
  velocity: number;
  setNote: Dispatch<SetStateAction<string>>;
  setVelocity: Dispatch<SetStateAction<number>>;
};

type MidiProviderProps = {
  children: React.ReactNode;
};

export const MidiContext = createContext<MidiContextType>({
  note: "--",
  velocity: 0,
  setNote: () => {},
  setVelocity: () => {}
});

export function MidiProvider({ children }: MidiProviderProps) {
  const [note, setNote] = useState("--");
  const [velocity, setVelocity] = useState<number>(0);

  return (
    <MidiContext.Provider value={{ note, velocity, setNote, setVelocity }}>
      {children}
    </MidiContext.Provider>
  );
}
