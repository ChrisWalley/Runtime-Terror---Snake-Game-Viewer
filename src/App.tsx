import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";

//import ClientComponent from "./ClientComponent.js";

const ENDPOINT = "http://walleyco.de:3001";
const parseCoords = require('./parseCoords');

const canvasHeight = 550;
const canvasWidth = 520;

const blockSize = 10;
const gridSize = 50;
const startX = 10;
const startY = 10;

var currentGamestate = -1
var realtimeGamestate = -1

var lastGameRef = -1;

var realtime = true;
var paused = false;
var addedClickEvent = false;

let gameStateArr = {};
//let cachedGames = [] as any;


var startedViewingGamestate = 0;
var waitingForFirstGamestate = true;

var gameState =
{
  ref: -1,
  state: -1,
  apple: "",
  obstacle0: "",
  obstacle1: "",
  obstacle2: "",
  snake0: "",
  snake1: "",
  snake2: "",
  snake3: ""
};

var gameColours =
{
  background: 'rgb(255, 255, 255)',
  progressBarGreen: 'rgb(0, 255, 0)',
  progressBarBlue: 'rgb(0, 0, 255)',
  progressBarRed: 'rgb(255, 0, 0)',
  border: 'rgb(0, 0, 0)',
  cellLines: 'rgb(185, 185, 185)',
  apple: 'rgb(218,165,32)',
  obstacles:'rgb(108,108,108)',
  snake0:'rgb(208,0,108)',
  snake1: 'rgb(108,50,108)',
  snake2: 'rgb(20,0,100)',
  snake3: 'rgb(0,205,108)'
}

var progBar = {
  x:0,
  y:0,
  width:0,
  height:0
}

var viewerX = 0;
var viewerY = 0;


var viewerContext;

