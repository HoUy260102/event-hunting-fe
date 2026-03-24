/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState } from "react";
export const HeaderContext = createContext(null);
export const HeaderProvider = ({ children }) => {
  const [title, setTitle] = useState("");
  return (
    <HeaderContext.Provider value={{ title, setTitle }}>
      {children}
    </HeaderContext.Provider>
  );
};