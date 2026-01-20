/*
 * src/ui/Layout/Workspace.tsx
 */

import React from "react";

export default function Workspace({ children }: { children: React.ReactNode }) {
  return <main className="workspace">{children}</main>;
}
