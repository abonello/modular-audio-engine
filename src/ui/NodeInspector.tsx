/*
 * src/ui/NodeInspector.tsx
 */

import React, { useEffect, useState } from "react";
import { usePatch } from "../context/PatchContext";
import { audioEngine } from "../audio/engineInstance";

export default function NodeInspector() {
  const { patch, selectedNodeId, setPatch, deleteNode } = usePatch();
  const selectedNode = patch.nodes.find(n => n.id === selectedNodeId);

  // use params.frequency
  const [freq, setFreq] = useState<number>(
    selectedNode?.params?.frequency ?? 440
  );

  useEffect(() => {
    if (selectedNode?.type === "oscillator") {
      setFreq(selectedNode.params?.frequency ?? 440);
    }
  }, [selectedNodeId]);

  if (!selectedNode) {
    return <div>Select a node</div>;
  }

  if (selectedNode.type === "oscillator") {
    return (
      <div>
        <div>Kind: OSC</div>

        <div>
          Frequency:
          <input
            type="number"
            value={freq}
            onChange={(e) => setFreq(Number(e.target.value))}
          />
        </div>

        <button
          onClick={() => {
            // update patch
            setPatch(prev => ({
              ...prev,
              nodes: prev.nodes.map((n) =>
                n.id === selectedNode.id
                  ? {
                      ...n,
                      params: { ...n.params, frequency: freq },
                    }
                  : n
              ),
            }));

            // update engine
            audioEngine.setNodeFrequency(selectedNode.id, freq);
          }}
        >
          Apply
        </button>
        <button onClick={() => deleteNode(selectedNode.id)}>
          Delete Node
        </button>
      </div>
    );
  }

  return (
    <div>
      Gain node
      <button onClick={() => deleteNode(selectedNode.id)}>
        Delete Node
      </button>
    </div>);
}
