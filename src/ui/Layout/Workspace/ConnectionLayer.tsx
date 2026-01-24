/*
 * src/ui/Layout/Workspace/ConnectionLayer.tsx
 */

import { usePatch } from "../../../context/PatchContext";
import { useConnectionEdit } from "../../../context/ConnectionEditContext";

type NodeRefs = {
  current: Record<string, HTMLDivElement | null>;
};

export function ConnectionLayer({
  nodeRefs,
}: {
  nodeRefs: NodeRefs;
}) {
  const { patch, deleteConnection } = usePatch();
  const { editConnectionsMode } = useConnectionEdit();

  return (
    <svg
      className="connection-layer"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L6,3 Z" fill="white" />
        </marker>
      </defs>

      {patch.connections.map((c) => {
        const fromEl = nodeRefs.current[c.from];
        const toEl = nodeRefs.current[c.to];

        if (!fromEl || !toEl) return null;

        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();

        const workspaceEl = document.querySelector(".workspace");
        const wsRect = workspaceEl?.getBoundingClientRect() ?? { left: 0, top: 0 };

        const fromCenterX = fromRect.left + fromRect.width / 2;
        const fromCenterY = fromRect.top + fromRect.height / 2;
        const toCenterX = toRect.left + toRect.width / 2;
        const toCenterY = toRect.top + toRect.height / 2;

        const dx = toCenterX - fromCenterX;
        const dy = toCenterY - fromCenterY;

        let x1 = fromCenterX;
        let y1 = fromCenterY;
        let x2 = toCenterX;
        let y2 = toCenterY;

        const horizontal = Math.abs(dx) > Math.abs(dy);

        if (horizontal) {
          x1 = dx > 0 ? fromRect.right : fromRect.left;
          x2 = dx > 0 ? toRect.left : toRect.right;
          y1 = fromCenterY;
          y2 = toCenterY;
        } else {
          y1 = dy > 0 ? fromRect.bottom : fromRect.top;
          y2 = dy > 0 ? toRect.top : toRect.bottom;
          x1 = fromCenterX;
          x2 = toCenterX;
        }

        x1 -= wsRect.left;
        y1 -= wsRect.top;
        x2 -= wsRect.left;
        y2 -= wsRect.top;

        return (
          <line
            key={c.id}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="white"
            strokeWidth="2"
            markerEnd="url(#arrow)"
            style={{ pointerEvents: editConnectionsMode ? "auto" : "none" }}
            onClick={(e) => {
              e.stopPropagation();
              if (editConnectionsMode) deleteConnection(c.id);
            }}
          />
        );
      })}
    </svg>
  );
}
