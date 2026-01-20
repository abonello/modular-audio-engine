/*
 * src/ui/Layout/Banner.tsx
 */

import React from "react";
import { useMode } from "../../context/ModeContext";
import { useBlade } from "../../context/BladeContext";
import { usePatch } from "../../context/PatchContext";

export default function Banner() {
  const { mode, setMode } = useMode();
  const { leftOpen, rightOpen, toggleLeft, toggleRight } = useBlade();
  const { patch } = usePatch();

  return (
    <div className="banner">
      <div className="bannerLeft">
        <button onClick={toggleLeft}>
          {leftOpen ? "⟵" : "⟶"}
        </button>
      </div>

      <div className="bannerCenter">
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

      <div className="bannerTitle">{patch.name}</div>

      <div className="bannerRight">
        <button onClick={toggleRight}>
          {rightOpen ? "⟶" : "⟵"}
        </button>
      </div>
    </div>
  );
}
