import { useState } from 'react'
import { PatchProvider } from "./context/PatchContext";
import { ModeProvider } from "./context/ModeContext";
import './App.css'


function App() {
  return (
    <PatchProvider>
      <ModeProvider>
        <div className="App">
          <h1>ModularAudioEngine</h1>
        </div>
      </ModeProvider>
    </PatchProvider>
  );
}

export default App;
