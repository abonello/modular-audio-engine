/*
 * src/ui/Layout/Footer.tsx
 */

import React from "react";

export default function Footer() {
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
