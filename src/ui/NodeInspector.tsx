/*
 * src/ui/NodeInspector.tsx
 */

import { useEffect, useState } from "react";
import { usePatch } from "../context/PatchContext";
import { audioEngine } from "../audio/engineInstance";
import { isOscillatorNode } from "../model/PatchTypes";

export default function NodeInspector() {
  const { patch, selectedNodeId, setPatch, deleteNode } = usePatch();
  const selectedNode = patch.nodes.find(n => n.id === selectedNodeId);

  const [freq, setFreq] = useState<number>(440);

  useEffect(() => {
    if (!selectedNode) return;

    if (isOscillatorNode(selectedNode)) {
      setFreq(selectedNode.params.frequency);
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

              nodes: prev.nodes.map((n) => {
                if (n.id !== selectedNode.id) return n;

                if (isOscillatorNode(n)) {
                  return {
                    ...n,
                    params: {
                      ...n.params,
                      frequency: freq,
                    },
                  };
                }

                return n;
              }),
            }));

            // update engine ONLY if oscillator
            if (isOscillatorNode(selectedNode)) {
              audioEngine.setNodeFrequency(selectedNode.id, freq);
            }
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
