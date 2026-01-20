import { useState } from 'react'
import { PatchProvider } from "./context/PatchContext";
import './App.css'


function App() {
  return (
    <PatchProvider>
      <div className="App">
        <h1>ModularAudioEngine</h1>
      </div>
    </PatchProvider>
  );
}

export default App;
