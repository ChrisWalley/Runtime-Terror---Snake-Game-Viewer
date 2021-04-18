import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";


const ENDPOINT = "http://walleyco.de:3001";
const CONFIG_PATH = 'games/config';
const COUNT_PATH = 'games/count';

const parseCoords = require('./parseCoords');

const canvasHeight = 550;
const canvasWidth = 520;

const blockSize = 10;
const startX = 10;
const startY = 10;

var currentGamestate = -1
var realtimeGamestate = -1

var lastGameRef = -1;
var lastGameSnake0Score = -1;
var lastGameSnake1Score = -1;
var lastGameSnake2Score = -1;
var lastGameSnake3Score = -1;

var realtime = true;
var gamePaused = false;
var addedClickEvent = false;

let gameStateArr = {};



var startedViewingGamestate = 0;
var waitingForFirstGamestate = true;

let divisions = [] as any[];
var nGames = 0;
/*
([
{ label: "Division 1", value: "Division 1" },
{ label: "Division 2", value: "Division 2" },
{ label: "Division 3", value: "Division 3" },
{ label: "Division 4", value: "Division 4" }
]);
*/

var config =
{
  game_time : 300,
  game_mode : 'GROW',
  game_speed : 50,
  apple_growth : 5,
  starting_length : 5,
  num_snakes : 4,
  num_apples : 1,
  special_apple : true,
  apple_limit : 200,
  decay_rate : 0.1,
  game_width  : 50,
  game_height : 50,
  between_rounds  : 10000,
  num_obstacles : 3,
  num_zombies  : -1,
  zombie_speed  : -1,
  invisibility_period  : -1,
};

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
  snake3: "",
  snake0Score: -1,
  snake1Score: -1,
  snake2Score: -1,
  snake3Score: -1
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
  if(true)
  {
    viewerContext.fillStyle = gameColours.background;     //Clears area
    viewerContext.fillRect(0,0, canvasWidth, canvasHeight);
    viewerContext.fillRect(startX,startY + config.game_width*blockSize + 20, config.game_height*blockSize, 10);

    if(gameState!=null && gameState.state>=0)
    {

        viewerContext.fillStyle = gameColours.progressBarGreen;         //Draws progress bar at bottom - current position
        viewerContext.fillRect(startX, startY + config.game_width*blockSize + 20, (currentGamestate/(config.game_width*config.game_height))*(config.game_width*blockSize), blockSize);

        viewerContext.fillStyle = gameColours.progressBarBlue;         //Draws progress bar at bottom - real gametime
        viewerContext.fillRect(startX + (realtimeGamestate/(config.game_width*config.game_width))*(config.game_height*blockSize) -2 , startY + config.game_height*blockSize + 20, 4, blockSize);

        viewerContext.fillStyle = gameColours.progressBarRed;         //Draws progress bar at bottom - started viewing gametime
        viewerContext.fillRect(startX + (startedViewingGamestate/(config.game_width*config.game_width))*(config.game_height*blockSize) -2, startY + config.game_height*blockSize + 20, 4, blockSize);

        progBar =
        {
          x:startX,
          y:startY + config.game_height*blockSize + 20,
          width:(realtimeGamestate/(config.game_height*config.game_height))*(config.game_height*blockSize),
          height:blockSize
        }

        viewerContext.strokeStyle = gameColours.border;          //Draws square around viewer and progress bar
        viewerContext.strokeRect(startX,startY, config.game_width*blockSize, config.game_height*blockSize);
        viewerContext.strokeRect(startX,startY + config.game_height*blockSize + 20, config.game_width*blockSize, 10);


          viewerContext.strokeStyle = gameColours.cellLines;
          var loopX;
          var loopY;
          for(loopX = 0; loopX < config.game_width; loopX++)     //Draws squares around cells
          {
            for(loopY = 0; loopY < config.game_height; loopY++)
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
      viewerContext.fillText(lastGameSnake0Score, col2X, colStartY+200);

      viewerContext.fillText("Snake 2", col1X, colStartY+250);
      viewerContext.fillText(lastGameSnake1Score, col2X, colStartY+250);

      viewerContext.fillText("Snake 3", col1X, colStartY+300);
      viewerContext.fillText(lastGameSnake2Score, col2X, colStartY+300);

      viewerContext.fillText("Snake 4", col1X, colStartY+350);
      viewerContext.fillText(lastGameSnake3Score, col2X, colStartY+350);

    }
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
             var clickedGameState = (x- startX)*config.game_width/blockSize;
             if(clickedGameState >= startedViewingGamestate)
             {
               currentGamestate = clickedGameState;
             }
             console.log('clicked progress  bar' +clickedGameState);
         }
}

