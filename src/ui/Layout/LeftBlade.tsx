/*
 * src/ui/Layout/LeftBlade.tsx
 */

import React from "react";
import { useBlade } from "../../context/BladeContext";
import { usePatch } from "../../context/PatchContext";


export default function LeftBlade({ children }: { children: React.ReactNode }) {
  const { leftOpen } = useBlade();
  const { addOscillator, addGain, addFilter, addEnvelope } = usePatch();

  const handleAddOsc = () => {addOscillator();};
  const handleAddGain = () => {addGain();};
  const handleAddFilter = () => {addFilter();};
  const handleAddEnvelope = () => {addEnvelope();}

  return (
    <aside className={`blade left ${leftOpen ? "open" : "closed"}`}>
      <div className="toolItem" onClick={handleAddOsc}>
        🎛 Oscillator
      </div>

      <div className="toolItem" onClick={handleAddGain}>
        🔊 Gain
      </div>
      <div className="toolItem" onClick={handleAddFilter}>
        🎚 Filter
      </div>
      <div className="toolItem" onClick={handleAddEnvelope}>
        ✨ Envelope
      </div>
      {children}
    </aside>
  );
}
