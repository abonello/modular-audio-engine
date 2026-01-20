/*
 * src/ui/Layout.tsx
 */

import React from "react";
import { useMode } from "../context/ModeContext";

import LeftBlade from "./blades/LeftBlade";
import RightBlade from "./blades/RightBlade";

export default function Layout() {
  return (
    <div className="appRoot">
      <Header />
      <Banner />
      <div className="mainArea">
        <LeftBlade />
        <Workspace />
        <RightBlade />
      </div>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="header">
      <div className="headerTitle">Modular Audio Engine</div>
    </header>
  );
}

function Banner() {
  const { mode, setMode } = useMode();

  return (
    <div className="banner">
      <div className="bannerLeft">
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

      <div className="bannerRight">
        <button id="leftToggle">Left Blade</button>
        <button id="rightToggle">Right Blade</button>
      </div>
    </div>
  );
}

function Workspace() {
  const { mode } = useMode();

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

