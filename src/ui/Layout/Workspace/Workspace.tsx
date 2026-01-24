/*
 * src/ui/Layout/Workspace/Workspace.tsx
 */

import React, { useRef } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type {
  DragEndEvent,
} from "@dnd-kit/core";
import { audioEngine } from "../../../audio/engineInstance";
import { usePatch } from "../../../context/PatchContext";
import { WorkspaceNode } from "./WorkspaceNode";
import { ConnectionLayer } from "./ConnectionLayer";


export default function Workspace({ children }: { children: React.ReactNode }) {
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { patch, setPatch, setSelectedNodeId } = usePatch();
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
    if (!audioEngine.isStarted) {
      await audioEngine.start();
    }
    audioEngine.playAll(patch, 3);
  };

  return (
    <main className="workspace" style={{ position: "relative", height: "100%" }}>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        {patch.nodes.map((node) => (
          <WorkspaceNode
            key={node.id}
            node={node}
            onClick={() => setSelectedNodeId(node.id)}
            ref={(el) => {
              nodeRefs.current[node.id] = el;
            }}
          />
        ))}
      </DndContext>
      <ConnectionLayer nodeRefs={nodeRefs} />
      {children}

      <button onClick={handlePlay}>Play</button>
    </main>
  );
}
