/*
 * src/ui/Layout/Layout.tsx
 */

import { useRef, useContext, useEffect } from "react";
import { MidiContext } from "../../context/MidiContext";
import { audioEngine } from "../../audio/engineInstance";
import Header from "./Header";
import Banner from "./Banner";
import LeftBlade from "./LeftBlade";
import RightBlade from "./RightBlade";
import Workspace from "./Workspace/Workspace";
import Footer from "./Footer";


export default function Layout() {
  const { setNote, setVelocity } = useContext(MidiContext);
  const midiInitRef = useRef(false);

  useEffect(() => {
    if (midiInitRef.current) return;
    midiInitRef.current = true;

    audioEngine.setMidiCallbacks(setNote, setVelocity);
    audioEngine.initMIDI();
  }, [setNote, setVelocity]);

  return (
    <div className="appRoot">
      <Header />
      <Banner />
      <div className="mainArea">
        <LeftBlade>
          {/* tools will be injected here later */}
          {""}
        </LeftBlade>

        <Workspace>
          {/* workspace content injected later */}
          {""}
        </Workspace>

        <RightBlade>
          {/* inspector will be injected here later */}
          {""}
        </RightBlade>
      </div>
      <Footer />
    </div>
  );
}