function drawGameboard() {

  viewerContext.fillStyle = gameColours.background;     //Clears area
  viewerContext.fillRect(0,0, canvasWidth, canvasHeight);
  //viewerContext.fillRect(startX,startY, gridSize*blockSize, gridSize*blockSize);
  viewerContext.fillRect(startX,startY + gridSize*blockSize + 20, gridSize*blockSize, 10);

  if(gameState!=null && gameState.state>=0)
  {

    viewerContext.fillStyle = gameColours.progressBarGreen;         //Draws progress bar at bottom - current position
    viewerContext.fillRect(startX, startY + gridSize*blockSize + 20, (currentGamestate/(gridSize*gridSize))*(gridSize*blockSize), blockSize);

    viewerContext.fillStyle = gameColours.progressBarBlue;         //Draws progress bar at bottom - real gametime
    viewerContext.fillRect(startX + (realtimeGamestate/(gridSize*gridSize))*(gridSize*blockSize) -2 , startY + gridSize*blockSize + 20, 4, blockSize);

    viewerContext.fillStyle = gameColours.progressBarRed;         //Draws progress bar at bottom - started viewing gametime
    viewerContext.fillRect(startX + (startedViewingGamestate/(gridSize*gridSize))*(gridSize*blockSize) -2, startY + gridSize*blockSize + 20, 4, blockSize);

    progBar =
    {
      x:startX,
      y:startY + gridSize*blockSize + 20,
      width:(realtimeGamestate/(gridSize*gridSize))*(gridSize*blockSize),
      height:blockSize
    }

    viewerContext.strokeStyle = gameColours.border;          //Draws square around viewer and progress bar
    viewerContext.strokeRect(startX,startY, gridSize*blockSize, gridSize*blockSize);
    viewerContext.strokeRect(startX,startY + gridSize*blockSize + 20, gridSize*blockSize, 10);


      viewerContext.strokeStyle = gameColours.cellLines;
      var loopX;
      var loopY;
      for(loopX = 0; loopX < gridSize; loopX++)     //Draws squares around cells
      {
        for(loopY = 0; loopY < gridSize; loopY++)
        {
          viewerContext.strokeRect(startX + loopX*blockSize, startY + loopY*blockSize, blockSize, blockSize);
        }
      }

    //Apple
    var appleCoords = gameState.apple.split(' ');
    if(appleCoords.length > 1)
    {
      var appleX = parseInt(appleCoords[0]);
      var appleY = parseInt(appleCoords[1]);
      viewerContext.fillStyle = gameColours.apple;
      viewerContext.fillRect(startX + appleX*blockSize, startY +  appleY*blockSize, blockSize, blockSize); //Draws coloured sqaure in viewer
    }


    //Obstacles
    viewerContext.fillStyle = gameColours.obstacles;
    var obsStartIndex = 1;
    var i;

    //Obstacle 0
    var obsRects = parseCoords(gameState.obstacle0,obsStartIndex);
    for (i = 0; i < obsRects.length; i++) {
      viewerContext.fillRect(startX + obsRects[i]['startX']*blockSize, startY + obsRects[i]['startY']*blockSize, obsRects[i]['width']*blockSize, obsRects[i]['height']*blockSize); //Draws coloured sqaure in viewer
    }

    //Obstacle 1
    obsRects = parseCoords(gameState.obstacle1,obsStartIndex);
    for (i = 0; i < obsRects.length; i++) {
      viewerContext.fillRect(startX + obsRects[i]['startX']*blockSize, startY + obsRects[i]['startY']*blockSize, obsRects[i]['width']*blockSize, obsRects[i]['height']*blockSize); //Draws coloured sqaure in viewer
    }

    //Obstacle 2

    obsRects = parseCoords(gameState.obstacle2,obsStartIndex);
    for (i = 0; i < obsRects.length; i++) {
      viewerContext.fillRect(startX + obsRects[i]['startX']*blockSize, startY + obsRects[i]['startY']*blockSize, obsRects[i]['width']*blockSize, obsRects[i]['height']*blockSize); //Draws coloured sqaure in viewer
    }


    //Snakes
    //Snake 0
    var snakeStartIndex = 4;
    viewerContext.fillStyle = gameColours.snake0;

    var snakeRects = parseCoords(gameState.snake0,snakeStartIndex);
    for (i = 0; i < snakeRects.length; i++) {
      viewerContext.fillRect(startX + snakeRects[i]['startX']*blockSize, startY + snakeRects[i]['startY']*blockSize, snakeRects[i]['width']*blockSize, snakeRects[i]['height']*blockSize); //Draws coloured sqaure in viewer
    }

    //Snake 1
    viewerContext.fillStyle = gameColours.snake1;

    snakeRects = parseCoords(gameState.snake1,snakeStartIndex);
    for (i = 0; i < snakeRects.length; i++) {
      viewerContext.fillRect(startX + snakeRects[i]['startX']*blockSize, startY + snakeRects[i]['startY']*blockSize, snakeRects[i]['width']*blockSize, snakeRects[i]['height']*blockSize); //Draws coloured sqaure in viewer
    }

    //Snake 2
    viewerContext.fillStyle = gameColours.snake2;

    snakeRects = parseCoords(gameState.snake2,snakeStartIndex);
    for (i = 0; i < snakeRects.length; i++) {
      viewerContext.fillRect(startX + snakeRects[i]['startX']*blockSize, startY + snakeRects[i]['startY']*blockSize, snakeRects[i]['width']*blockSize, snakeRects[i]['height']*blockSize); //Draws coloured sqaure in viewer
    }

    //Snake 3
    viewerContext.fillStyle = gameColours.snake3;

    snakeRects = parseCoords(gameState.snake3,snakeStartIndex);
    for (i = 0; i < snakeRects.length; i++) {
      viewerContext.fillRect(startX + snakeRects[i]['startX']*blockSize, startY + snakeRects[i]['startY']*blockSize, snakeRects[i]['width']*blockSize, snakeRects[i]['height']*blockSize); //Draws coloured sqaure in viewer
    }
  }
  else if (lastGameRef>=0){
    var col1X = 100;
    var col2X = 350;
    var colStartY = 50;
    viewerContext.fillStyle = gameColours.border;
    viewerContext.font = "30px Arial";
    viewerContext.fillText("Game "+lastGameRef+":", (col1X+col2X)/2-50, colStartY);
    viewerContext.fillText("Player:", col1X, colStartY+100);
    viewerContext.fillText("Score:", col2X, colStartY+100);
    viewerContext.fillText("Snake 1", col1X, colStartY+200);
    viewerContext.fillText("0", col2X, colStartY+200);

    viewerContext.fillText("Snake 2", col1X, colStartY+250);
    viewerContext.fillText("0", col2X, colStartY+250);

    viewerContext.fillText("Snake 3", col1X, colStartY+300);
    viewerContext.fillText("0", col2X, colStartY+300);

    viewerContext.fillText("Snake 4", col1X, colStartY+350);
    viewerContext.fillText("0", col2X, colStartY+350);

  }

  requestAnimationFrame(drawGameboard);
}

function clickEventListener(event) {
  /*
  console.log("clicked "+event.pageX);
  console.log("clicked "+event.pageY);
  */
  var x = event.pageX - viewerX;
  var y = event.pageY - viewerY;

  if (y > progBar.y && y < progBar.y + progBar.height
             && x > progBar.x && x < progBar.x + progBar.width) {
             realtime = false;
             var clickedGameState = (x- startX)*gridSize/blockSize;
             if(clickedGameState >= startedViewingGamestate)
             {
               currentGamestate = clickedGameState;
             }
             console.log('clicked progress  bar' +clickedGameState);
         }

}

async function cacheGame(gameRef, game){
  window.sessionStorage.clear();                               //This piece of code fetches data from api_url,
  window.sessionStorage.setItem("cachedGame",JSON.stringify(game));              //Crashes after storing too many games, so set to only store last 1
  //cachedGames.push(gameRef);
  console.log("Caching game: "+gameRef);

    // @ts-ignore: Object is possibly 'null'.
    let tempGameStateArr = {};
    tempGameStateArr = JSON.parse(sessionStorage.getItem("cachedGame")!);
    console.log("Cached "+Object.keys(tempGameStateArr).length+" gamestates");

}

