/*
 * src/ui/Layout/Footer.tsx
 */

import React, {useState, useEffect} from "react";
import { audioEngine } from "../../audio/engineInstance";

export default function Footer() {
  const [level, setLevel] = useState(0);

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
        <span
          className={level > 0.02 ? "active" : ""}
        />
      </div>
      <div className="footerRight">
        <span>Note: --</span>
        <span>Velocity: --</span>
      </div>
    </footer>
  );
}
