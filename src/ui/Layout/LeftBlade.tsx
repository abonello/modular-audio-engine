/*
 * src/ui/Layout/LeftBlade.tsx
 */

import React from "react";
import { audioEngine } from "../../audio/engineInstance";
import { useBlade } from "../../context/BladeContext";
import { usePatch } from "../../context/PatchContext";


export default function LeftBlade({ children }: { children: React.ReactNode }) {
  const { leftOpen } = useBlade();
  const { patch, setPatch } = usePatch();

  const handleAddOsc = () => {
    // audioEngine.addOscillator(220);
    const node = audioEngine.addOscillator(220); // return node
    // setPatch(prev => ({ ...prev, nodes: [...prev.nodes, node] }));
    setPatch((prev) => ({
      ...prev,
      nodes: [
        ...prev.nodes,
        { ...node, x: 40, y: 80 }  // set a default position
      ],
    }));

  };

  const handleAddGain = () => {
    // audioEngine.addGain(0.5);
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