function App() {
  const viewerRef = React.useRef<HTMLCanvasElement>(null);
  const [context, setContext] = React.useState<CanvasRenderingContext2D | null>(null);
  const [response, setResponse] = useState("Connecting...");
  const [cachedGamesList, setCachedGamesList] = useState("");
  const [gameRef, setGameRef] = useState(-1);
  //const [drawCells, setDrawCells] = useState(drawCellsVar);

    useEffect(() => {

      if (viewerRef.current) {
        if(!addedClickEvent)
        {
          viewerRef.current.addEventListener('click', clickEventListener, false);
          viewerX = viewerRef.current.offsetLeft + viewerRef.current.clientLeft;
          viewerY = viewerRef.current.offsetTop + viewerRef.current.clientTop;
          addedClickEvent = true;
        }
        const renderCtx = viewerRef.current.getContext('2d');

        if (renderCtx) {
          setContext(renderCtx);
        }
      }

      if (context)
      {
        viewerContext = context;
        drawGameboard();
      }
      //drawCellsVar = drawCells;
    }, [context]);

        useEffect(() => {

          const socket = socketIOClient(ENDPOINT, { transports : ['websocket'] });
          socket.on("gamestate", data => {
            gameStateArr[data.state] = data;
            realtimeGamestate = data.state;
            if(realtime)
            {
              currentGamestate = realtimeGamestate;
            }
            else if(!paused)
            {
              currentGamestate++;
            }

            if(waitingForFirstGamestate)
            {
              startedViewingGamestate = realtimeGamestate;
              waitingForFirstGamestate = false;
            }

            gameState = gameStateArr[currentGamestate];
            setResponse("Realtime: "+data.state + " Viewing: "+currentGamestate);

          });

          socket.on("endGame", gameRef => {

            cacheGame(gameRef, gameStateArr);
            lastGameRef = gameRef;
            gameState =
            {
              ref: -1,
              state: -1,
              apple: "",
              obstacle0: "",
              obstacle1: "",
              obstacle2: "",
              snake0: "",
              snake1: "",
              snake2: "",
              snake3: ""
            };
            waitingForFirstGamestate = true;
            gameStateArr = {};
            realtimeGamestate = 0;
            currentGamestate = 0;
            setResponse("Waiting for next game");
            /*
            var gameStateListString = "Cached games: "+cachedGames[0];

            var p;
            for(p = 1; p < cachedGames.length; p++)
            {
              gameStateListString = gameStateListString+", "+cachedGames[p];
            }
            */

            setCachedGamesList("Cached games: "+lastGameRef);
          });

          socket.on("startGame", gameRef => {
            gameState =
            {
              ref: -1,
              state: -1,
              apple: "",
              obstacle0: "",
              obstacle1: "",
              obstacle2: "",
              snake0: "",
              snake1: "",
              snake2: "",
              snake3: ""
            };
            waitingForFirstGamestate = true;
            gameStateArr = {};
            realtimeGamestate = 0;
            currentGamestate = 0;
            setGameRef(gameRef)
            setResponse("Loading...");
          });

          return () => {socket.disconnect();};

          }, []);


  return (

    <div
      style={{
        textAlign: 'center',
      }}>
      <h1>Snake Game</h1>
      <p>
      {"Game number: "+gameRef}
      </p>
      <canvas
        id="viewer"
        ref={viewerRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{
          border: '2px solid #000',
          marginTop: 10,
        }}
      ></canvas>
      <p>
      {response}
      </p>
      <p>
      {cachedGamesList}
      </p>
    </div>

  );
}

export default App;

/*
<p>
  <button onClick={() => setDrawCells(false)}>
    Toggle Cells
  </button>
</p>
<p>
<time dateTime={testVar}>{"TestVar: "+testVar}</time>
</p>
<p>
<time dateTime={response}>{response}</time>
</p>
<p>
<time dateTime={applePos}>{"Apple: "+applePos}</time>
</p>
<p>
<time dateTime={snake0}>{"Snake 1: "+snake0}</time>
</p>
<p>
<time dateTime={snake1}>{"Snake 2: "+snake1}</time>
</p>
<p>
<time dateTime={snake2}>{"Snake 3: "+snake2}</time>
</p>
<p>
<time dateTime={snake3}>{"Snake 4: "+snake3}</time>
</p>
<p>
<time dateTime={obs0}>{"Obstacle 1: "+obs0}</time>
</p>
<p>
<time dateTime={obs1}>{"Obstacle 2: "+obs1}</time>
</p>
<p>
<time dateTime={obs2}>{"Obstacle 3: "+obs2}</time>
</p>
*/
