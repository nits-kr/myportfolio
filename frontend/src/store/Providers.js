"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import { ThemeProvider } from "@/context/ThemeContext";
import "@/services/syncService";

export function Providers({ children }) {
  return (
    <Provider store={store}>
      <ThemeProvider>{children}</ThemeProvider>
    </Provider>
  );
}
