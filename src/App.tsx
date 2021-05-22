import React, { useState, useEffect } from "react";

const ENDPOINT = "http://walleyco.de:3001";
const CONFIG_PATH = 'games/config';
const COUNT_PATH = 'games/count';
const fetch = require("node-fetch");

const parseCoords = require('./parseCoords');
var whatWatch =0;
const canvasHeight = 550;
const canvasWidth = 520;

const blockSize = 10;
const startX = 10;
const startY = 10;

var appleX = 0;
var appleY = 0;

var currentGamestate = -1
var realtimeGamestate = -1

var lastGameRef = -1;
var lastGameSnake0Score = -1;
var lastGameSnake1Score = -1;
var lastGameSnake2Score = -1;
var lastGameSnake3Score = -1;

var gameRealtime = true;
var gamePaused = false;
var gameFfwd = false;
var gameRewind = false;
var updatingByLogic = false;

var gameDrawCells = true;
var addedClickEvent = false;

var rewindMulti = 2;
var ffwdMulti = 2;

let gameStateArr = {};

var lastFrameID= -1;

var startedViewingGamestate = 0;
var waitingForFirstGamestate = true;

let divisions = [] as any[];
var currDivision = -1;
var nGames = 0;
var updateGameStateIntervalRef;

var config;

var gameState;

var gameColours =
{
  background: 'rgb(255, 255, 255)',
  progressBarGreen: 'rgb(139, 195, 74)',
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

var appleCol =
{
  r:0,
  g:0,
  b:0
}

var progBar = {
  x:0,
  y:0,
  width:0,
  height:0
}

var imageObj1 = new Image();
imageObj1.src = 'https://www.walleyco.de/snake.png'

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

      progBar =
      {
        x:startX,
        y:startY + config.game_height*blockSize + 20,
        width:(realtimeGamestate/(config.game_height*config.game_height))*(config.game_height*blockSize),
        height:blockSize+3
      }
        viewerContext.fillStyle = gameColours.progressBarGreen;         //Draws progress bar at bottom - current position
        viewerContext.fillRect(startX, startY + config.game_width*blockSize + 20, (currentGamestate/(config.game_width*config.game_height))*(config.game_width*blockSize), progBar.height);

        viewerContext.fillStyle = gameColours.progressBarBlue;         //Draws progress bar at bottom - real gametime
        viewerContext.fillRect(startX + (realtimeGamestate/(config.game_width*config.game_width))*(config.game_height*blockSize) -2 , startY + config.game_height*blockSize + 20, 4, progBar.height);

        viewerContext.fillStyle = gameColours.progressBarRed;         //Draws progress bar at bottom - started viewing gametime
        viewerContext.fillRect(startX + (startedViewingGamestate/(config.game_width*config.game_width))*(config.game_height*blockSize) -2, startY + config.game_height*blockSize + 20, 4, progBar.height);



        viewerContext.strokeStyle = gameColours.border;          //Draws square around viewer and progress bar
        viewerContext.strokeRect(startX,startY, config.game_width*blockSize, config.game_height*blockSize);
        viewerContext.strokeRect(startX,startY + config.game_height*blockSize + 20, config.game_width*blockSize, progBar.height);


        if(gameDrawCells)
        {
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
        viewerContext.drawImage(imageObj1,progBar.x+(currentGamestate/(config.game_height*config.game_height))*(config.game_height*blockSize)-3,progBar.y-2);

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

  lastFrameID = requestAnimationFrame(drawGameboard);
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
             gameRealtime = false;
             updatingByLogic = true;
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
  /*
  disabled until I can get tests to work
  fetch('https://httpbin.org/ip')//IP to test for now.
        .then(response => response.json())
        .then(data =>
        {
          console.log(data);
        });
        */

  //Save game settings

  config =
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
    gameFrames : 300*(1000/50)  //game_time * (1000 ms / game speed)
  };

}


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

