/*
 * src/ui/Layout/Workspace.tsx
 */

import React, { useState, useRef, forwardRef } from "react";
import {
  DndContext,
  useDraggable,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type {
  DragEndEvent,
} from "@dnd-kit/core";
import { audioEngine } from "../../audio/engineInstance";
import { usePatch } from "../../context/PatchContext";
import { useConnectionEdit } from "../../context/ConnectionEditContext";
import { OscillatorIcon } from "../NodeIcons/OscillatorIcon";
import { GainIcon } from "../NodeIcons/GainIcon";
import { DestinationIcon } from "../NodeIcons/DestinationIcon";

const DraggableNode = forwardRef<HTMLDivElement, { node: any; onClick: () => void }>(
  ({ node, onClick }, ref) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const { selectedNodeId, addConnection } = usePatch();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: node.id,
  });

  const style: React.CSSProperties = {
    position: "absolute",
    left: node.x ?? 0,
    top: node.y ?? 0,
    // Only apply transform while dragging
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
  };

  return (
    <div
      // ref={setNodeRef}
      // ref={(el) => {
      //   setNodeRef(el);
      //   nodeRef.current = el;
      // }}
      ref={(el) => {
        setNodeRef(el);
        // pass ref to parent
        if (typeof ref === "function") ref(el);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
      }}
      style={style}
      {...listeners}
      {...attributes}
      className={`node ${node.type}`}
      onClick={onClick}
      onContextMenu={(e) => {
        e.preventDefault(); // prevents browser context menu
        if (selectedNodeId && selectedNodeId !== node.id) {
          addConnection(selectedNodeId, node.id);
        }
      }}
    >
      {/* {node.type.toUpperCase()} */}
      {node.type === "oscillator" && <OscillatorIcon />}
      {node.type === "gain" && <GainIcon />}
      {node.type === "destination" && <DestinationIcon />}
    </div>
  );
});

export default function Workspace({ children }: { children: React.ReactNode }) {
  const [nodeCount, setNodeCount] = useState(0);
  // const nodeRefs = React.useRef<{ [id: string]: HTMLDivElement | null }>({});
  const nodeRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  const { patch, setPatch, selectedNodeId, setSelectedNodeId, deleteConnection } = usePatch();
  const { editConnectionsMode } = useConnectionEdit();
  console.log("connections:", patch.connections);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;

    setPatch((prev) => {
      const nodes = prev.nodes.map((node) => {
        if (node.id !== active.id) return node;

        const x = (node.x ?? 0) + delta.x;
        const y = (node.y ?? 0) + delta.y;

        return { ...node, x, y };
      });

      return { ...prev, nodes };
    });
  };
  
  const handlePlay = async () => {
    // if (audioEngine.isStarted) return;
    // await audioEngine.start();
    if (!audioEngine.isStarted) {
      await audioEngine.start();
    }
    audioEngine.playAll(patch, 3);
  };

   // TEMP: listen for osc additions
  (audioEngine as any)._notifyAdd = () =>
    setNodeCount((n) => n + 1);

  return (
    <main className="workspace" style={{ position: "relative", height: "100%" }}>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        {patch.nodes.map((node) => (
          <DraggableNode
            key={node.id}
            node={node}
            onClick={() => setSelectedNodeId(node.id)}
            // ref={(el: HTMLDivElement) => (nodeRefs.current[node.id] = el)}
            // ref={(el) => (nodeRefs.current[node.id] = el)}
            ref={(el) => {
              nodeRefs.current[node.id] = el;
            }}
          />
        ))}
      </DndContext>
      <svg
        className="connection-layer"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none", // lines are not clickable yet
          // pointerEvents: "auto",
          // zIndex: 100
        }}
        // viewBox="0 0 1000 1000"
        // preserveAspectRatio="none"
      >
        <defs>
          <marker
            id="arrow"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L6,3 Z" fill="white" />
          </marker>
        </defs>
        {patch.connections.map((c) => {
          // const fromNode = patch.nodes.find(n => n.id === c.from);
          // const toNode = patch.nodes.find(n => n.id === c.to);
          const fromEl = nodeRefs.current[c.from];
          const toEl = nodeRefs.current[c.to];

          // if (!fromNode || !toNode) return null;
          if (!fromEl || !toEl) {
            console.log("Missing ref for connection", c);
            return null;
          }

          const fromRect = fromEl.getBoundingClientRect();
          const toRect = toEl.getBoundingClientRect();

          // Workspace bounding box to convert to SVG coords
          const workspaceEl = document.querySelector(".workspace");
          const wsRect = workspaceEl?.getBoundingClientRect() ?? { left: 0, top: 0 };

          // const x1 = fromRect.left + fromRect.width / 2 - wsRect.left;
          // const y1 = fromRect.top + fromRect.height / 2 - wsRect.top;
          // const x2 = toRect.left + toRect.width / 2 - wsRect.left;
          // const y2 = toRect.top + toRect.height / 2 - wsRect.top;

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
            // connect left/right edges
            x1 = dx > 0 ? fromRect.right : fromRect.left;
            x2 = dx > 0 ? toRect.left : toRect.right;
            y1 = fromCenterY;
            y2 = toCenterY;
          } else {
            // connect top/bottom edges
            y1 = dy > 0 ? fromRect.bottom : fromRect.top;
            y2 = dy > 0 ? toRect.top : toRect.bottom;
            x1 = fromCenterX;
            x2 = toCenterX;
          }

          // adjust for workspace offset
          x1 -= wsRect.left;
          y1 -= wsRect.top;
          x2 -= wsRect.left;
          y2 -= wsRect.top;

          console.log(`Line drawn from x1: ${x1}, y1: ${y1} to x2: ${x2}, y2: ${y2}`)

          // return (
          //   <line
          //     key={c.id}
          //     x1={fromNode.x ?? 0}
          //     y1={fromNode.y ?? 0}
          //     x2={toNode.x ?? 0}
          //     y2={toNode.y ?? 0}
          //     stroke="white"
          //     strokeWidth="2"
          //   />
          // );

          return (
            // <line
            //   key={c.id}
            //   x1={x1}
            //   y1={y1}
            //   x2={x2}
            //   y2={y2}
            //   stroke="white"
            //   strokeWidth="2"
            // />
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


      <button onClick={handlePlay}>Play</button>
    </main>
  );
}
