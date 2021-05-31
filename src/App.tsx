import React, { useState, useEffect } from "react";
import axios from 'axios';
import Carousel from 'react-bootstrap/Carousel';

const PlayerURL = 'https://marker.ms.wits.ac.za/snake/agents/'
const PlayerStatsURL = 'https://raw.githubusercontent.com/ChrisWalley/Runtime-Terror---Snake-Game-Viewer/main/FakeJSON/Stats.json'
const DivisionURL = 'https://marker.ms.wits.ac.za/snake/leagues'
const DivisionStatsURL = 'https://raw.githubusercontent.com/ChrisWalley/Runtime-Terror---Snake-Game-Viewer/main/FakeJSON/DivisionStats.json'
const DivisionGamestatesURL = 'https://marker.ms.wits.ac.za/snake/games/'

const parseCoords = require('./parseCoords');
const parseGamestate = require('./parseGamestate');
const canvasHeight = 550;
const canvasWidth = 520;

const blockSize = 10;
const startX = 10;
const startY = 10;

var drawSnakeImage = true;
var drawAppleImage = true;

var loadingBarSnake =
{
  x:0,
  y:27,
  count:0
}

var appleX = 0;
var appleY = 0;

var lastAppleX = 0;
var lastAppleY = 0;

var appleHealth = 5;

var currentGamestate =0;
var realtimeGamestate = 0;


var rewindMulti = 2;
var ffwdMulti = 2;

let gameStateArr = {};

var startedViewingGamestate = 0;

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
  snake3: 'rgb(0,205,108)',
  snakehead: 'rgb(139,205,70)'
};

var gameCurrStatsUser =
{
  id: -1,
  username: "",
  max_length: "",
  avg_length: "",
  no_of_kills:"",
  score: ""
};

var gameCurrStatsDivision =
{
  id: -1,
  division: "",
  avg_deaths: "",
  avg_score: "",
  avg_time_to_apple:""
};

var gameCurrStatsUserEmpty =
{
  id: -1,
  username: "",
  max_length: "",
  avg_length: "",
  no_of_kills:"",
  score: ""
};

var gameCurrStatsDivisionEmpty =
{
  id: -1,
  division: "",
  avg_deaths: "",
  avg_score: "",
  avg_time_to_apple:""
};

