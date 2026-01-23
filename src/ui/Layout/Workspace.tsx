/*
 * src/ui/Layout/Workspace.tsx
 */

import React, { useState, useEffect } from "react";
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
// import { AudioEngine } from "../../audio/AudioEngine";

// const engine = new AudioEngine();

function DraggableNode({
  node,
  onClick,
}: {
  node: any;
  onClick: () => void;
}) {
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
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`node ${node.type}`}
      onClick={onClick}
    >
      {node.type.toUpperCase()}
    </div>
  );
}

export default function Workspace({ children }: { children: React.ReactNode }) {
  // const [oscCount, setOscCount] = useState(0);
  const [nodeCount, setNodeCount] = useState(0);
  // const [nodes, setNodes] = useState(audioEngine.getNodes());

  const { patch, setPatch, selectedNodeId, setSelectedNodeId } = usePatch();


  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // useEffect(() => {
  //   (audioEngine as any)._notifyAdd = () => {
  //     setNodes([...audioEngine.getNodes()]);
  //   };
  // }, []);

  // const handlePlay = async () => {
  //   await engine.start();   // required for user gesture
  //   engine.playTestTone();
  // };

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
    if (audioEngine.isStarted) return;
    await audioEngine.start();
    audioEngine.playAll(3);
    // audioEngine.playTestTone();
  };

   // TEMP: listen for osc additions
  (audioEngine as any)._notifyAdd = () =>
    setNodeCount((n) => n + 1);
    // setOscCount((n) => n + 1);


  // return <main className="workspace">{children}</main>;
  // return (
  //   <main className="workspace">
  //     <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
  //       {patch.nodes.map((node) => (
  //         <div
  //           key={node.id}
  //           className={`node ${node.type}`}
  //           style={{
  //             position: "absolute",
  //             left: node.x ?? 0,
  //             top: node.y ?? 0,
  //           }}
  //           // IMPORTANT: this makes it draggable
  //           draggable
  //           id={node.id}
  //           onClick={() => setSelectedNodeId(node.id)}
  //         >
  //           {node.type.toUpperCase()}
  //         </div>
  //       ))}

  //       {children}
  //     </DndContext>

  //     <button onClick={handlePlay}>Play</button>
  //   </main>
  // );

  // return (
  //   <main className="workspace">
  //     <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
  //       {patch.nodes.map(node => (
  //         <DraggableNode key={node.id} node={node} />
  //       ))}
  //       {children}
  //     </DndContext>
  //     <button onClick={handlePlay}>Play</button>
  //   </main>
  // );

  return (
    <main className="workspace" style={{ position: "relative", height: "100%" }}>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        {patch.nodes.map((node) => (
          <DraggableNode
            key={node.id}
            node={node}
            onClick={() => setSelectedNodeId(node.id)}
          />
        ))}
      </DndContext>

      <button onClick={handlePlay}>Play</button>
    </main>
  );
}
