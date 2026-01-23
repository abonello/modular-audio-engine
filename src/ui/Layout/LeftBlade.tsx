/*
 * src/ui/Layout/LeftBlade.tsx
 */

import React from "react";
import { audioEngine } from "../../audio/engineInstance";
import { useBlade } from "../../context/BladeContext";
import { usePatch } from "../../context/PatchContext";


export default function LeftBlade({ children }: { children: React.ReactNode }) {
  const { leftOpen } = useBlade();
  const { setPatch } = usePatch();

  const handleAddOsc = () => {
    const node = audioEngine.addOscillator(220);

    setPatch((prev) => ({
      ...prev,
      nodes: [...prev.nodes, node],
    }));
  };

  const handleAddGain = () => {
    const node = audioEngine.addGain(0.5);
    setPatch(prev => ({ ...prev, nodes: [...prev.nodes, node] }));
  };

  return (
    <aside className={`blade left ${leftOpen ? "open" : "closed"}`}>
      <div className="toolItem" onClick={handleAddOsc}>
        🎛 Oscillator
      </div>

      <div className="toolItem" onClick={handleAddGain}>
        🔊 Gain
      </div>
      {children}
    </aside>
  );
}