var gameDivisionInfo =
{
  count: -1
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

var snakeHeadImg = new Image();
snakeHeadImg.src = 'https://www.walleyco.de/snake.png'

var appleImg = new Image();
appleImg.src = 'https://www.walleyco.de/snake.png'

var gamePaused = false;
var gameFfwd = false;
var gameRewind = false;
var gameRealtime = true;
var gameDrawCells = false;
var gameServerUp = false;
var gameSelectedDivision = 0;
var gameGamestates = {count:0,states:new Array(0)};

function App()  {

  const viewerRef = React.useRef<HTMLCanvasElement>(null);
  const statsRef = React.useRef<HTMLCanvasElement>(null);
  const serverDownRef = React.useRef<HTMLCanvasElement>(null);
  const serverDownRef2 = React.useRef<HTMLCanvasElement>(null);
  const [viewerContext, setViewerContext] = React.useState<CanvasRenderingContext2D | null>(null);
  const [statsContext, setStatsContext] = React.useState<CanvasRenderingContext2D | null>(null);
  const [serverDownContext, setServerDownContext] = React.useState<CanvasRenderingContext2D | null>(null);
  const [serverDownContext2, setServerDownContext2] = React.useState<CanvasRenderingContext2D | null>(null);
  const [cachedGamesList, setCachedGamesList] = useState("");
  const [gameRef, setGameRef] = useState(0);
  const [paused, setPaused] = useState(gamePaused);
  const [rewind, setRewind] = useState(gameRewind);
  const [ffwd, setFfwd] = useState(gameFfwd);
  const [realtime, setRealtime] = useState(gameRealtime);
  const [drawCells, setDrawCells] = useState(gameDrawCells);
  const [index, setIndex] = useState(0);
  const [serverUp, setServerUp] = useState(gameServerUp);
  const [selectedDivision, setSelectedDivision] = useState(gameSelectedDivision);
  const [isGameCached, setIsGameCached] = useState(false);

  const [players, setPlayers] = useState([])
  const [playersStats, setPlayersStats] = useState({})
  const [divisionStats, setDivisionStats] = useState({})
  const [currentStatsUser, setCurrentStatsUser] = useState(gameCurrStatsUser)
  const [currentStatsDivision, setCurrentStatsDivision] = useState(gameCurrStatsDivision)
  const [divisions, setDivisions] = useState(new Array(0))
  const [divisionInfo, setDivisionInfo] = useState(gameDivisionInfo)
  const [gamestates, setGamestates] = useState(gameGamestates)


  useEffect(() => {

      if (viewerRef.current) {
        const renderCtx = viewerRef.current.getContext('2d');

        if (renderCtx) {
          setViewerContext(renderCtx);
        }
      }

      if (viewerContext)
      {
        drawGameboard();}}, [viewerContext]);

  useEffect(() => {

    if (statsRef.current) {
      const statsRenderContext = statsRef.current.getContext('2d');
      if (statsRenderContext) {
        setStatsContext(statsRenderContext);
      }
    }

    if (statsContext)
    {
      drawStats();
    }}, [statsContext]);

  useEffect(() => {

      if (serverDownRef.current) {
        const serverDownRenderCtx = serverDownRef.current.getContext('2d');
        if (serverDownRenderCtx) {
          setServerDownContext(serverDownRenderCtx);
        }
      }

      if (serverDownContext)
      {
        drawServerDown();
      }}, [serverDownContext]);

  useEffect(() => {

      if (serverDownRef2.current) {
        const serverDownRenderCtx2 = serverDownRef2.current.getContext('2d');
        if (serverDownRenderCtx2) {
          setServerDownContext(serverDownRenderCtx2);
        }
      }

      if (serverDownContext2)
      {
        drawServerDown();
      }}, [serverDownContext2]);

  useEffect(() => {
    initVars();
    getConfig();
    setInterval(updateGameState, config.game_speed);
    }, []);

  useEffect(() => {
    let isMounted = true;               // note mutable flag
    getDivisionData().then(response => {
      if (isMounted)// add conditional check
      {
        setServerUp(true);
        var n = response.data["count"];
        console.log("Div "+selectedDivision);
        var divNames = new Array(n)
        for(var i = 0; i < n;i++)
        {
          divNames[i] = {id:i,division:"Division "+i};
        }
        setDivisions(divNames);
      }
    })

    return () => { isMounted = false }; // use cleanup to toggle value, if unmounted
  }, []);

  useEffect(() => {
    let isMounted = true;               // note mutable flag
    
    getPlayerData().then(response => {
      if (isMounted) setPlayers(response.data);    // add conditional check
    })

    getGamestatesData().then(response => {
      console.log(response.data);
      if (isMounted) setGamestates(response.data);    // add conditional check
    })

    getPlayerStatsData().then(response => {
      if (isMounted)
      {
        var playerStatsDict = {};

        for (var i = 0, player; i < response.data.length; i++) {
           player = response.data[i];
           playerStatsDict[player.username] = player;
        }

        setPlayersStats(playerStatsDict);
      }     // add conditional check
    })

    getDivisionStatsData().then(response => {
      if (isMounted)
      {
        var divisionStatsDict = {};

        for (var i = 0, division; i < response.data.length; i++) {
           division = response.data[i];
           divisionStatsDict[division.division] = division;
        }

        setDivisionStats(divisionStatsDict);
      }     // add conditional check
    })
    return () => { isMounted = false }; // use cleanup to toggle value, if unmounted
  }, [selectedDivision]);

  useEffect(() => {
    gamePaused = paused;
    gameFfwd = ffwd;
    gameRewind = rewind;
    gameRealtime = realtime;
    gameDrawCells = drawCells;
    gameCurrStatsUser = currentStatsUser;
    gameCurrStatsDivision = currentStatsDivision;
    gameSelectedDivision = selectedDivision;
    gameDivisionInfo = divisionInfo;
    gameGamestates = gamestates;}, [paused, ffwd, rewind, realtime, drawCells,currentStatsUser,currentStatsDivision,selectedDivision,divisionInfo,gamestates]);

  useEffect(() => {
      gameServerUp = serverUp;
      if(serverUp)
      {
        if(viewerRef.current)
        {
          const renderCtx = viewerRef.current.getContext('2d');

          if (renderCtx) {
            setViewerContext(renderCtx);
          }
        }

        if(statsRef.current)
        {
          const statsRenderContext = statsRef.current.getContext('2d');

          if (statsRenderContext) {
            setStatsContext(statsRenderContext);
          }
        }
      }
      else{
        if (serverDownRef.current) {
          const serverDownRenderCtx = serverDownRef.current.getContext('2d');
          if (serverDownRenderCtx) {
            setServerDownContext(serverDownRenderCtx);
          }
        }
        if (serverDownRef2.current) {
          const serverDownRenderCtx2 = serverDownRef2.current.getContext('2d');
          if (serverDownRenderCtx2) {
            setServerDownContext2(serverDownRenderCtx2);
          }
        }

      }

    }, [serverUp]);


  function drawGameboard() {
    if(viewerContext && gameServerUp)
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
          if(appleCoords.length > 1 && gameState.apple!="-1 -1")
          {
            
            var appleX = parseInt(appleCoords[0]);
            var appleY = parseInt(appleCoords[1]);
            if(drawAppleImage)
            {
              viewerContext.drawImage(appleImg,startX + appleX*blockSize,startY +  appleY*blockSize);
            }
            else
            {
              viewerContext.fillStyle = gameColours.apple;
              viewerContext.fillRect(startX + appleX*blockSize, startY +  appleY*blockSize, blockSize, blockSize); //Draws coloured sqaure in viewer
            }
          }


          //Obstacles
          viewerContext.fillStyle = gameColours.obstacles;
          var obsStartIndex = 0;
          var i;

          //Obstacle 0
          var obsRectsObj = parseCoords(gameState.obstacle0,obsStartIndex);
          var obsRects = obsRectsObj.rects;
          for (i = 0; i < obsRects.length; i++) {
            viewerContext.fillRect(startX + obsRects[i]['startX']*blockSize, startY + obsRects[i]['startY']*blockSize, obsRects[i]['width']*blockSize, obsRects[i]['height']*blockSize); //Draws coloured sqaure in viewer
          }

          //Obstacle 1
          obsRectsObj = parseCoords(gameState.obstacle1,obsStartIndex);
          obsRects = obsRectsObj.rects;
          for (i = 0; i < obsRects.length; i++) {
            viewerContext.fillRect(startX + obsRects[i]['startX']*blockSize, startY + obsRects[i]['startY']*blockSize, obsRects[i]['width']*blockSize, obsRects[i]['height']*blockSize); //Draws coloured sqaure in viewer
          }

          //Obstacle 2
          obsRectsObj = parseCoords(gameState.obstacle2,obsStartIndex);
          obsRects = obsRectsObj.rects;
          for (i = 0; i < obsRects.length; i++) {
            viewerContext.fillRect(startX + obsRects[i]['startX']*blockSize, startY + obsRects[i]['startY']*blockSize, obsRects[i]['width']*blockSize, obsRects[i]['height']*blockSize); //Draws coloured sqaure in viewer
          }


          //Snakes
          //Snake 0
          var snakeStartIndex = 6;
          viewerContext.fillStyle = gameColours.snake0;

          var snakeRectsObj = parseCoords(gameState.snake0,snakeStartIndex);
          var snakeRects = snakeRectsObj.rects;
          for (i = 0; i < snakeRects?.length; i++) {
            viewerContext.fillRect(startX + snakeRects[i]['startX']*blockSize, startY + snakeRects[i]['startY']*blockSize, snakeRects[i]['width']*blockSize, snakeRects[i]['height']*blockSize); //Draws coloured sqaure in viewer
          }
          if(snakeRectsObj.head!=null)
          {
            viewerContext.fillStyle = gameColours.background;
            viewerContext.beginPath();
            viewerContext.arc(startX + snakeRectsObj.head[0]*blockSize+blockSize/3, startY + snakeRectsObj.head[1]*blockSize+blockSize/3, blockSize/3, 0, 2 * Math.PI);
            viewerContext.fill();
            viewerContext.closePath();

            viewerContext.fillStyle = gameColours.obstacles;
            viewerContext.beginPath();
            viewerContext.arc(startX + snakeRectsObj.head[0]*blockSize+blockSize/3, startY + snakeRectsObj.head[1]*blockSize+blockSize/3, blockSize/4, 0, 2 * Math.PI);
            viewerContext.fill();
            viewerContext.closePath();
          }

          //Snake 1
          viewerContext.fillStyle = gameColours.snake1;

          snakeRectsObj = parseCoords(gameState.snake1,snakeStartIndex);
          snakeRects = snakeRectsObj.rects;
          for (i = 0; i < snakeRects?.length; i++) {
            viewerContext.fillRect(startX + snakeRects[i]['startX']*blockSize, startY + snakeRects[i]['startY']*blockSize, snakeRects[i]['width']*blockSize, snakeRects[i]['height']*blockSize); //Draws coloured sqaure in viewer
          }
          if(snakeRectsObj.head!=null)
          {
            viewerContext.fillStyle = gameColours.background;
            viewerContext.beginPath();
            viewerContext.arc(startX + snakeRectsObj.head[0]*blockSize+blockSize/3, startY + snakeRectsObj.head[1]*blockSize+blockSize/3, blockSize/3, 0, 2 * Math.PI);
            viewerContext.fill();
            viewerContext.closePath();

            viewerContext.fillStyle = gameColours.obstacles;
            viewerContext.beginPath();
            viewerContext.arc(startX + snakeRectsObj.head[0]*blockSize+blockSize/3, startY + snakeRectsObj.head[1]*blockSize+blockSize/3, blockSize/4, 0, 2 * Math.PI);
            viewerContext.fill();
            viewerContext.closePath();
          }

          //Snake 2
          viewerContext.fillStyle = gameColours.snake2;

          snakeRectsObj = parseCoords(gameState.snake2,snakeStartIndex);
          snakeRects = snakeRectsObj.rects;
          for (i = 0; i < snakeRects?.length; i++) {
            viewerContext.fillRect(startX + snakeRects[i]['startX']*blockSize, startY + snakeRects[i]['startY']*blockSize, snakeRects[i]['width']*blockSize, snakeRects[i]['height']*blockSize); //Draws coloured sqaure in viewer
          }
          if(snakeRectsObj.head!=null)
          {
            viewerContext.fillStyle = gameColours.background;
            viewerContext.beginPath();
            viewerContext.arc(startX + snakeRectsObj.head[0]*blockSize+blockSize/3, startY + snakeRectsObj.head[1]*blockSize+blockSize/3, blockSize/3, 0, 2 * Math.PI);
            viewerContext.fill();
            viewerContext.closePath();

            viewerContext.fillStyle = gameColours.obstacles;
            viewerContext.beginPath();
            viewerContext.arc(startX + snakeRectsObj.head[0]*blockSize+blockSize/3, startY + snakeRectsObj.head[1]*blockSize+blockSize/3, blockSize/4, 0, 2 * Math.PI);
            viewerContext.fill();
            viewerContext.closePath();
          }


          //Snake 3
          viewerContext.fillStyle = gameColours.snake3;

          snakeRectsObj = parseCoords(gameState.snake3,snakeStartIndex);
          snakeRects = snakeRectsObj.rects;
          for (i = 0; i < snakeRects?.length; i++) {
            viewerContext.fillRect(startX + snakeRects[i]['startX']*blockSize, startY + snakeRects[i]['startY']*blockSize, snakeRects[i]['width']*blockSize, snakeRects[i]['height']*blockSize); //Draws coloured sqaure in viewer
          }
          if(snakeRectsObj.head!=null)
          {
            viewerContext.fillStyle = gameColours.background;
            viewerContext.beginPath();
            viewerContext.arc(startX + snakeRectsObj.head[0]*blockSize+blockSize/3, startY + snakeRectsObj.head[1]*blockSize+blockSize/3, blockSize/3, 0, 2 * Math.PI);
            viewerContext.fill();
            viewerContext.closePath();

            viewerContext.fillStyle = gameColours.obstacles;
            viewerContext.beginPath();
            viewerContext.arc(startX + snakeRectsObj.head[0]*blockSize+blockSize/3, startY + snakeRectsObj.head[1]*blockSize+blockSize/3, blockSize/4, 0, 2 * Math.PI);
            viewerContext.fill();
            viewerContext.closePath();
          }
          
          if(drawSnakeImage)
          {
            viewerContext.drawImage(snakeHeadImg,progBar.x+(currentGamestate/config.gameFrames)*(config.game_height*blockSize)-3,progBar.y-2);
          }
      }
    }

    requestAnimationFrame(drawGameboard);
  }

  function drawServerDown() {
    if(!gameServerUp)
    {
      var startLoadingY = 26;
      var loadingYLength = 3;
      var i;
      var snakeStartIndex = 4;
      var loopX;
      var loopY;
      var snakePos = loadingBarSnake.x + "," + loadingBarSnake.y + " " +(loadingBarSnake.x+5) + "," + loadingBarSnake.y;
      var snakeRects = parseCoords("0 alive 0 0 "+snakePos,snakeStartIndex);

      loadingBarSnake.count++;
      if(loadingBarSnake.count > 10)
      {
        loadingBarSnake.count=0;
        loadingBarSnake.x++;
        if(loadingBarSnake.x > 44)
        {
          loadingBarSnake.x = 0;
        }
      }


      if(serverDownContext)
      {
        serverDownContext.fillStyle = gameColours.background;     //Clears area
        serverDownContext.fillRect(0,0, canvasWidth, canvasHeight);
        serverDownContext.fillRect(startX,startY + config.game_width*blockSize + 20, loadingYLength*blockSize, 10);

        serverDownContext.strokeStyle = gameColours.border;          //Draws square around viewer and progress bar
        serverDownContext.strokeRect(startX,startY+startLoadingY*blockSize, config.game_width*blockSize, loadingYLength*blockSize);

        serverDownContext.strokeStyle = gameColours.cellLines;

        for(loopX = 0; loopX < config.game_width; loopX++)     //Draws squares around cells
        {
          for(loopY = startLoadingY; loopY < (startLoadingY+loadingYLength); loopY++)
          {
            serverDownContext.strokeRect(startX + loopX*blockSize, startY + loopY*blockSize, blockSize, blockSize);
          }
        }

        serverDownContext.fillStyle = gameColours.snake0;

        for (i = 0; i < snakeRects.length; i++) {
          serverDownContext.fillRect(startX + snakeRects[i]['startX']*blockSize, startY + snakeRects[i]['startY']*blockSize, snakeRects[i]['width']*blockSize, snakeRects[i]['height']*blockSize); //Draws coloured sqaure in viewer
        }
      }

      if(serverDownContext2)
      {
        serverDownContext2.fillStyle = gameColours.background;     //Clears area
        serverDownContext2.fillRect(0,0, canvasWidth, canvasHeight);
        serverDownContext2.fillRect(startX,startY + config.game_width*blockSize + 20, loadingYLength*blockSize, 10);

        serverDownContext2.strokeStyle = gameColours.border;          //Draws square around viewer and progress bar
        serverDownContext2.strokeRect(startX,startY+startLoadingY*blockSize, config.game_width*blockSize, loadingYLength*blockSize);

        serverDownContext2.strokeStyle = gameColours.cellLines;

        for(loopX = 0; loopX < config.game_width; loopX++)     //Draws squares around cells
        {
          for(loopY = startLoadingY; loopY < (startLoadingY+loadingYLength); loopY++)
          {
            serverDownContext2.strokeRect(startX + loopX*blockSize, startY + loopY*blockSize, blockSize, blockSize);
          }
        }

        serverDownContext2.fillStyle = gameColours.snake0;

        for (i = 0; i < snakeRects.length; i++) {
          serverDownContext2.fillRect(startX + snakeRects[i]['startX']*blockSize, startY + snakeRects[i]['startY']*blockSize, snakeRects[i]['width']*blockSize, snakeRects[i]['height']*blockSize); //Draws coloured sqaure in viewer
        }
      }
    }


    requestAnimationFrame(drawServerDown);
  }

  function addFakeUserForStats(){
    var fakseUser =
    {
      id: 1,
      username: "",
      max_length: "",
      avg_length: "",
      no_of_kills:"",
      score: ""
    };

    setCurrentStatsUser(fakseUser);
    setCurrentStatsDivision(gameCurrStatsDivisionEmpty);
  }

  function addFakeDivisionForStats(){
    var fakeDiv =
    {
      id: 1,
      division: "",
      avg_deaths: "",
      avg_score: "",
      avg_time_to_apple:""
    };

    setCurrentStatsUser(gameCurrStatsUserEmpty);
    setCurrentStatsDivision(fakeDiv);
  }

  function drawStats() {
    if(gameServerUp)
    {
      if(statsContext)
      {

        statsContext.fillStyle = gameColours.background;     //Clears area
        statsContext.fillRect(0,0, canvasWidth, canvasHeight);
        statsContext.fillRect(startX,startY + config.game_width*blockSize + 20, config.game_height*blockSize, 10);

        statsContext.strokeStyle = gameColours.border;          //Draws square around viewer and progress bar
        statsContext.strokeRect(startX,startY, config.game_width*blockSize, config.game_height*blockSize);

        statsContext.font = "30px Verdana";

        statsContext.fillStyle = gameColours.obstacles;
        if(gameCurrStatsUser && gameCurrStatsUser.id!=(-1))
        {
          statsContext.fillText(gameCurrStatsUser.username,startX+ ((config.game_width)*blockSize-(statsContext.measureText(gameCurrStatsUser.username).width))/2,startY+5*blockSize);

          statsContext.font = "20px Verdana";

          statsContext.fillText("Maximum length:",startX+ 5*blockSize,startY+15*blockSize);
          statsContext.fillText("Average score:",startX+ 5*blockSize,startY+20*blockSize);
          statsContext.fillText("Total kills:",startX+ 5*blockSize,startY+25*blockSize);

          statsContext.fillText(gameCurrStatsUser.max_length,startX+ 40*blockSize,startY+15*blockSize);
          statsContext.fillText(gameCurrStatsUser.avg_length,startX+ 40*blockSize,startY+20*blockSize);
          statsContext.fillText(gameCurrStatsUser.no_of_kills,startX+ 40*blockSize,startY+25*blockSize);
        }
        else if(gameCurrStatsDivision && gameCurrStatsDivision.id!=(-1))
        {
          statsContext.fillText(gameCurrStatsDivision.division,startX+ ((config.game_width)*blockSize-(statsContext.measureText(gameCurrStatsDivision.division).width))/2,startY+5*blockSize);

          statsContext.font = "20px Verdana";

          statsContext.fillText("Average score:",startX+ 5*blockSize,startY+15*blockSize);
          statsContext.fillText("Average deaths:",startX+ 5*blockSize,startY+20*blockSize);
          statsContext.fillText("Average time to apple:",startX+ 5*blockSize,startY+25*blockSize);

          statsContext.fillText(gameCurrStatsDivision.avg_score,startX+ 40*blockSize,startY+15*blockSize);
          statsContext.fillText(gameCurrStatsDivision.avg_deaths,startX+ 40*blockSize,startY+20*blockSize);
          statsContext.fillText(gameCurrStatsDivision.avg_time_to_apple,startX+ 40*blockSize,startY+25*blockSize);
        }
      }
    }

    requestAnimationFrame(drawStats);
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


  async function cacheGame(gameRef, game){
    window.sessionStorage.clear();
    window.sessionStorage.setItem("cachedGame",JSON.stringify(game));              //Crashes after storing too many games, so set to only store last 1
    let tempGameStateArr = {};
    tempGameStateArr = JSON.parse(sessionStorage.getItem("cachedGame")!);
    if(tempGameStateArr!=null)
    {
      setIsGameCached(true);
    }
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
    appleHealth = 5;
    appleX = 0;
    appleY = 0;
    lastAppleX = appleX;
    lastAppleY = appleY;
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
        setGameRef(prevState=> (prevState+1));
        cacheGame(gameRef, gameStateArr);
        resetGamestate();
      }      

      /*
      snake0: "0 alive 26 2 9,5 3,5 3,9 17,9",
      snake1: "1 alive 15 2 48,16 45,16 45,10",
      snake2: "2 alive 32 2 33,38 19,38",
      snake3: "3 alive 7 2 1,47 6,47 6,30 8,30",
      */
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
    if(gameGamestates.count > 0)
    {
      gameState = parseGamestate(gameGamestates.states[currentGamestate]["state"],gameGamestates.states[currentGamestate]["index"]);
    
      appleX = gameState.apple.split(' ')[0];
      appleY = gameState.apple.split(' ')[1];

      if(appleX === lastAppleX && appleY === lastAppleY)
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
    
    }
  }

  function handleUsernameClick(e) {
    setIndex(1);
    setCurrentStatsDivision(gameCurrStatsDivisionEmpty);
    setCurrentStatsUser(playersStats[e]);
  }

  function handleDivisionStatsClick(e) {
    setIndex(1);
    setCurrentStatsUser(gameCurrStatsUserEmpty);
    setCurrentStatsDivision(divisionStats[selectedDivision]);
  }

  function handleDivisionClick(e) {
  setIndex(0);
  setSelectedDivision(e);
  }

  function initVars(){
    gamePaused = paused;
    gameFfwd = ffwd;
    gameRewind = rewind;
    gameRealtime = realtime;
    gameDrawCells = drawCells;
    gameServerUp = serverUp;
  }

  const getPlayerData = async () => {
      const response = await axios.get(PlayerURL+selectedDivision)
      return response;
  }

  const getGamestatesData = async () => {
    const response = await axios.get(DivisionGamestatesURL+selectedDivision+"/"+selectedDivision)
    return response;
}

  const getPlayerStatsData = async () => {
      const response = await axios.get(PlayerStatsURL)
      return response;
  }

  const getDivisionStatsData = async () => {
      const response = await axios.get(DivisionStatsURL)
      return response;
  }

  const getDivisionData = async () => {
      const response = await axios.get(DivisionURL)
      return response;
  }

  const renderTableHeader = () => {
      let headerElement = ['score', 'name','division']
      return headerElement.map((key, index) => {
          return <th key={index}>{key.toUpperCase()}</th>
      })
  }

  const renderTableBody = () => {
    if(serverUp)
    {
      return players && players.map(({ id, name, score, currentGame }) => {
          return (
              <tr key={id}>
                  <td>{Math.round(10000*score)/10000}</td>
                  <td className='opration'>
                      <a className='button' onClick={() =>handleUsernameClick(name)}>{name}</a>
                  </td>
                  <td className='opration'>
                      <a className='button' onClick={() =>handleDivisionClick(currentGame)}>{currentGame}</a>
                  </td>
              </tr>
          )
      })
    }
    else
    {
      return (
          <tr key='0'>
          <td>{"Connecting..."}</td>
          <td>{"......................."}</td>
          <td>{"......................."}</td>
          </tr>
      )
    }
  }

  const handleSelect = (selectedIndex, e) => {//carousel selector
    setIndex(selectedIndex);
  };

  function logChange(event){
         setSelectedDivision(event.target.value.split(" ")[1]);
         resetGamestate();
     };

  const renderDivisionSelect = () => {
    if(serverUp)
    {
      return (
        <div>
          {['division'].map(key => (
            <select key={key} value={selectedDivision} onChange={logChange}>
              {divisions.map(({ [key]: value }) => <option key={value}>{value}</option>)}
            </select>
          ))}
        </div>
      )
    }
      else{
        return (
          <div>
            {['division'].map(key => (
              <select key={key}>
                {<option key={0}>{"Connecting..."}</option>}
              </select>
            ))}
          </div>
        )
      }
  }

  return (
    <>
    <header>
        <nav>
            <div className="logo">
                <h4>Runtime</h4>
                <h4 onClick={() => setServerUp(prevState => !prevState)}>Terror</h4>
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
          <h2>Division</h2>
            {renderDivisionSelect()}
          <div>
            <button onClick={()=>handleDivisionStatsClick(1)}>
              Stats
            </button>
          </div>
        </div>

        <div className="column middle">
        <div className="custom_carousel_main">
                <Carousel activeIndex={index} onSelect={handleSelect} controls={false} indicators={false} interval={null} wrap={false}>
                  <Carousel.Item>
                    <div>
                         <h2 className="centered" style={{
                           marginTop: 10
                         }}>{serverUp ? "Current Game" : "Connecting to server..."}</h2>
                         <div
                         className="centered">
                         {serverUp ? <canvas
                           ref={viewerRef}
                           width={canvasWidth}
                           height={canvasHeight}
                           style={{
                             border: '2px solid #000',
                             marginTop: 10,
                             marginBottom: 10
                           }}
                         ></canvas> : <canvas
                           ref={serverDownRef}
                           width={canvasWidth}
                           height={canvasHeight}
                           style={{
                             border: '2px solid #000',
                             marginTop: 10,
                             marginBottom: 10
                           }}
                         ></canvas>}
                        </div>
                       </div>
                       </Carousel.Item>
                       <Carousel.Item>
                       <div>
                       <h2 className="centered" style={{
                         marginTop: 10
                       }}>{serverUp ? "Statistics" : "Connecting to server..."}</h2>
                       <div
                       className="centered">
                       {serverUp ? <canvas
                         id="stats"
                         ref={statsRef}
                         width={canvasWidth}
                         height={canvasHeight}
                         style={{
                           border: '2px solid #000',
                           marginTop: 10,
                           marginBottom: 10
                         }}
                       ></canvas> : <canvas
                         id="serverDown2"
                         ref={serverDownRef2}
                         width={canvasWidth}
                         height={canvasHeight}
                         style={{
                           border: '2px solid #000',
                           marginTop: 10,
                           marginBottom: 10
                         }}
                       ></canvas>}
                      </div>
                      </div>
                      </Carousel.Item>
                    </Carousel>
           </div>
           <div style={{ visibility: (index===0 && serverUp) ? "visible" : "hidden" }} id="viewerTimeControls" className="buttonscenteredRow">
            <button onClick={() => {setPaused(false);setRewind(false);setFfwd(false); setRealtime(false);currentGamestate = startedViewingGamestate}}><i className="material-icons">skip_previous</i></button>
            <button onClick={() => {setPaused(false);setRewind(true);setFfwd(false); setRealtime(false);}}><i className="material-icons">fast_rewind</i></button>
            <button onClick={() => {setPaused(prevState => !prevState);setRewind(false);setFfwd(false); setRealtime(false);}}><i className="material-icons">{paused ? "play_circle_outline" : "pause_circle_outline"}</i></button>
            <button onClick={() => {setPaused(false);setRewind(false);setFfwd(true); setRealtime(false);}}><i className="material-icons">fast_forward</i></button>
            <button style={{ visibility: (realtime ||  (index!==0)) ? "hidden" : "visible" }} onClick={() => {setPaused(false);setRewind(false);setFfwd(false); setRealtime(true);currentGamestate = realtimeGamestate}}>{<i className="material-icons">skip_next</i>}</button>
           </div>
           <div style={{ visibility: (index===0 && serverUp) ? "visible" : "hidden" }} id="viewerLookControls" className="buttonscenteredSingle">
            <button onClick={() => {setDrawCells(prevState => !prevState)}}><i className="material-icons">{drawCells ? "grid_on" : "grid_off"}</i></button>
          </div>
           <div style={{ visibility: (index===0 && serverUp && isGameCached) ? "visible" : "collapse" }} id="viewerChangeControls" className="buttonscenteredSingle">
             <button onClick={() => {setPaused(false);setRewind(false);setFfwd(false); setRealtime(false);currentGamestate = startedViewingGamestate;}}><i className="material-icons">settings_backup_restore</i></button>
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
          <button onClick={() => {handleUsernameClick("1"); handleDivisionClick("1");}}>
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
          <button onClick={() => {drawSnakeImage = false; updateGameState();drawGameboard(); loadingBarSnake.count = 8; drawServerDown();}}>
          {<i>triggerDrawGameboard</i>}
          </button>
          <button onClick={() => {addFakeUserForStats(); drawStats();addFakeDivisionForStats();drawStats();}}>
          {<i>triggerDrawStats</i>}
          </button>
          <button onClick={() => {handleUsernameClick('ChrisWalley'); handleDivisionClick('Division 0')}}>
          {<i>triggerStatsUser</i>}
          </button>
          <button onClick={() => {handleDivisionStatsClick(1);}}>
          {<i>triggerStatsDivisionFromSelect</i>}
          </button>
        </div>
      </div>
      </>
  );
}

export default App;
