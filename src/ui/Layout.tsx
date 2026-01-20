/*
 * src/ui/Layout.tsx
 */

import React from "react";
import { useMode } from "../context/ModeContext";

import LeftBlade from "./blades/LeftBlade";
import RightBlade from "./blades/RightBlade";

export default function Layout() {
  const { mode } = useMode();

  return (
    <div className="appRoot">
      <Header />
      <div className="mainArea">
        <LeftBlade />
        <Workspace mode={mode} />
        <RightBlade />
      </div>
      <Footer />
    </div>
  );
}

function Header() {
  const { mode, setMode } = useMode();

  return (
    <header className="header">
      <div className="headerTitle">Modular Audio Engine</div>

      <div className="headerControls">
        <button
          className={mode === "synth-editor" ? "active" : ""}
          onClick={() => setMode("synth-editor")}
        >
          Synth Editor
        </button>
        <button
          className={mode === "ui-editor" ? "active" : ""}
          onClick={() => setMode("ui-editor")}
        >
          UI Editor
        </button>
        <button
          className={mode === "play-mode" ? "active" : ""}
          onClick={() => setMode("play-mode")}
        >
          Play Mode
        </button>
      </div>

      <div className="bladeToggles">
        <button id="leftToggle">☰</button>
        <button id="rightToggle">☰</button>
      </div>
    </header>
  );
}

function Workspace({ mode }: { mode: string }) {
  return (
    <main className="workspace">
      <div className="workspaceLabel">{mode}</div>
    </main>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footerLeft">
        <span className="dot green" />
        <span>Audio status: Ready</span>
      </div>
      <div className="footerRight">
        <span>Note: --</span>
        <span>Velocity: --</span>
      </div>
    </footer>
  );
}
