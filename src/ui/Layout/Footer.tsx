/*
 * src/ui/Layout/Footer.tsx
 */

import {useState, useEffect} from "react";
import { audioEngine } from "../../audio/engineInstance";
import { usePatch } from "../../context/PatchContext";
import { useConnectionEdit } from "../../context/ConnectionEditContext";

export default function Footer() {
  const [level, setLevel] = useState(0);
  const { patch } = usePatch();
  const { editConnectionsMode, setEditConnectionsMode } = useConnectionEdit();

  useEffect(() => {
    let raf: number;

    const loop = () => {
      const l = audioEngine.getAudioLevel();
      setLevel(l);
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <footer className="footer">
      <div className="footerLeft">
        <span className="dot green" />
        <span>Audio status: Ready</span>
      </div>

      <div className="audioLevel">
        <span className={level > 0.02 ? "active" : ""} />
      </div>

      <div className="footerRight">
        <span>Note: --</span>
        <span>Velocity: --</span>

        <button
          onClick={() => setEditConnectionsMode((v) => !v)}
          style={{ marginLeft: 12 }}
        >
          {editConnectionsMode ? "Exit Cable Edit" : "Edit Cables"}
        </button>
        {/* <button onClick={() => audioEngine.stopAllOscillators()}> */}
        <button className="btnWarn" onClick={() => audioEngine.rebuildPatchGraph(patch)}>
          Rebuild Audio Graph
        </button>
        <button className="btnDelete" onClick={() => audioEngine.panic()}>
          PANIC / ALL NOTES OFF
        </button>
      </div>
    </footer>
  );
}