function updateGameState()
{
  //This will fetch the current game state from the server
  if(true)
  {
    realtimeGamestate++;
    appleX++;
    if(appleX > 49)
    {
      appleX = 0;
      appleY++;
      if(appleY > 49)
      {
        appleY = 0;
      }
    }
    appleCol.r++;
    if(appleCol.r > 255)
    {
      appleCol.r=0;
      appleCol.g++;
      if(appleCol.g > 255)
      {
        appleCol.g=0;
        appleCol.b++;
        if(appleCol.b > 255)
        {
          appleCol.b=0;
        }
      }
    }
    gameColours.apple = 'rgb('+appleCol.r+','+appleCol.g+','+appleCol.b+')';
    gameStateArr[realtimeGamestate] =
    {
      ref: 0,
      state: 0,
      apple: appleX+" "+appleY,
      obstacle0: "",
      obstacle1: "",
      obstacle2: "",
      snake0: "",
      snake1: "",
      snake2: "",
      snake3: "",
      snake0Score: 0,
      snake1Score: 0,
      snake2Score: 0,
      snake3Score: 0
    };
  }
  if(gameRewind)
  {
    currentGamestate-=rewindMulti;
    if(currentGamestate <= 0)
    {
      gameRewind = false;
      gameRealtime = true;
      rewindMulti = 2;
      updatingByLogic = true;
    }
  }
  else if(gameFfwd)
  {
    currentGamestate+=ffwdMulti;

    if(currentGamestate >= realtimeGamestate)
    {
      gameFfwd = false;
      gameRealtime = true;
      ffwdMulti = 2;
      updatingByLogic = true;
    }
  }
  else if(!gamePaused)
  {
    currentGamestate++;
  }
  gameState = gameStateArr[currentGamestate];
}

function refreshLeaderboardAndDivisions()
{
  getDivisions();
  getPlayers();
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

// populating division dropdown list
divisions = [];
 var i;
 nGames = 10;
 for(i = 1;i <= nGames;i++)
 {
   divisions.push({ label: "Division "+i, value: "Division "+i});
 }
 if(nGames > 0)
 {
   currDivision = 0;
 }
}


function getPlayers() {

}


