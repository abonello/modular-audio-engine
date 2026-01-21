/*
 * src/ui/Layout/Workspace.tsx
 */

import React, { useState } from "react";
import { audioEngine } from "../../audio/engineInstance";
// import { AudioEngine } from "../../audio/AudioEngine";

// const engine = new AudioEngine();



export default function Workspace({ children }: { children: React.ReactNode }) {
  const [oscCount, setOscCount] = useState(0);

  // const handlePlay = async () => {
  //   await engine.start();   // required for user gesture
  //   engine.playTestTone();
  // };
  
  const handlePlay = async () => {
    await audioEngine.start();
    audioEngine.playAll(3);
    // audioEngine.playTestTone();
  };

   // TEMP: listen for osc additions
  (audioEngine as any)._notifyAdd = () =>
    setOscCount((n) => n + 1);


  // return <main className="workspace">{children}</main>;
  return (
    <main className="workspace">
      <div className="nodeRow">
        {Array.from({ length: oscCount }).map((_, i) => (
          <div key={i} className="node osc">
            OSC {i + 1} (220Hz)
          </div>
        ))}

        <div className="node gain">
          GAIN → OUTPUT
        </div>
      </div>






      {children}

      {/* <div className="testControls"> */}
        <button onClick={handlePlay}>Play Test Tone</button>
      {/* </div> */}
    </main>
  );
}
