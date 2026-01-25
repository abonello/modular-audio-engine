import React, { createContext, useContext, useRef } from "react";

type WorkspaceContextValue = {
  workspaceRef: React.RefObject<HTMLDivElement | null>;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const workspaceRef = useRef<HTMLDivElement>(null);

  return (
    <WorkspaceContext.Provider value={{ workspaceRef }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
};
