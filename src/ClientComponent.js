import React, { useEffect, useState } from "react";
const io = require("socket.io-client");

const ENDPOINT = "http://walleyco.de:3001";
var counter = 0;

export default function ClientComponent() {
  const [response, setResponse] = useState("");

  useEffect(() => {

    const socket = io(ENDPOINT);
    socket.connect();

    setResponse("Connecting to "+ENDPOINT+" "+socket.connected + " " +counter + " ");

    socket.on("connect", () => {
      console.log(socket.id); // "G5p5..."
      setResponse("Connected to "+ENDPOINT);
    });
    socket.on("FromAPI", data => {
      setResponse("It's"+data);
    });
    socket.on("connect", data => {
      setResponse("It's"+data);
    });
    counter++;
    return () => socket.disconnect();

  }, []);

  return (
    <p>
      <time dateTime={response}>{response}</time>
    </p>
  );
}
