/*
 * src/ui/blades/LeftBlade.tsx
 */

import React, { useState } from "react";

export default function LeftBlade() {
  const [open, setOpen] = useState(true);

  return (
    <aside className={`blade left ${open ? "open" : "closed"}`}>
      <div className="bladeHeader">
        <button onClick={() => setOpen(!open)}>{open ? "←" : "→"}</button>
        <span>Tools</span>
      </div>

      {open && (
        <div className="bladeBody">
          <div className="toolItem">Oscillator</div>
          <div className="toolItem">Filter</div>
          <div className="toolItem">Gain</div>
          <div className="toolItem">Splitter</div>
          <div className="toolItem">Combiner</div>
        </div>
      )}
    </aside>
  );
}
