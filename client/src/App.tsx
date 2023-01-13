import React, { useState } from "react";
import Chat from "./components/Chat.old";
import "./App.css";
import Login from "./components/Login";
import {useLocalStorageId} from "./hooks/useLocalStorage";
import Dashboard from "./components/Dashboard";

const App = () => {
  const [id, setid] = useLocalStorageId('');
  return <>{id ? <Dashboard id={id} /> : <Login onIdSubmit={setid} />}</>;
};

export default App;
