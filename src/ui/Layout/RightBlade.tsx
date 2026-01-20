/*
 * src/ui/Layout/RightBlade.tsx
 */

import React from "react";
import { useBlade } from "../../context/BladeContext";

export default function RightBlade({ children }: { children: React.ReactNode }) {
  const { rightOpen } = useBlade();

  return (
    <aside className={`blade right ${rightOpen ? "open" : "closed"}`}>
      {children}
    </aside>
  );
}
