/*
 * src/ui/NodeInspector.tsx
 */

import { useEffect, useState } from "react";
import { usePatch } from "../context/PatchContext";
import { audioEngine } from "../audio/engineInstance";
import { isOscillatorNode, isGainNode, isDestinationNode} from "../model/PatchTypes";
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
      <div className="bladeRight">
        <div className="bladeHeader">Kind: OSC</div>

        <div className="bladeItem">
          Frequency:
          <input
            type="number"
            value={freq}
            onChange={(e) => setFreq(Number(e.target.value))}
          />
        </div>

        <div className="bladeItem">
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

        <div className="bladeButtonWrapper">
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

          <button className="btnDelete" onClick={() => deleteNode(selectedNode.id)}>
            Delete Node
          </button>
        </div>
      </div>
    );
  }

  // ---- GAIN UI ----
  if (isGainNode(selectedNode)) {
    return (
      <div className="bladeRight">
        <div className="bladeHeader">Kind: GAIN</div>

        <div className="bladeItem">
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
          <div>{selectedNode.params.value.toFixed(2)}</div>
        </div>

        <div className="bladeButtonWrapper">
          <button className="btnDelete" onClick={() => deleteNode(selectedNode.id)}>
            Delete Node
          </button>
        </div>
      </div>
    );
  }

  // ---- Destination UI ----
  if (isDestinationNode(selectedNode)) {
    return  (
      <div className="bladeRight">
        <div className="bladeHeader">Kind: Destination</div>
        <p>There is nothing that can be configured for this node.</p>
        <div className="bladeButtonWrapper">
          <p>You cannot delete this destination node. It represents the hardware.</p>
        </div>
      </div>);
  }

  // ---- FALLBACK ----
  return <div>Unknown node type</div>;
}
