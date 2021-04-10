import React, { useEffect, useState } from "react";
import socketIOClient from "socket.io-client";

const ENDPOINT = "http://localhost:3001";

export default function ClientComponent() {
  const [response, setResponse] = useState("Connecting...");

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.on("gamestate", data => {
      setResponse("Gamestate "+data);
    });

    return () => socket.disconnect();

  }, []);

  return (
    <p>
      <time dateTime={response}>{response}</time>
    </p>
  );
}
