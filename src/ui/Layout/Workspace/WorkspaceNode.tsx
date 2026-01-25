/*
 * src/ui/Layout/Workspace/WorkspaceNode.tsx
 */

import React, { forwardRef } from "react";
import { usePatch } from "../../../context/PatchContext";
import { useDraggable } from "@dnd-kit/core";
import { OscillatorIcon } from "../../NodeIcons/OscillatorIcon";
import { GainIcon } from "../../NodeIcons/GainIcon";
import { FilterIcon } from "../../NodeIcons/FilterIcon";
import { EnvelopeIcon } from "../../NodeIcons/EnvelopeIcon"
import { DestinationIcon } from "../../NodeIcons/DestinationIcon";

export const WorkspaceNode = forwardRef<HTMLDivElement, { node: any; onClick: () => void }>(
  ({ node, onClick }, ref) => {
    const { selectedNodeId, addConnection } = usePatch();
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: node.id });

    const style: React.CSSProperties = {
      position: "absolute",
      left: node.x ?? 0,
      top: node.y ?? 0,
      transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    };

    return (
      <div
        ref={(el) => {
          setNodeRef(el);
          if (typeof ref === "function") ref(el);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }}
        style={style}
        {...listeners}
        {...attributes}
        className={`node ${node.type}`}
        onClick={onClick}
        onContextMenu={(e) => {
          e.preventDefault();
          if (selectedNodeId && selectedNodeId !== node.id) {
            addConnection(selectedNodeId, node.id);
          }
        }}
      >
        {node.type === "oscillator" && <OscillatorIcon />}
        {node.type === "gain" && <GainIcon />}
        {node.type === "destination" && <DestinationIcon />}
        {node.type === "filter" && <FilterIcon />}
        {node.type === "envelope" && <EnvelopeIcon />}
      </div>
    );
  }
);
