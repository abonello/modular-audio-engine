import Layout from "./ui/Layout/Layout";
import "./ui/Layout/Layout.css";
import { PatchProvider } from "./context/PatchContext";
import { ConnectionEditProvider } from './context/ConnectionEditContext';
import { BladeProvider } from "./context/BladeContext";
import { ModeProvider } from "./context/ModeContext";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import './App.css'


function App() {
  return (
    <PatchProvider>
      <ConnectionEditProvider>
        <BladeProvider>
          <ModeProvider>
            <WorkspaceProvider>
              <div className="App">
                <Layout />
              </div>
            </WorkspaceProvider>
          </ModeProvider>
        </BladeProvider>
      </ConnectionEditProvider>
    </PatchProvider>
  );
}

export default App;
