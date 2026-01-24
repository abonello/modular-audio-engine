/*
 * src/ui/NodeInspector.tsx
 */

import { useEffect, useState } from "react";
import { usePatch } from "../context/PatchContext";
import { audioEngine } from "../audio/engineInstance";
import { isOscillatorNode, isGainNode, isDestinationNode, isFilterNode} from "../model/PatchTypes";
import type { Waveform, FilterType } from "../model/PatchTypes";
import { sliderToFreq, freqToSlider, SLIDER_MAX } from "../utils/frequency";

export default function NodeInspector() {
  const { patch, selectedNodeId, setPatch, deleteNode } = usePatch();
  const selectedNode = patch.nodes.find(n => n.id === selectedNodeId);
  const [freq, setFreq] = useState<number>(440);
  const [waveform, setWaveform] = useState<Waveform>("sine");
  const [filterType, setFilterType] = useState<"lowpass" | "highpass">("lowpass");
  const [cutoff, setCutoff] = useState<number>(1000);
  const [resonance, setResonance] = useState<number>(1.5);

  useEffect(() => {
    if (!selectedNode) return;

    if (isOscillatorNode(selectedNode)) {
      setFreq(selectedNode.params.frequency);
      setWaveform(selectedNode.params.waveform);
    }

    if (isFilterNode(selectedNode)) {
      setFilterType(selectedNode.params.type);
      setCutoff(selectedNode.params.cutoff);
      setResonance(selectedNode.params.resonance);
    }
  }, [selectedNodeId]);


  // const minFreq = 20;
  // const maxFreq = 20000;

  // const sliderToFreq = (value: number) => {
  //   const minLog = Math.log10(minFreq);
  //   const maxLog = Math.log10(maxFreq);

  //   const fraction = value / 1000; // slider value 0..1000
  //   const freqLog = minLog + fraction * (maxLog - minLog);

  //   return Math.pow(10, freqLog);
  // };

  // const freqToSlider = (freq: number) => {
  //   const minLog = Math.log10(minFreq);
  //   const maxLog = Math.log10(maxFreq);

  //   const freqLog = Math.log10(freq);
  //   const fraction = (freqLog - minLog) / (maxLog - minLog);

  //   return fraction * 1000;
  // };





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

  // ---- FILTER UI ----
  if (isFilterNode(selectedNode)) {
    if (!selectedNode.params) {
      return <div>Filter node missing params</div>;
    }

    return (
      <div className="bladeRight">
        <div className="bladeHeader">Kind: FILTER</div>

        <div className="bladeItem">
          Type:
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterType)}
          >
            <option value="lowpass">LP</option>
            <option value="highpass">HP</option>
          </select>
        </div>

        <div className="bladeItem">
          Cutoff:
          {/* <input
            type="number"
            value={cutoff}
            onChange={(e) => setCutoff(Number(e.target.value))}
            min={20}
            max={20000}
            step={1}
          /> */}
          {/* <input
            type="range"
            min={0}
            max={1000}
            step={1}
            value={freqToSlider(cutoff)}
            onChange={(e) => {
              const newFreq = sliderToFreq(Number(e.target.value));
              setCutoff(newFreq);
            }}
          /> */}
          <input
            type="range"
            min={0}
            max={SLIDER_MAX}
            step={1}
            value={freqToSlider(cutoff)}
            onChange={(e) => {
              const newCutoff = sliderToFreq(Number(e.target.value));
              setCutoff(newCutoff);
            }}
          />
          <div>{cutoff.toFixed(0)}</div>
        </div>

        <div className="bladeItem">
          Resonance:
          <input
            type="range"
            min={0.1}
            max={100}
            step={0.1}
            value={resonance}
            onChange={(e) => setResonance(Number(e.target.value))}
          />
          <div>{resonance.toFixed(2)}</div>
        </div>

        <div className="bladeButtonWrapper">
          <button onClick={() => {
            setPatch(prev => ({
              ...prev,
              nodes: prev.nodes.map((n) => {
                if (n.id !== selectedNode.id) return n;
                return isFilterNode(n)
                  ? { ...n, params: { ...n.params, type: filterType, cutoff, resonance } }
                  : n;
                }),
              }));

              audioEngine.setNodeFilter(selectedNode.id, filterType, cutoff, resonance);
            }}
          >
            Apply
          </button>
          <button className="btnDelete" onClick={() => deleteNode(selectedNode.id)}>Delete</button>
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
