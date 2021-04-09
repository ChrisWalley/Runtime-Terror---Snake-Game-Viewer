import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";

//import ClientComponent from "./ClientComponent.js";

const ENDPOINT = "http://walleyco.de:3001";
const api_url = 'https://api.wheretheiss.at/v1/satellites/25544'; 

const blockSize = 10;
const gridSize = 50;
const startX = 10;
const startY = 10;

var currPos = -1;

var applePos = "0 0";

var snake0 = "";
var snake1 = "";
var snake2 = "";
var snake3 = "";

var obs0 = "";
var obs1 = "";
var obs2 = "";

var viewerContext;

function loop() {
  if(currPos>=0)
  {
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




    viewerContext.strokeStyle = 'rgb(185, 185, 185)';

    for(loopX = 0; loopX < gridSize; loopX++)     //Draws squares around cells
    {
      for(loopY = 0; loopY < gridSize; loopY++)
      {
        viewerContext.strokeRect(startX + loopX*blockSize, startY + loopY*blockSize, blockSize, blockSize);
      }
    }


    //Apple
    var appleCoords = applePos.split(' ');
    if(appleCoords.length > 1)
    {
      var appleX = parseInt(appleCoords[0]);
      var appleY = parseInt(appleCoords[1]);
      viewerContext.fillStyle = 'rgb(218,165,32)';
      viewerContext.fillRect(startX + appleX*blockSize, startY +  appleY*blockSize, blockSize, blockSize); //Draws coloured sqaure in viewer
    }


    //Obstacles
    viewerContext.fillStyle = 'rgb(108,108,108)';
    var obsArr;
    var i;

    //Obstacle 1
    obsArr = obs0.split(' ');
    for (i = 1; i < obsArr.length; i++) {
      var pos = obsArr[i];
      var posArr = pos.split(',');
      viewerContext.fillRect(startX + posArr[0]*blockSize, startY + posArr[1]*blockSize, blockSize, blockSize); //Draws coloured sqaure in viewer
    }

    //Obstacle 2
    obsArr = obs1.split(' ');
    for (i = 1; i < obsArr.length; i++) {
      var pos = obsArr[i];
      var posArr = pos.split(',');
      viewerContext.fillRect(startX + posArr[0]*blockSize, startY + posArr[1]*blockSize, blockSize, blockSize); //Draws coloured sqaure in viewer
    }

    //Obstacle 3
    obsArr = obs2.split(' ');
    for (i = 1; i < obsArr.length; i++) {
      var pos = obsArr[i];
      var posArr = pos.split(',');
      viewerContext.fillRect(startX + posArr[0]*blockSize, startY + posArr[1]*blockSize, blockSize, blockSize); //Draws coloured sqaure in viewer
    }

    //Snakes
    var snakeArr;
    var i;

    //Snake 1
    viewerContext.fillStyle = 'rgb(208,0,108)';

    snakeArr = snake0.split(' ');
    for (i = 4; i < snakeArr.length; i++) {
      var pos = snakeArr[i];
      var posArr = pos.split(',');
      viewerContext.fillRect(startX + posArr[0]*blockSize, startY + posArr[1]*blockSize, blockSize, blockSize); //Draws coloured sqaure in viewer
    }

    //Snake 2
    viewerContext.fillStyle = 'rgb(108,50,108)';

    snakeArr = snake1.split(' ');
    for (i = 4; i < snakeArr.length; i++) {
      var pos = snakeArr[i];
      var posArr = pos.split(',');
      viewerContext.fillRect(startX + posArr[0]*blockSize, startY + posArr[1]*blockSize, blockSize, blockSize); //Draws coloured sqaure in viewer
    }

    //Snake 3
    viewerContext.fillStyle = 'rgb(20,0,100)';

    snakeArr = snake2.split(' ');
    for (i = 4; i < snakeArr.length; i++) {
      var pos = snakeArr[i];
      var posArr = pos.split(',');
      viewerContext.fillRect(startX + posArr[0]*blockSize, startY + posArr[1]*blockSize, blockSize, blockSize); //Draws coloured sqaure in viewer
    }

    //Snake 4
    viewerContext.fillStyle = 'rgb(99,205,108)';

    snakeArr = snake3.split(' ');
    for (i = 4; i < snakeArr.length; i++) {
      var pos = snakeArr[i];
      var posArr = pos.split(',');
      viewerContext.fillRect(startX + posArr[0]*blockSize, startY + posArr[1]*blockSize, blockSize, blockSize); //Draws coloured sqaure in viewer
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
    

      const socket = socketIOClient(ENDPOINT);
      socket.on("gamestate", data => {
        setResponse("Gamestate "+data);
        currPos = data;
      });

      socket.on("apple", data => {
        applePos = data;
      });

      socket.on("snake", data => {
        var arr = data.split(' ');
        switch(arr[0]) {
          case "0":
              snake0 = data;
            break;
          case "1":
              snake1 = data;
            break;
          case "2":
              snake2 = data;
            break;
          case "3":
              snake3 = data;
          break;
              }
          });

      socket.on("obstacle", data => {
        var arr = data.split(' ');
        switch(arr[0]) {
          case "0":
              obs0 = data;
            break;
          case "1":
              obs1 = data;
            break;
          case "2":
              obs2 = data;
            break;
              }
          });


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
    </div>




  );
}

var gameStateCounter = 0;                                    //In order to keep track of game states
async function getISS(){                                     //This piece of code fetches data from api_url,
  var response = await fetch(api_url);                       // stores it and then logs it to console. Data is lost if page is refreshed
  var data = await response.json();
  window.sessionStorage.setItem(gameStateCounter.toString(10),data.latitude);
  console.log(sessionStorage.getItem(gameStateCounter.toString(10)));
  gameStateCounter++;
}
getISS();
setInterval(getISS,1000);


export default App;
