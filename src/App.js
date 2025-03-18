import React from "react";
import Page from "./pages/home";
import DataContextProvider from "./context";
import "./App.css";

function App() {
  return (
    <div className="app">
      <DataContextProvider>
        <Page />
      </DataContextProvider>
    </div>
  );
}

export default App;
