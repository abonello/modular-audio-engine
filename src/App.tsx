import { useState } from 'react'
import Layout from "./ui/Layout";
import "./ui/Layout.css";
import { PatchProvider } from "./context/PatchContext";
import { ModeProvider } from "./context/ModeContext";
import './App.css'


function App() {
  return (
    <PatchProvider>
      <ModeProvider>
        <div className="App">
          <h1>ModularAudioEngine</h1>
          <Layout />
        </div>
      </ModeProvider>
    </PatchProvider>
  );
}

export default App;
