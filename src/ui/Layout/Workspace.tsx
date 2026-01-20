/*
 * src/ui/Layout/Workspace.tsx
 */

import React from "react";
import { AudioEngine } from "../../audio/AudioEngine";

const engine = new AudioEngine();

export default function Workspace({ children }: { children: React.ReactNode }) {
  const handlePlay = async () => {
    await engine.start();   // required for user gesture
    engine.playTestTone();
  };
  // return <main className="workspace">{children}</main>;
  return (
    <main className="workspace">
      {children}

      <div className="testControls">
        <button onClick={handlePlay}>Play Test Tone</button>
      </div>
    </main>
  );
}
