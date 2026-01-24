/*
 * src/ui/Layout/LeftBlade.tsx
 */

import React from "react";
import { useBlade } from "../../context/BladeContext";
import { usePatch } from "../../context/PatchContext";


export default function LeftBlade({ children }: { children: React.ReactNode }) {
  const { leftOpen } = useBlade();
  const { addOscillator, addGain, addFilter } = usePatch();

  const handleAddOsc = () => {
    addOscillator();
  };

  const handleAddGain = () => {
    addGain();
  };

  const handleAddFilter = () => {
    addFilter();
  };

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
      {children}
    </aside>
  );
}
