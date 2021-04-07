const express = require("express");
const io = require("socket.io")();

const port = process.env.PORT || 3001;
const index = require("./routes/index");

const app = express();
app.use(index);

const server = require("http").createServer(app);

//const io = socketIo(server);

let interval;

io.on("connection",  (socket) =>  {
  console.log("New client connected");
  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => getApiAndEmit(socket), 1000);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });
});

const getApiAndEmit = socket => {
  const response = new Date();
  // Emitting a new message. Will be consumed by the client
  socket.emit("FromAPI", response);
  console.log(response);
};

server.listen(port, () => console.log(`Listening on port ${port}`));
