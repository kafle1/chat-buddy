import React, { useState } from "react";
import Chat from "./components/Chat.old";
import "./App.css";
import Login from "./components/Login";
import { useLocalStorageId } from "./hooks/useLocalStorage";
import Dashboard from "./components/Dashboard";
import { SocketProvider } from "./context/SocketProvider";

const App = () => {
  const [id, setid] = useLocalStorageId("");
  return (
    <>
      {id ? (
        <SocketProvider id={id}>
          <Dashboard id={id} />
        </SocketProvider>
      ) : (
        <Login onIdSubmit={setid} />
      )}
    </>
  );
};

export default App;
