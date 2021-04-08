const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const port = process.env.PORT || 3001;
const index = require("./routes/index");
const gridSize = 50;

var gameState = 0;

const app = express();
app.use(index);


const server = http.createServer(app);

const io = socketIo(server);

let interval;

io.on("connection", (socket) => {
  console.log("New client connected");
  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => getApiAndEmit(socket), 50);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });
});

const getApiAndEmit = socket => {
  gameState++;
  gameState = gameState%(gridSize*gridSize);

  // Emitting a new message. Will be consumed by the client
  socket.emit("gamestate", gameState);
  socket.emit("apple", "8 16");
  socket.emit("obstacle", "0 30,21 29,21 28,21 27,21 26,21");
  socket.emit("obstacle", "1 16,32 16,33 16,34 16,35 16,36");
  socket.emit("obstacle", "2 47,26 46,26 45,26 44,26 43,26");
  socket.emit("snake", "0 alive 26 2 10,12 15,12 15,7 5,7 5,2");
  socket.emit("snake", "1 dead 6 6 14,13 19,13");
  socket.emit("snake", "2 alive 2 1 12,13 12,14");
  socket.emit("snake", "3 alive 17 1 31,14 21,14 15,14 15,13");
};

server.listen(port, () => console.log(`Listening on port ${port}`));
