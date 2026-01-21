/*
 * src/ui/Layout/LeftBlade.tsx
 */

import React from "react";
import { audioEngine } from "../../audio/engineInstance";
import { useBlade } from "../../context/BladeContext";

export default function LeftBlade({ children }: { children: React.ReactNode }) {
  const { leftOpen } = useBlade();

  const handleAddOsc = () => {
    audioEngine.addOscillator(220);
  };

  return (
    <aside className={`blade left ${leftOpen ? "open" : "closed"}`}>
      <div className="toolItem" onClick={handleAddOsc}>
        🎛 Oscillator
      </div>
      {children}
    </aside>
  );
}
