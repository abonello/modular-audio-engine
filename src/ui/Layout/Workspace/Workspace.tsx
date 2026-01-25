/*
 * src/ui/Layout/Workspace/Workspace.tsx
 */

import React, { useRef, useEffect } from "react";
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
import { useWorkspace } from "../../../context/WorkspaceContext";
import { WorkspaceNode } from "./WorkspaceNode";
import { ConnectionLayer } from "./ConnectionLayer";


const KEYBOARD_VELOCITY = 0.8;

const KEYBOARD_NOTE_MAP: Record<string, number> = {
  // First octave (Z row)
  z: 261.63, // C4
  s: 277.18, // C#4
  x: 293.66, // D4
  d: 311.13, // D#4
  c: 329.63, // E4
  v: 349.23, // F4
  g: 369.99, // F#4
  b: 392.00, // G4
  h: 415.30, // G#4
  n: 440.00, // A4
  j: 466.16, // A#4
  m: 493.88, // B4
  ",": 523.25, // C5
  ".": 587.33, // D5
  "/": 659.25, // E5

  // Second octave (Q row)
  q: 523.25, // C5
  "2": 554.37, // C#5
  w: 587.33, // D5
  "3": 622.25, // D#5
  e: 659.25, // E5
  r: 698.46, // F5
  "5": 739.99, // F#5
  t: 783.99, // G5
  "6": 830.61, // G#5
  y: 880.00, // A5
  "7": 932.33, // A#5
  u: 987.77, // B5
  i: 1046.50, // C6
  "9": 1108.73,// C#6
  o: 1174.66, // D6
  "0": 1244.51, // D#6
  p: 1318.51, // E6
};



export default function Workspace({ children }: { children: React.ReactNode }) {
  // const workspaceRef = useRef<HTMLDivElement | null>(null);
  // const workspaceRef = useRef<HTMLDivElement>(null);
  const { workspaceRef } = useWorkspace();
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { patch, setPatch, setSelectedNodeId } = usePatch();
  console.log("connections:", patch.connections);

  


  useEffect(() => {
    audioEngine.setWorkspaceElement(workspaceRef.current);
  }, [workspaceRef.current]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return; // ignore held repeat

      console.log("KeyDown:", e.key);

      // if (e.key === "z" || e.key === "Z") {
      //   audioEngine.noteOn(patch, 261.63); // Middle C
      // }

      // switch (e.key.toLowerCase()) {
      //   case "z":
      //     audioEngine.noteOn(patch, 261.63, KEYBOARD_VELOCITY); // C4
      //     break;

      //   case "s":
      //     audioEngine.noteOn(patch, 277.18, KEYBOARD_VELOCITY); // C#4
      //     break;

      //   case "x":
      //     audioEngine.noteOn(patch, 293.66, KEYBOARD_VELOCITY); // D4
      //     break;

      //   case "d":
      //     audioEngine.noteOn(patch, 311.13, KEYBOARD_VELOCITY); // D#4
      //     break;

      //   case "c":
      //     audioEngine.noteOn(patch, 329.63, KEYBOARD_VELOCITY); // E4
      //     break;

      //   case "v":
      //     audioEngine.noteOn(patch, 349.23, KEYBOARD_VELOCITY); // F4
      //     break;

      //   case "g":
      //     audioEngine.noteOn(patch, 369.99, KEYBOARD_VELOCITY); // F#4
      //     break;

      //   case "b":
      //     audioEngine.noteOn(patch, 392.00, KEYBOARD_VELOCITY); // G4
      //     break;

      //   case "h":
      //     audioEngine.noteOn(patch, 415.30, KEYBOARD_VELOCITY); // G#4
      //     break;

      //   case "n":
      //     audioEngine.noteOn(patch, 440.00, KEYBOARD_VELOCITY); // A4
      //     break;

      //   case "j":
      //     audioEngine.noteOn(patch, 466.16, KEYBOARD_VELOCITY); // A#4
      //     break;

      //   case "m":
      //     audioEngine.noteOn(patch, 493.88, KEYBOARD_VELOCITY); // B4
      //     break;

      //   case ",":
      //     audioEngine.noteOn(patch, 523.25, KEYBOARD_VELOCITY); // C5
      //     break;

      //   default:
      //     break;
      // }

      const key = e.key.toLowerCase();
      const freq = KEYBOARD_NOTE_MAP[key];

      if (freq) {
        audioEngine.noteOn(patch, freq, KEYBOARD_VELOCITY);
      }


    };

    const handleKeyUp = (e: KeyboardEvent) => {
      console.log("KeyUp:", e.key);

      // if (e.key === "z" || e.key === "Z") {
      //   audioEngine.noteOff();
      // }
      // switch (e.key.toLowerCase()) {
      //   case "z":
      //   case "s":
      //   case "x":
      //   case "d":
      //   case "c":
      //   case "v":
      //   case "g":
      //   case "b":
      //   case "h":
      //   case "n":
      //   case "j":
      //   case "m":
      //   case ",":
      //     audioEngine.noteOff();
      //     break;

      //   default:
      //     break;
      // }

      const key = e.key.toLowerCase();
      if (KEYBOARD_NOTE_MAP[key]) {
        audioEngine.noteOff();
      }


    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [patch]);


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
    <main ref={workspaceRef} className="workspace" style={{ position: "relative", height: "100%" }}>
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