function App() {
  const viewerRef = React.useRef<HTMLCanvasElement>(null);
  const [context, setContext] = React.useState<CanvasRenderingContext2D | null>(null);
  const [response, setResponse] = useState("Connecting...");
  const [cachedGamesList, setCachedGamesList] = useState("");
  const [gameRef, setGameRef] = useState(-1);
  const [paused, setPaused] = useState(false);
  const [rewind, setRewind] = useState(false);
  const [ffwd, setFfwd] = useState(false);
  const [realtime, setRealtime] = useState(true);
  const [drawCells, setDrawCells] = useState(true);

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
        if(lastFrameID > 0)
        {
          cancelAnimationFrame(lastFrameID);
        }
        viewerContext = context;
        drawGameboard();
      }

    }, [context]);

        useEffect(() => {
          //This useEffect runs once when the page is loaded.

          //Request config from server (refresh timer, end of game timer, number of divisions)
          //Set up game settings
          //Load leaderboard and division selector
          //Set default current division to 0 (top of list)
          //Start loop to request current division information from server every x ms
          //On end of game string, start end of game timer, and display results from last game.
          //refresh leaderboard data and division data
          //On start of new game, refresh leaderboard data and division data

          getConfig();
          refreshLeaderboardAndDivisions();
          updateGameStateIntervalRef = setInterval(updateGameState, config.game_speed);
          }, []);

          useEffect(() => {

            if(updatingByLogic)
            {
              setPaused(gamePaused);
              setRewind(gameRewind);
              setFfwd(gameFfwd);
              setRealtime(gameRealtime);

              updatingByLogic = false;
            }
            else {
              gamePaused = paused;
              gameRewind = rewind;
              gameFfwd = ffwd;
              gameRealtime = realtime;
            }
            if(gamePaused || gameRewind || gameFfwd)
            {
              setRealtime(false);
            }
            gameDrawCells = drawCells;
          }, [paused,rewind,ffwd,drawCells,realtime]);


  return (
    <>
    <header>
        <nav>
            <div className="logo">
                <h4>runtime</h4>
                <h4>Terror</h4>
            </div>
            <ul className="nav-links">
                <li><a href="">Watch</a></li>
                <li><a href="https://snake.wits.ai/">Home</a></li>
                <li><a href="https://snake.wits.ai/docs">Docs</a></li>
                <li><a href="https://snake.wits.ai/downloads">Downloads</a></li>
                <li><a href="https://snake.wits.ai/help">Help</a></li>
            </ul>
        </nav>
    </header>
<div className="row">
        <div className="column left">
          <div id="header" className="alt">
                <a className="logo" href="/"><strong>Snake AI Competition</strong> 2020</a>
            </div>
          <h2>Division</h2>
          <select>
          {divisions.map(division => (
            <option
              key={division.value}
              value={division.value}>
              {division.label}
            </option>
          ))}
          </select>
          <div>

<button onClick={()=>{;}}>
  View Statistics for current division
</button>
          </div>
        </div>

          <div className="column middle">

      <div id="slider">
        <input type="radio" name="slider" id="slide1" checked/>
        <input type="radio" name="slider" id="slide2"/>

        <div id="slides">
           <div id="overflow">
              <div className="inner">


                 <div className="slide slide_1">
                    <div className="slide-content">
                       <h2>Current Game</h2>
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




                     </div>
                     <div id="viewerTimeControls" className="buttons">
                       <button onClick={() => {setPaused(false);setRewind(false);setFfwd(false); setRealtime(false);currentGamestate = startedViewingGamestate}}><i className="material-icons">skip_previous</i></button>
                       <button onClick={() => {setPaused(false);setRewind(true);setFfwd(false); setRealtime(false);}}><i className="material-icons">fast_rewind</i></button>
                       <button onClick={() => {setPaused(prevState => !prevState);setRewind(false);setFfwd(false); setRealtime(false);}}><i className="material-icons">{paused ? "play_circle_outline" : "pause_circle_outline"}</i></button>
                       <button onClick={() => {setPaused(false);setRewind(false);setFfwd(true); setRealtime(false);}}><i className="material-icons">fast_forward</i></button>
                       <button onClick={() => {setPaused(false);setRewind(true);setFfwd(false); setRealtime(false);}}><i className="material-icons">settings_backup_restore</i></button>
                         <button onClick={() => {setDrawCells(prevState => !prevState)}}><i className="material-icons">{drawCells ? "grid_on" : "grid_off"}</i></button>
                      <button style={{ visibility: realtime ? "hidden" : "visible" }} onClick={() => {setPaused(false);setRewind(false);setFfwd(false); setRealtime(true);currentGamestate = realtimeGamestate}}>{<i className="material-icons">skip_next</i>}</button>

                      </div>
                     </div>
                     </div>


                    <div className="slide slide_2">
                        <div className="slide-content">
                           <h2>Statistics</h2>
                        </div>
                    </div>



            </div>
            <div id="controls">
               <label htmlFor="slide1"></label>
               <label htmlFor="slide2"></label>
            </div>
            <div id="bullets">
               <label htmlFor="slide1"></label>
               <label htmlFor="slide2"></label>
            </div>
         </div>



        </div>
</div>


</div>






        <div className="column right" style={{
          float: 'right'
        }}>
          <h2>Leaderboard</h2>

          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Score</th>
                <th>Division</th>
                <th>Watch Game</th>
                <th>View Stats</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Person 1</td>
                <td>134</td>
                <td>1</td>
                <td>  <button type="button">Watch Game</button></td>
                <td><button type="button">View Stats</button></td>

              </tr>

              <tr>
                <td>Person 2</td>
                <td>89</td>
                <td>2</td>
                <td>  <button type="button">Watch Game</button></td>
                <td><button type="button">View Stats</button></td>
              </tr>
              <tr>
                <td>Person 3</td>
                <td>65</td>
                <td>3</td>
                <td>  <button type="button">Watch Game</button></td>
                <td><button type="button">View Stats</button></td>
              </tr>
              <tr>
                <td>Person 4</td>

                <td>45</td>
                <td>4</td>
                <td>  <button type="button">Watch Game</button></td>
                <td><button type="button">View Stats</button></td>
              </tr>
              <tr>
                <td>Person 5</td>
                <td>27</td>
                <td>5</td>
                <td>  <button type="button">Watch Game</button></td>
                <td><button type="button">View Stats</button></td>

              </tr>
              <tr>
                <td>Person 6</td>
                <td>4</td>
                <td>6</td>
                <td>  <button type="button">Watch Game</button></td>
                <td><button type="button">View Stats</button></td>
              </tr>
            </tbody>
          </table>

  </div>
</div>
</>
  );
}

export default App;
