/*
 * src/ui/blades/RightBlade.tsx
 */

import React, { useState } from "react";

export default function RightBlade() {
  const [open, setOpen] = useState(true);

  return (
    <aside className={`blade right ${open ? "open" : "closed"}`}>
      <div className="bladeHeader">
        <button onClick={() => setOpen(!open)}>{open ? "→" : "←"}</button>
        <span>Inspector</span>
      </div>

      {open && (
        <div className="bladeBody">
          <div className="inspectorLine">Selected: none</div>
          <div className="inspectorLine">Param A: --</div>
          <div className="inspectorLine">Param B: --</div>
        </div>
      )}
    </aside>
  );
}
