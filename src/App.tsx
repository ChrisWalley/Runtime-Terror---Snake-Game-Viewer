import React, { useState, useEffect } from "react";

import ClientComponent from "./ClientComponent.js";


//const app = require('express')();
//const http = require('http').Server(app);
//const io = require('socket.io')(http);


const blockSize = 10;
const gridSize = 50;
const startX = 10;
const startY = 10;
var currPos = 0;

var viewerContext;

function loop() {
  var loopX;
  var loopY;

  var currX = ~~(currPos%gridSize);
  var currY = ~~(currPos/gridSize);


  viewerContext.fillStyle = 'rgb(255, 255, 255)';     //Clears area to white
  viewerContext.fillRect(startX,startY, gridSize*blockSize, gridSize*blockSize);
  viewerContext.fillRect(startX,startY + gridSize*blockSize + 20, gridSize*blockSize, 10);

  viewerContext.fillStyle = 'rgb(0, 255, 0)';         //Draws progress bar at bottom

  viewerContext.fillRect(startX, startY + gridSize*blockSize + 20, (currPos/(gridSize*gridSize))*(gridSize*blockSize), blockSize);


  viewerContext.strokeStyle = 'rgb(0, 0, 0)';         //Draws square around viewer and progress bar
  viewerContext.strokeRect(startX,startY, gridSize*blockSize, gridSize*blockSize);
  viewerContext.strokeRect(startX,startY + gridSize*blockSize + 20, gridSize*blockSize, 10);

  viewerContext.fillStyle = 'rgb(128,0,128)';
  viewerContext.fillRect(startX + currX*blockSize, startY + currY*blockSize, blockSize, blockSize); //Draws coloured sqaure in viewer


  viewerContext.strokeStyle = 'rgb(125, 125, 125)';

  for(loopX = 0; loopX < gridSize; loopX++)     //Draws squares around cells
  {
    for(loopY = 0; loopY < gridSize; loopY++)
    {
      viewerContext.strokeRect(startX + loopX*blockSize, startY + loopY*blockSize, blockSize, blockSize);
    }
  }



  currPos+=.15;
  currPos = currPos%(gridSize*gridSize);
  requestAnimationFrame(loop);
}

function App() {
  const viewerRef = React.useRef<HTMLCanvasElement>(null);
  const [context, setContext] = React.useState<CanvasRenderingContext2D | null>(null);

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
      <ClientComponent />
    </div>




  );
}

export default App;
