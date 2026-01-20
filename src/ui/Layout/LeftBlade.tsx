/*
 * src/ui/Layout/LeftBlade.tsx
 */

import React from "react";
import { useBlade } from "../../context/BladeContext";

export default function LeftBlade({ children }: { children: React.ReactNode }) {
  const { leftOpen } = useBlade();

  return (
    <aside className={`blade left ${leftOpen ? "open" : "closed"}`}>
      {children}
    </aside>
  );
}
