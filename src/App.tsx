import { useState } from 'react'
import Layout from "./ui/Layout/Layout";
import "./ui/Layout/Layout.css";
import { PatchProvider } from "./context/PatchContext";
import { BladeProvider } from "./context/BladeContext";
import { ModeProvider } from "./context/ModeContext";
import './App.css'


function App() {
  return (
    <PatchProvider>
      <BladeProvider>
        <ModeProvider>
          <div className="App">
            <Layout />
          </div>
        </ModeProvider>
      </BladeProvider>
    </PatchProvider>
  );
}

export default App;
