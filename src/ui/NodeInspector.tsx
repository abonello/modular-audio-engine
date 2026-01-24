/*
 * src/ui/NodeInspector.tsx
 */

import { useEffect, useState } from "react";
import { usePatch } from "../context/PatchContext";
import { audioEngine } from "../audio/engineInstance";
import { isOscillatorNode, isGainNode } from "../model/PatchTypes";
import type { Waveform } from "../model/PatchTypes";

export default function NodeInspector() {
  const { patch, selectedNodeId, setPatch, deleteNode } = usePatch();
  const selectedNode = patch.nodes.find(n => n.id === selectedNodeId);
  const [freq, setFreq] = useState<number>(440);
  const [waveform, setWaveform] = useState<Waveform>("sine");

  useEffect(() => {
    if (!selectedNode) return;

    if (isOscillatorNode(selectedNode)) {
      setFreq(selectedNode.params.frequency);
      setWaveform(selectedNode.params.waveform);
    }
  }, [selectedNodeId]);

  if (!selectedNode) {
    return <div>Select a node</div>;
  }

  // ---- OSCILLATOR UI ----
  if (isOscillatorNode(selectedNode)) {
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

        <div>
          Waveform:
          <select
            value={waveform}
            onChange={(e) => setWaveform(e.target.value as Waveform)}
          >
            <option value="sine">sin</option>
            <option value="triangle">triangle</option>
            <option value="square">square</option>
            <option value="sawtooth">saw</option>
          </select>
        </div>

        <button
          onClick={() => {
            setPatch(prev => ({
              ...prev,
              nodes: prev.nodes.map((n) => {
                if (n.id !== selectedNode.id) return n;
                return isOscillatorNode(n)
                  ? { ...n, params: {
                    ...n.params,
                    frequency: freq,
                    waveform: waveform
                  } }
                  : n;
              }),
            }));

            audioEngine.setNodeFrequency(selectedNode.id, freq);
            audioEngine.setNodeWaveform(selectedNode.id, waveform);
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

  // ---- GAIN UI ----
  if (isGainNode(selectedNode)) {
    return (
      <div>
        <div>Kind: GAIN</div>

        <div>
          Gain:
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={selectedNode.params.value}
            onChange={(e) => {
              const newValue = parseFloat(e.target.value);

              setPatch((prev) => ({
                ...prev,
                nodes: prev.nodes.map((n) =>
                  n.id === selectedNode.id && isGainNode(n)
                    ? { ...n, params: { ...n.params, value: newValue } }
                    : n
                ),
              }));
            }}
          />
        </div>

        <div>{selectedNode.params.value.toFixed(2)}</div>

        <button onClick={() => deleteNode(selectedNode.id)}>
          Delete Node
        </button>
      </div>
    );
  }

  // ---- FALLBACK ----
  return <div>Unknown node type</div>;
}
