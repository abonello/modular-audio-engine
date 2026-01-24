import React, { createContext, useContext, useState } from "react";

type ConnectionEditContextType = {
  editConnectionsMode: boolean;
  setEditConnectionsMode: React.Dispatch<React.SetStateAction<boolean>>;
};

const ConnectionEditContext = createContext<ConnectionEditContextType | undefined>(undefined);

export function ConnectionEditProvider({ children }: { children: React.ReactNode }) {
  const [editConnectionsMode, setEditConnectionsMode] = useState(false);

  return (
    <ConnectionEditContext.Provider value={{ editConnectionsMode, setEditConnectionsMode }}>
      {children}
    </ConnectionEditContext.Provider>
  );
}

export function useConnectionEdit() {
  const context = useContext(ConnectionEditContext);
  if (!context) throw new Error("useConnectionEdit must be used within ConnectionEditProvider");
  return context;
}
