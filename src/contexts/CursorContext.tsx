import React, { createContext, useContext, useState } from "react";

interface CursorMap {
  [nodeId: string]: number;
}

interface CursorContextValue {
  positions: CursorMap;
  setCursorPosition: (nodeId: string, pos: number) => void;
  getCursorPosition: (nodeId: string) => number;
}

const CursorContext = createContext<CursorContextValue | null>(null);

export const CursorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [positions, setPositions] = useState<CursorMap>({});

  const setCursorPosition = (nodeId: string, pos: number) => {
    setPositions(prev => ({ ...prev, [nodeId]: pos }));
  };

  const getCursorPosition = (nodeId: string) => {
    return positions[nodeId] ?? 0;
  };

  return (
    <CursorContext.Provider value={{ positions, setCursorPosition, getCursorPosition }}>
      {children}
    </CursorContext.Provider>
  );
};

export const useCursorContext = (): CursorContextValue => {
  const ctx = useContext(CursorContext);
  if (!ctx) throw new Error("useCursorContext deve ser usado dentro de um CursorProvider");
  return ctx;
};
