import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";

//import ClientComponent from "./ClientComponent.js";

const ENDPOINT = "http://walleyco.de:3001";
const parseCoords = require('./parseCoords');

const blockSize = 10;
const gridSize = 50;
const startX = 10;
const startY = 10;

var currPos = -1;

var gameState =
{
  state: 0,
  apple: "0 0",
  obstacle0: "",
  obstacle1: "",
  obstacle2: "",
  snake0: "",
  snake1: "",
  snake2: "",
  snake3: ""
};

var testVar = "";

var viewerContext;

function loop() {
  if(gameState.state>=0)
  {

    viewerContext.fillStyle = 'rgb(255, 255, 255)';     //Clears area to white
    viewerContext.fillRect(startX,startY, gridSize*blockSize, gridSize*blockSize);
    viewerContext.fillRect(startX,startY + gridSize*blockSize + 20, gridSize*blockSize, 10);

    viewerContext.fillStyle = 'rgb(0, 255, 0)';         //Draws progress bar at bottom

    viewerContext.fillRect(startX, startY + gridSize*blockSize + 20, (gameState.state/(gridSize*gridSize))*(gridSize*blockSize), blockSize);


    viewerContext.strokeStyle = 'rgb(0, 0, 0)';         //Draws square around viewer and progress bar
    viewerContext.strokeRect(startX,startY, gridSize*blockSize, gridSize*blockSize);
    viewerContext.strokeRect(startX,startY + gridSize*blockSize + 20, gridSize*blockSize, 10);


/*

    viewerContext.strokeStyle = 'rgb(185, 185, 185)';

    for(loopX = 0; loopX < gridSize; loopX++)     //Draws squares around cells
    {
      for(loopY = 0; loopY < gridSize; loopY++)
      {
        viewerContext.strokeRect(startX + loopX*blockSize, startY + loopY*blockSize, blockSize, blockSize);
      }
    }
*/

    //Apple
    var appleCoords = gameState.apple.split(' ');
    if(appleCoords.length > 1)
    {
      var appleX = parseInt(appleCoords[0]);
      var appleY = parseInt(appleCoords[1]);
      viewerContext.fillStyle = 'rgb(218,165,32)';
      viewerContext.fillRect(startX + appleX*blockSize, startY +  appleY*blockSize, blockSize, blockSize); //Draws coloured sqaure in viewer
    }


    //Obstacles
    viewerContext.fillStyle = 'rgb(108,108,108)';
    var obsStartIndex = 1;
    var obsArr;
    var i;

    //Obstacle 1
    var obsRects = parseCoords(gameState.obstacle0,obsStartIndex);
    for (i = 0; i < obsRects.length; i++) {
      viewerContext.fillRect(startX + obsRects[i]['startX']*blockSize, startY + obsRects[i]['startY']*blockSize, obsRects[i]['width']*blockSize, obsRects[i]['height']*blockSize); //Draws coloured sqaure in viewer
    }

    //Obstacle 2
    obsRects = parseCoords(gameState.obstacle1,obsStartIndex);
    for (i = 0; i < obsRects.length; i++) {
      viewerContext.fillRect(startX + obsRects[i]['startX']*blockSize, startY + obsRects[i]['startY']*blockSize, obsRects[i]['width']*blockSize, obsRects[i]['height']*blockSize); //Draws coloured sqaure in viewer
    }

    //Obstacle 3

    obsRects = parseCoords(gameState.obstacle2,obsStartIndex);
    for (i = 0; i < obsRects.length; i++) {
      viewerContext.fillRect(startX + obsRects[i]['startX']*blockSize, startY + obsRects[i]['startY']*blockSize, obsRects[i]['width']*blockSize, obsRects[i]['height']*blockSize); //Draws coloured sqaure in viewer
    }


    //Snakes
    //Snake 1
    var snakeStartIndex = 4;
    viewerContext.fillStyle = 'rgb(208,0,108)';

    var snakeRects = parseCoords(gameState.snake0,snakeStartIndex);
    for (i = 0; i < snakeRects.length; i++) {
      viewerContext.fillRect(startX + snakeRects[i]['startX']*blockSize, startY + snakeRects[i]['startY']*blockSize, snakeRects[i]['width']*blockSize, snakeRects[i]['height']*blockSize); //Draws coloured sqaure in viewer
    }

    //Snake 2
    viewerContext.fillStyle = 'rgb(108,50,108)';

    snakeRects = parseCoords(gameState.snake1,snakeStartIndex);
    for (i = 0; i < snakeRects.length; i++) {
      viewerContext.fillRect(startX + snakeRects[i]['startX']*blockSize, startY + snakeRects[i]['startY']*blockSize, snakeRects[i]['width']*blockSize, snakeRects[i]['height']*blockSize); //Draws coloured sqaure in viewer
    }

    //Snake 3
    viewerContext.fillStyle = 'rgb(20,0,100)';

    snakeRects = parseCoords(gameState.snake2,snakeStartIndex);
    for (i = 0; i < snakeRects.length; i++) {
      viewerContext.fillRect(startX + snakeRects[i]['startX']*blockSize, startY + snakeRects[i]['startY']*blockSize, snakeRects[i]['width']*blockSize, snakeRects[i]['height']*blockSize); //Draws coloured sqaure in viewer
    }

    //Snake 4
    viewerContext.fillStyle = 'rgb(0,205,108)';

    snakeRects = parseCoords(gameState.snake3,snakeStartIndex);
    for (i = 0; i < snakeRects.length; i++) {
      viewerContext.fillRect(startX + snakeRects[i]['startX']*blockSize, startY + snakeRects[i]['startY']*blockSize, snakeRects[i]['width']*blockSize, snakeRects[i]['height']*blockSize); //Draws coloured sqaure in viewer
    }

  }

  requestAnimationFrame(loop);


}



function App() {
  const viewerRef = React.useRef<HTMLCanvasElement>(null);
  const [context, setContext] = React.useState<CanvasRenderingContext2D | null>(null);
  const [response, setResponse] = useState("Connecting...");

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
        loop();
      }

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
      <time dateTime={response}>{response}</time>
      </p>
    </div>

  );
}

export default App;

/*
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
