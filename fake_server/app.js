const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const port = process.env.PORT || 3001;
const index = require("./routes/index");
const gridSize = 50;

var gameState = 0;
var appleX = 0;
var appleY = 0;

var gameRef = 0;

var gameState =
{
  ref: gameRef,
  state: 0,
  apple: appleX+" "+appleY,
  obstacle0: "1 16,32 16,33 16,34 16,35 16,36",
  obstacle1: "2 47,26 46,26 45,26 44,26 43,26",
  obstacle2: "0 30,21 29,21 28,21 27,21 26,21",
  snake0: "0 alive 26 2 10,12 15,12 15,7 5,7 5,2",
  snake1: "1 dead 6 6 14,13 19,13",
  snake2: "2 alive 2 1 12,13 12,14",
  snake3: "3 alive 17 1 31,14 21,14 15,14 15,13"
};

const app = express();
app.use(index);


const server = http.createServer(app);

const io = socketIo(server);

let interval;

io.on("connection", (socket) => {
  var address = socket.handshake.address;

  console.log('New connection from ' + address.address + ':' + address.port);
  socket.emit("startGame", gameRef);
  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => getApiAndEmit(socket), 50);
  console.log("Starting new game "+gameRef);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });
});

function wait(ms){
   var start = new Date().getTime();
   var end = start;
   while(end < start + ms) {
     end = new Date().getTime();
  }
}

const getApiAndEmit = socket => {
  gameState.state++;
  gameState.state = gameState.state%(gridSize*gridSize);
  appleX++;
  if(appleX>=gridSize)
  {
    appleX = 0;
    appleY++;
  }
  //if(appleY>=gridSize)
  if(appleY>=gridSize)
  {
    appleX = 0;
    appleY = 0;
    socket.emit("endGame", gameRef);
    var loop;
    wait(10000);

    gameRef++;
    gameState.ref = gameRef;
    console.log("Starting new game "+gameRef);
    socket.emit("startGame", gameRef);

  }

    gameState.apple = (appleX+" "+appleY);
    socket.emit("gamestate", gameState);

  // Emitting a new message. Will be consumed by the client

};

server.listen(port, () => console.log(`Listening on port ${port}`));
