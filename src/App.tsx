import React, { useState, useEffect } from "react";
import axios from 'axios';
import Carousel from 'react-bootstrap/Carousel';
import 'bootstrap/dist/css/bootstrap.min.css';


const URL = 'https://raw.githubusercontent.com/ChrisWalley/Runtime-Terror---Snake-Game-Viewer/main/FakeJSON/Player.json'

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

var lastAppleX = 0;
var lastAppleY = 0;

var appleHealth = 5;

var currentGamestate =0;
var realtimeGamestate = 0;

var lastGameRef = -1;
var lastGameSnake0Score = -1;
var lastGameSnake1Score = -1;
var lastGameSnake2Score = -1;
var lastGameSnake3Score = -1;

var addedClickEvent = false;

var rewindMulti = 2;
var ffwdMulti = 2;

let gameStateArr = {};

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
};

var appleCol =
{
  r:0,
  g:0,
  b:0
};

var progBar = {
  x:0,
  y:0,
  width:0,
  height:0
};

var imageObj1 = new Image();
imageObj1.src = 'https://www.walleyco.de/snake.png'

var viewerX = 0;
var viewerY = 0;
var gamePaused = false;
var gameFfwd = false;
var gameRewind = false;
var gameRealtime = true;
var gameDrawCells = true;

