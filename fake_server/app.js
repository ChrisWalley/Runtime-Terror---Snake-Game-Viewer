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

/*

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

*/
var gameState =
{
  ref: gameRef,
  state: 0,
  apple: 16+" "+18,
  obstacle0: "1 16,32 16,33 16,34 16,35 16,36",
  obstacle1: "2 47,26 46,26 45,26 44,26 43,26",
  obstacle2: "0 30,21 29,21 28,21 27,21 26,21",
  snake0: "0 alive 26 2 9,5 3,5",
  snake1: "1 alive 15 2 48,16 7,16",
  snake2: "2 alive 32 2 33,38 19,38",
  snake3: "3 alive 7 2 1,47 38,47",
  snake0Score: 26,
  snake1Score: 15,
  snake2Score: 32,
  snake3Score: 7
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

function moveSnakes(gameState)
{
  var snake0Arr = gameState.snake0.split(' ');
  var snake0kink1 = snake0Arr[4].split(',');
  var snake0kink2 = snake0Arr[5].split(',');
  snake0kink1[0] = parseInt(snake0kink1[0])+1;
  snake0kink2[0] = parseInt(snake0kink2[0])+1;
  if(snake0kink1[0] > 50)
  {
    snake0kink1[0] = 0;
  }
  if(snake0kink2[0] > 50)
  {
    snake0kink2[0] = 0;
  }
  var newSnake0 = snake0Arr[0]+" "+snake0Arr[1]+" "+snake0Arr[2]+" "+snake0Arr[3]+" "+snake0kink1[0]+","+snake0kink1[1]+" "+snake0kink2[0]+","+snake0kink2[1];
  gameState.snake0 = newSnake0;

  var snake1Arr = gameState.snake1.split(' ');
  var snake1kink1 = snake1Arr[4].split(',');
  var snake1kink2 = snake1Arr[5].split(',');
  snake1kink1[0] = parseInt(snake1kink1[0])+1;
  snake1kink2[0] = parseInt(snake1kink2[0])+1;
  if(snake1kink1[0] > 50)
  {
    snake1kink1[0] = 0;
  }
  if(snake1kink2[0] > 50)
  {
    snake1kink2[0] = 0;
  }
  var newSnake1 = snake1Arr[0]+" "+snake1Arr[1]+" "+snake1Arr[2]+" "+snake1Arr[3]+" "+snake1kink1[0]+","+snake1kink1[1]+" "+snake1kink2[0]+","+snake1kink2[1];
  gameState.snake1 = newSnake1;

  var snake2Arr = gameState.snake2.split(' ');
  var snake2kink1 = snake2Arr[4].split(',');
  var snake2kink2 = snake2Arr[5].split(',');
  snake2kink1[0] = parseInt(snake2kink1[0])+1;
  snake2kink2[0] = parseInt(snake2kink2[0])+1;
  if(snake2kink1[0] > 50)
  {
    snake2kink1[0] = 0;
  }
  if(snake2kink2[0] > 50)
  {
    snake2kink2[0] = 0;
  }
  var newsnake2 = snake2Arr[0]+" "+snake2Arr[1]+" "+snake2Arr[2]+" "+snake2Arr[3]+" "+snake2kink1[0]+","+snake2kink1[1]+" "+snake2kink2[0]+","+snake2kink2[1];
  gameState.snake2 = newsnake2;

  var snake3Arr = gameState.snake3.split(' ');
  var snake3kink1 = snake3Arr[4].split(',');
  var snake3kink2 = snake3Arr[5].split(',');
  snake3kink1[0] = parseInt(snake3kink1[0])+1;
  snake3kink2[0] = parseInt(snake3kink2[0])+1;
  if(snake3kink1[0] > 50)
  {
    snake3kink1[0] = 0;
  }
  if(snake3kink2[0] > 50)
  {
    snake3kink2[0] = 0;
  }
  var newsnake3 = snake3Arr[0]+" "+snake3Arr[1]+" "+snake3Arr[2]+" "+snake3Arr[3]+" "+snake3kink1[0]+","+snake3kink1[1]+" "+snake3kink2[0]+","+snake3kink2[1];
  gameState.snake3 = newsnake3;


  return gameState;
}

const getApiAndEmit = socket => {
  gameState.state++;
  gameState = moveSnakes(gameState);

  if(gameState.state>=gridSize*gridSize)
  {
    socket.emit("endGame", gameRef);
    var loop;
    wait(10000);

    gameRef++;
    gameState.ref = gameRef;
    console.log("Starting new game "+gameRef);
    socket.emit("startGame", gameRef);

  }

    socket.emit("gamestate", gameState);

  // Emitting a new message. Will be consumed by the client

};

server.listen(port, () => console.log(`Listening on port ${port}`));
