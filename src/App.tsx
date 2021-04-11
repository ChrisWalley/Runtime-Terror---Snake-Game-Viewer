import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";

//import ClientComponent from "./ClientComponent.js";

const ENDPOINT = "http://walleyco.de:3001";
const parseCoords = require('./parseCoords');

const blockSize = 10;
const gridSize = 50;
const startX = 10;
const startY = 10;


var gameState =
{
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
  progressBar: 'rgb(0, 255, 0)',
  border: 'rgb(0, 0, 0)',
  cellLines: 'rgb(185, 185, 185)',
  apple: 'rgb(218,165,32)',
  obstacles:'rgb(108,108,108)',
  snake0:'rgb(208,0,108)',
  snake1: 'rgb(108,50,108)',
  snake2: 'rgb(20,0,100)',
  snake3: 'rgb(0,205,108)'
}

var viewerContext;

function drawGameboard() {
  if(gameState.state>=0)
  {

    viewerContext.fillStyle = gameColours.background;     //Clears area
    viewerContext.fillRect(startX,startY, gridSize*blockSize, gridSize*blockSize);
    viewerContext.fillRect(startX,startY + gridSize*blockSize + 20, gridSize*blockSize, 10);

    viewerContext.fillStyle = gameColours.progressBar;         //Draws progress bar at bottom

    viewerContext.fillRect(startX, startY + gridSize*blockSize + 20, (gameState.state/(gridSize*gridSize))*(gridSize*blockSize), blockSize);


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
      console.log("Drawing from "+snakeRects[i]['startX'] + " with width "+snakeRects[i]['width']*blockSize);
      console.log("Drawing from "+snakeRects[i]['startY'] + " with height "+snakeRects[i]['height']*blockSize);
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

  requestAnimationFrame(drawGameboard);

}



function App() {
  const viewerRef = React.useRef<HTMLCanvasElement>(null);
  const [context, setContext] = React.useState<CanvasRenderingContext2D | null>(null);
  const [response, setResponse] = useState("Connecting...");
  //const [drawCells, setDrawCells] = useState(drawCellsVar);

    useEffect(() => {

      if (viewerRef.current) {
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
            gameState = data;
            setResponse("Gamestate "+gameState.state);

          });

              return () => {socket.disconnect();};

          }, []);


  return (

    <div
      style={{
        textAlign: 'center',
      }}>
      <h1>Snake Game</h1>
      <canvas
        id="viewer"
        ref={viewerRef}
        width={520}
        height={550}
        style={{
          border: '2px solid #000',
          marginTop: 10,
        }}
      ></canvas>
      <p>
      {response}
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