function getConfig() {
  //fetch(ENDPOINT+'/games/config')
  fetch('https://httpbin.org/ip')//IP to test for now.
        .then(response => response.json())
        .then(data =>
        {
          console.log(data);
        });
}

function getDivisions() {
/*
This function will be used to fill in the divisions for the game.
At the moment it is commented out because the server isn't up yet.
Number of divisions is hardcoded to 10.
  fetch(ENDPOINT+COUNT_PATH)
        .then(response => response.json())
        .then(data =>
        {
          console.log(data);
        });
*/

// populating dropdown list
divisions = [];
 var i;
 nGames = 10;
 for(i = 1;i <= nGames;i++)
 {
   divisions.push({ label: "Division "+i, value: "Division "+i});
 }
}
//end of dropdown list


function resetGamestate()
{
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
    snake3: "",
    snake0Score: -1,
    snake1Score: -1,
    snake2Score: -1,
    snake3Score: -1
  };
  waitingForFirstGamestate = true;
  gameStateArr = {};
  realtimeGamestate = 0;
  currentGamestate = 0;
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

function saveGameData(gameReference, saveGameState)
{
  lastGameRef = gameReference;
  lastGameSnake0Score = saveGameState.snake0Score;
  lastGameSnake1Score = saveGameState.snake1Score;
  lastGameSnake2Score = saveGameState.snake2Score;
  lastGameSnake3Score = saveGameState.snake3Score;
  return true;
}


function App() {
  const viewerRef = React.useRef<HTMLCanvasElement>(null);
  const [context, setContext] = React.useState<CanvasRenderingContext2D | null>(null);
  const [response, setResponse] = useState("Connecting...");
  const [cachedGamesList, setCachedGamesList] = useState("");
  const [gameRef, setGameRef] = useState(-1);
  //const [paused, setPaused] = useState(true);

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

            if(!gamePaused)
            {
              if(realtime)
              {
                currentGamestate = realtimeGamestate;
              }
              else
              {
                currentGamestate++;
              }
            }
            else
            {
              realtime = false;
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
            saveGameData(gameRef, gameState);
            resetGamestate();

            setResponse("Waiting for next game");


            setCachedGamesList("Cached games: "+lastGameRef);
          });

          socket.on("startGame", gameRef => {
            getConfig();
            getDivisions();
            resetGamestate();

            setGameRef(gameRef)
            setResponse("Loading...");
          });

          return () => {socket.disconnect();};

          }, []);

  return (

    <div
      style={{textAlign: 'center'}}>
      <h1>Snake Game</h1>
      <div
      id = "divisions"
      style={{float: 'left', padding: '0px 150px 0px 150px'}}>

        <h3> Select Division</h3>
        <select>
        {divisions.map(division => (
          <option
            key={division.value}
            value={division.value}>
            {division.label}
          </option>
        ))}
        </select>
      </div>

      <div
      id = "viewer"
      style={{float: 'left'}}>
        <canvas
          id="viewer"
          ref={viewerRef}
          width={canvasWidth}
          height={canvasHeight}
          style={{
            border: '2px solid #000',
            marginTop: 10,
            float: 'left'
          }}
        ></canvas>

        <div>
        <button onClick={() => {gamePaused = !gamePaused;}}>
        {gamePaused ? "Play" : "Pause"}
        </button>
        {realtime ? null : <button onClick={() => {realtime = true}}>
        {"Realtime"}
        </button>}

        <p>
        {"Game number: "+gameRef}
        </p>
        <p>
        {response}
        </p>
        <p>
        {cachedGamesList}
        </p>
            <p className="copyright">
              Kludged together with duct tape and prayers
                <br/>
                © Runtime Terror
                <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" title="Congrats! You found it..." id="hints">
                    <i className="fa fa-television"></i>
                </a>
                <br/>University of the Witwatersrand, South Africa</p>
        </div>
      </div>

      <div
      id = "leaderboard"
      style={{float: 'left', padding: '0px 0px 0px 150px'}}>

        <h3> Leaderboard</h3>

      </div>

    </div>

  );
}

export default App;