function App()  {

  const viewerRef = React.useRef<HTMLCanvasElement>(null);
  const statsRef = React.useRef<HTMLCanvasElement>(null);
  const [viewerContext, setViewerContext] = React.useState<CanvasRenderingContext2D | null>(null);
  const [cachedGamesList, setCachedGamesList] = useState("");
  const [gameRef, setGameRef] = useState(-1);
  const [paused, setPaused] = useState(false);
  const [rewind, setRewind] = useState(false);
  const [ffwd, setFfwd] = useState(false);
  const [realtime, setRealtime] = useState(true);
  const [drawCells, setDrawCells] = useState(true);
  const [index, setIndex] = useState(0);
  const [serverUp, setServerUp] = useState(true);

  function drawGameboard() {
    if(viewerContext)
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
          width:(realtimeGamestate/config.gameFrames),
          height:blockSize+3
        }
          viewerContext.fillStyle = gameColours.progressBarGreen;         //Draws progress bar at bottom - current position
          viewerContext.fillRect(startX, progBar.y, (currentGamestate/config.gameFrames)*(config.game_width*blockSize), progBar.height);

          viewerContext.fillStyle = gameColours.progressBarBlue;         //Draws progress bar at bottom - real gametime
          viewerContext.fillRect(startX + progBar.width*(config.game_height*blockSize) -2 , progBar.y, 4, progBar.height);

          viewerContext.fillStyle = gameColours.progressBarRed;         //Draws progress bar at bottom - started viewing gametime
          viewerContext.fillRect(startX + (startedViewingGamestate/config.gameFrames)*(config.game_height*blockSize) -2, progBar.y, 4, progBar.height);



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
          viewerContext.drawImage(imageObj1,progBar.x+(currentGamestate/config.gameFrames)*(config.game_height*blockSize)-3,progBar.y-2);
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
        viewerContext.fillText(""+lastGameSnake0Score, col2X, colStartY+200);

        viewerContext.fillText("Snake 2", col1X, colStartY+250);
        viewerContext.fillText(""+lastGameSnake1Score, col2X, colStartY+250);

        viewerContext.fillText("Snake 3", col1X, colStartY+300);
        viewerContext.fillText(""+lastGameSnake2Score, col2X, colStartY+300);

        viewerContext.fillText("Snake 4", col1X, colStartY+350);
        viewerContext.fillText(""+lastGameSnake3Score, col2X, colStartY+350);
      }
    }

    requestAnimationFrame(drawGameboard);
  }

  function getConfig() {

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

  function refreshLeaderboardAndDivisions(){
    getDivisions();
    //getPlayers();
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
   nGames = 0;
   for(i = 1;i <= nGames;i++)
   {
     divisions.push({ label: "Division "+i, value: "Division "+i});
   }
   if(nGames > 0)
   {
     currDivision = 0;
   }
   else{
     divisions.push({ label: "No", value: "No"});
   }
  }

  async function cacheGame(gameRef, game){
    window.sessionStorage.clear();
    window.sessionStorage.setItem("cachedGame",JSON.stringify(game));              //Crashes after storing too many games, so set to only store last 1
    //cachedGames.push(gameRef);
      // @ts-ignore: Object is possibly 'null'.
      let tempGameStateArr = {};
      tempGameStateArr = JSON.parse(sessionStorage.getItem("cachedGame")!);
  }

  function saveGameData(gameReference, saveGameState){
    lastGameRef = gameReference;
    lastGameSnake0Score = saveGameState.snake0Score;
    lastGameSnake1Score = saveGameState.snake1Score;
    lastGameSnake2Score = saveGameState.snake2Score;
    lastGameSnake3Score = saveGameState.snake3Score;
    return true;
  }

  function resetGamestate(){
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

  function updateGameState(){
    //This will fetch the current game state from the server
    if(true)
    {
      if(realtimeGamestate>config.gameFrames)
      {
        realtimeGamestate = 0;
      }

      if(appleX == lastAppleX && appleY == lastAppleY)
      {
        appleHealth-=config.decay_rate;
      }
      else
      {
        appleHealth = 5;
        lastAppleX = appleX;
        lastAppleY = appleY;
      }

      if(appleHealth < -5)
      {
        appleX = Math.floor(Math.random() * config.game_width);
        appleY = Math.floor(Math.random() * config.game_height);
      }

      realtimeGamestate++;

      appleCol.r = (appleHealth+5) * 25.5;
      appleCol.g = (appleHealth+5) * 21.5;

      gameColours.apple = 'rgb('+appleCol.r+','+appleCol.g+','+appleCol.b+')';
      gameStateArr[realtimeGamestate] =
      {
        ref: 0,
        state: 0,
        apple: appleX+" "+appleY,
        obstacle0: "1 16,32 16,36",
        obstacle1: "2 47,26 43,26",
        obstacle2: "0 30,21 26,21",
        snake0: "0 alive 26 2 9,5 3,5 3,9 17,9",
        snake1: "1 alive 15 2 48,16 45,16 45,10",
        snake2: "2 alive 32 2 33,38 19,38",
        snake3: "3 alive 7 2 1,47 6,47 6,30 8,30",
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
        setRewind(false);
        setRealtime(true);
        rewindMulti = 2;
      }
    }
    else if(gameFfwd)
    {
      currentGamestate+=ffwdMulti;

      if(currentGamestate >= realtimeGamestate)
      {
        setFfwd(false);
        setRealtime(true);
        ffwdMulti = 2;
      }
    }
    else if(!gamePaused)
    {
      currentGamestate++;
    }
    gameState = gameStateArr[currentGamestate];
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
               setRealtime(false);
               var clickedGameState = (x- startX)*config.game_width/blockSize;
               if(clickedGameState >= startedViewingGamestate)
               {
                 currentGamestate = clickedGameState;
               }
               console.log('clicked progress  bar' +clickedGameState);
           }
  }

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
          setViewerContext(renderCtx);
        }
      }

      if (viewerContext)
      {
        drawGameboard();
      }

    }, [viewerContext]);


        useEffect(() => {
          initVars();
          getConfig();
          refreshLeaderboardAndDivisions();
          updateGameStateIntervalRef = setInterval(updateGameState, config.game_speed);
          }, []);

          const [players, setPlayers] = useState([])


          useEffect(() => {
            let isMounted = true;               // note mutable flag
            getData().then(response => {
              if (isMounted) setPlayers(response.data);    // add conditional check
            })
            return () => { isMounted = false }; // use cleanup to toggle value, if unmounted
          }, []);

          useEffect(() => {
            gamePaused = paused;
            gameFfwd = ffwd;
            gameRewind = rewind;
            gameRealtime = realtime;
            gameDrawCells = drawCells;
          }, [paused, ffwd, rewind, realtime, drawCells]);

          function handleUsernameClick(e) {
          setIndex(1);
          }

          function handleScoreClick(e) {
          setIndex(0);
          }

          function handleDivisionClick(e) {
          setIndex(1);
          }

          function initVars()
          {
            gamePaused = paused;
            gameFfwd = ffwd;
            gameRewind = rewind;
            gameRealtime = realtime;
            gameDrawCells = drawCells;
          }

          const getData = async () => {
              const response = await axios.get(URL)
              return response;
          }

          const renderTableHeader = () => {
              let headerElement = ['name', 'score','division']
              return headerElement.map((key, index) => {
                  return <th key={index}>{key.toUpperCase()}</th>
              })
          }

          const renderTableBody = () => {
              return players && players.map(({ id, username, score, division }) => {
                  return (
                      <tr key={id}>
                          <td className='opration'>
                              <a className='button' onClick={() =>handleUsernameClick(username)}>{username}</a>
                          </td>
                          <td>{score}</td>
                          <td className='opration'>
                              <a className='button' onClick={() =>handleScoreClick(division)}>{division}</a>
                          </td>
                      </tr>
                  )
              })
          }

          const handleSelect = (selectedIndex, e) => {
            setIndex(selectedIndex);
          };

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
            <button onClick={()=>handleDivisionClick(1)}>
              Stats
            </button>
          </div>
        </div>

        <div className="column middle">
        <div className="custom_carousel_main">
                <Carousel activeIndex={index} onSelect={handleSelect} controls={true} indicators={false} interval={null} wrap={false}>
                  <Carousel.Item>
                    <div>
                         <h2 className="centered" style={{
                           marginTop: 10
                         }}>Current Game</h2>
                         <div
                         className="centered">
                         <canvas
                           id="viewer"
                           ref={viewerRef}
                           width={canvasWidth}
                           height={canvasHeight}
                           style={{
                             border: '2px solid #000',
                             marginTop: 10,
                             marginBottom: 10
                           }}
                         ></canvas>

                        </div>

                       </div>
                       </Carousel.Item>
                       <Carousel.Item>
                       <div>
                       <h2 className="centered" style={{
                         marginTop: 10
                       }}>Statistics</h2>
                       <div
                       className="centered">
                       <canvas
                         id="stats"
                         ref={statsRef}
                         width={canvasWidth}
                         height={canvasHeight}
                         style={{
                           border: '2px solid #000',
                           marginTop: 10,
                           marginBottom: 10
                         }}
                       ></canvas>

                      </div>
                      </div>
                      </Carousel.Item>
                    </Carousel>
           </div>
           <div style={{ visibility: (index===0) ? "visible" : "hidden" }} id="viewerTimeControls" className="buttonscenteredRow">
            <button onClick={() => {setPaused(false);setRewind(false);setFfwd(false); setRealtime(false);currentGamestate = startedViewingGamestate}}><i className="material-icons">skip_previous</i></button>
            <button onClick={() => {setPaused(false);setRewind(true);setFfwd(false); setRealtime(false);}}><i className="material-icons">fast_rewind</i></button>
            <button onClick={() => {setPaused(prevState => !prevState);setRewind(false);setFfwd(false); setRealtime(false);}}><i className="material-icons">{paused ? "play_circle_outline" : "pause_circle_outline"}</i></button>
            <button onClick={() => {setPaused(false);setRewind(false);setFfwd(true); setRealtime(false);}}><i className="material-icons">fast_forward</i></button>
            <button style={{ visibility: (realtime ||  (index!==0)) ? "hidden" : "visible" }} onClick={() => {setPaused(false);setRewind(false);setFfwd(false); setRealtime(true);currentGamestate = realtimeGamestate}}>{<i className="material-icons">skip_next</i>}</button>
           </div>
           <div style={{ visibility: (index===0) ? "visible" : "hidden" }} id="viewerChangeControls" className="buttonscenteredSingle">
             <button onClick={() => {setPaused(false);setRewind(true);setFfwd(false); setRealtime(false);}}><i className="material-icons">settings_backup_restore</i></button>
          </div>
          <div style={{ visibility: (index===0) ? "visible" : "hidden" }} id="viewerLookControls" className="buttonscenteredSingle">
           <button onClick={() => {setDrawCells(prevState => !prevState)}}><i className="material-icons">{gameDrawCells ? "grid_on" : "grid_off"}</i></button>
         </div>
         </div>
        <div className="column right" style={{float: 'right'}}>
          <h1 id='title'>Leaderboard</h1>
          <table id='player'>
              <thead>
                  <tr>{renderTableHeader()}</tr>
              </thead>
              <tbody>
                  {renderTableBody()}
              </tbody>
          </table>
          <div style={{ visibility: "collapse"}} id="hiddenButtons" className="buttons">
          <button onClick={() => {handleUsernameClick("1"); handleScoreClick("1");}}>
          {<i>triggerClickFunctions</i>}
          </button>
          </div>
        </div>
        <div style={{ visibility: "collapse"}} id="hiddenButtons" className="buttons">
          <button onClick={() => {setPaused(prevState => prevState);}}>
            {<i>triggerLogicUpdate</i>}
          </button>
          <button onClick={() => {resetGamestate(); cacheGame(1,1);}}>
            {<i>triggerMiscFunctions</i>}
          </button>
          <button onClick={() => {drawGameboard();}}>
          {<i>triggerDrawGameboard</i>}
          </button>
        </div>
      </div>
      </>
  );
}

export default App;
