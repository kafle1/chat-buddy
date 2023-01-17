import React, { useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import * as SocketIOClient from "socket.io-client";
import { SocketProviderProps } from "../types";

const SocketContext = React.createContext<SocketIOClient.Socket | undefined>(
  undefined
);

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ id, children }: SocketProviderProps) {
  const [socket, setSocket] = useState<SocketIOClient.Socket>();

  useEffect(() => {
    const newSocket = io("http://localhost:3000", { query: { id } });
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [id]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
