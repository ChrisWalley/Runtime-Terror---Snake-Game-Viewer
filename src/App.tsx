  import React, { useState, useEffect } from "react";
  import axios from 'axios';
  import Carousel from 'react-bootstrap/Carousel';

  const PlayerURL = 'https://marker.ms.wits.ac.za/snake/agents/0'
  const PlayerStatsURL = 'https://raw.githubusercontent.com/ChrisWalley/Runtime-Terror---Snake-Game-Viewer/main/FakeJSON/Stats.json'
  const DivisionURL = 'https://marker.ms.wits.ac.za/snake/games/0/count'
  const DivisionStatsURL = 'https://raw.githubusercontent.com/ChrisWalley/Runtime-Terror---Snake-Game-Viewer/main/FakeJSON/DivisionStats.json'
  const DivisionGamestatesURL = 'https://marker.ms.wits.ac.za/snake/games/0/'

  const parseCoords = require('./parseCoords');
  const parseGamestate = require('./parseGamestate');
  const sortSnakes = require('./sortSnakes');
  const canvasHeight = 500;
  const canvasWidth = 470;

  const blockSize = 9;
  const startX = blockSize;
  const startY = blockSize;

  var snakeHeadImg = new Image();

  let appleImagesArr = {};

  var loadedSnakeImage = false;
  var loadedAllAppleImages = false;
  var loadedAppleImagesCounter = 0;

  var loadingBarSnake =
  {
    x: 0,
    y: 27,
    count: 0
  }

  var appleX = 0;
  var appleY = 0;

  var lastAppleX = 0;
  var lastAppleY = 0;

  var appleHealth = 5;

  var currentGamestate = 0;
  var realtimeGamestate = 0;


  var gamestateMulti = 1;

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
    obstacles: 'rgb(108,108,108)',
    snake0: 'rgb(208,0,108)',
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
    no_of_kills: "",
    score: ""
  };

  var gameCurrStatsDivision =
  {
    id: -1,
    division: "",
    avg_deaths: "",
    avg_score: "",
    avg_time_to_apple: ""
  };

  var gameCurrStatsUserEmpty =
  {
    id: -1,
    username: "",
    max_length: "",
    avg_length: "",
    no_of_kills: "",
    score: ""
  };

  var gameCurrStatsDivisionEmpty =
  {
    id: -1,
    division: "",
    avg_deaths: "",
    avg_score: "",
    avg_time_to_apple: ""
  };

  var gameDivisionInfo =
  {
    count: -1
  };

  var appleCol =
  {
    r: 0,
    g: 0,
    b: 0
  };

  var progBar = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  };

  var gamePaused = false;
  var gameFfwd = false;
  var gameRewind = false;
  var gameRealtime = true;
  var gameDrawCells = false;
  var gameServerUp = false;
  var gameSelectedDivision = 0;
  var gameSelectedDivisionStr = "Division 0";
  var gameGamestates = { count: 0, states: new Array(0) };

  var fakeGamestate = false;

  function App() {

    const viewerRef = React.useRef<HTMLCanvasElement>(null);
    const scoreboardRef = React.useRef<HTMLCanvasElement>(null);
    const statsRef = React.useRef<HTMLCanvasElement>(null);
    const serverDownRef = React.useRef<HTMLCanvasElement>(null);
    const serverDownRef2 = React.useRef<HTMLCanvasElement>(null);
    const [viewerContext, setViewerContext] = React.useState<CanvasRenderingContext2D | null>(null);
    const [scoreboardContext, setScoreboardContext] = React.useState<CanvasRenderingContext2D | null>(null);
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
    const [selectedDivisionStr, setSelectedDivisionStr] = useState(gameSelectedDivisionStr);
    const [isGameCached, setIsGameCached] = useState(false);
    const [readEntireGame, setReadEntireGame] = useState(false);

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

      if (viewerContext) {
        drawGameboard();
      }
    }, [viewerContext]);

    useEffect(() => {

        if (scoreboardRef.current) {
          const renderCtx1 = scoreboardRef.current.getContext('2d');

          if (renderCtx1) {
            setScoreboardContext(renderCtx1);
          }
        }

        if (scoreboardContext)
        {
          drawScoreboard();}
    }, [scoreboardContext]);

  useEffect(() => {

      if (statsRef.current) {
        const statsRenderContext = statsRef.current.getContext('2d');
        if (statsRenderContext) {
          setStatsContext(statsRenderContext);
        }
      }

      if (statsContext) {
        drawStats();
      }
    }, [statsContext]);

    useEffect(() => {

      if (serverDownRef.current) {
        const serverDownRenderCtx = serverDownRef.current.getContext('2d');
        if (serverDownRenderCtx) {
          setServerDownContext(serverDownRenderCtx);
        }
      }

      if (serverDownContext) {
        drawServerDown();
      }
    }, [serverDownContext]);

    useEffect(() => {

      if (serverDownRef2.current) {
        const serverDownRenderCtx2 = serverDownRef2.current.getContext('2d');
        if (serverDownRenderCtx2) {
          setServerDownContext(serverDownRenderCtx2);
        }
      }

      if (serverDownContext2) {
        drawServerDown();
      }
    }, [serverDownContext2]);

    useEffect(() => {
      loadImages();
      initVars();
      getConfig();

      let isMounted = true;               // note mutable flag
      getDivisionData().then(response => {
        if (isMounted)// add conditional check
        {
          setServerUp(true);
          var n = response.data["count"];
          var divNames = new Array(n)
          for (var i = 0; i < n; i++) {
            divNames[i] = { id: i, division: "Division " + i };
          }
          setDivisions(divNames);
          setInterval(updateGameState, config.game_speed);
          console.log("Done");
        }
      }).catch(err => alert("Error: Could not retrieve division information from the Snake Server\n"+err))
      
      return () => { isMounted = false }; // use cleanup to toggle value, if unmounted


    }, []);

    useEffect(() => {
      let isMounted = true;               // note mutable flag

      getPlayerData().then(response => {
        if (isMounted) setPlayers(response.data);    // add conditional check
      }).catch(err => alert("Error: Could not retrieve player information from the Snake Server\n"+err))

      getGamestatesData().then(response => {
        if (isMounted) 
        {
          setGamestates(response.data);    // add conditional check
          currentGamestate = 0;
        }
      }).catch(err => alert("Error: Could not retrieve gamestate information from the Snake Server\n"+err))

      getPlayerStatsData().then(response => {
        if (isMounted) {
          var playerStatsDict = {};

          for (var i = 0, player; i < response.data.length; i++) {
            player = response.data[i];
            playerStatsDict[player.username] = player;
          }

          setPlayersStats(playerStatsDict);
        }     // add conditional check
      }).catch(err => alert("Error: Could not retrieve player statistics from the Snake Server\n"+err))

      getDivisionStatsData().then(response => {
        if (isMounted) {
          var divisionStatsDict = {};

          for (var i = 0, division; i < response.data.length; i++) {
            division = response.data[i];
            divisionStatsDict[division.division] = division;
          }

          setDivisionStats(divisionStatsDict);
        }     // add conditional check
      }).catch(err => alert("Error: Could not retrieve division statistics from the Snake Server\n"+err))
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
      gameSelectedDivisionStr = selectedDivisionStr;
      gameDivisionInfo = divisionInfo;
      gameGamestates = gamestates;
    }, [paused, ffwd, rewind, realtime, drawCells, currentStatsUser, currentStatsDivision, selectedDivision,selectedDivisionStr, divisionInfo, gamestates]);

    useEffect(() => {
      gameServerUp = serverUp;
      if (serverUp) {
        if (viewerRef.current) {
          const renderCtx = viewerRef.current.getContext('2d');

          if (renderCtx) {
            setViewerContext(renderCtx);
          }
        }

        if (statsRef.current) {
          const statsRenderContext = statsRef.current.getContext('2d');

          if (statsRenderContext) {
            setStatsContext(statsRenderContext);
          }
        }
      }
      else {
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
      if (viewerContext && gameServerUp) {
        viewerContext.fillStyle = gameColours.background;     //Clears area
        viewerContext.fillRect(0, 0, canvasWidth, canvasHeight);
        viewerContext.fillRect(startX, startY + config.game_width * blockSize + 20, config.game_height * blockSize, 10);

        if (gameState && gameState !== null && gameState.state >= 0) {
          progBar =
          {
            x: startX,
            y: startY + config.game_height * blockSize + 20,
            width: (realtimeGamestate / config.gameFrames)*(config.game_width * blockSize),
            height: blockSize + 3
          }
          viewerContext.fillStyle = gameColours.progressBarGreen;         //Draws progress bar at bottom - current position
          viewerContext.fillRect(startX, progBar.y, (currentGamestate / config.gameFrames) * (config.game_width * blockSize), progBar.height);

          viewerContext.fillStyle = gameColours.progressBarBlue;         //Draws progress bar at bottom - real gametime
          viewerContext.fillRect(startX + progBar.width - 2, progBar.y, 4, progBar.height);

          viewerContext.fillStyle = gameColours.progressBarRed;         //Draws progress bar at bottom - started viewing gametime
          viewerContext.fillRect(startX + (startedViewingGamestate / config.gameFrames) * (config.game_height * blockSize) - 2, progBar.y, 4, progBar.height);



          viewerContext.strokeStyle = gameColours.border;          //Draws square around viewer and progress bar
          viewerContext.strokeRect(startX, startY, config.game_width * blockSize, config.game_height * blockSize);
          viewerContext.strokeRect(startX, startY + config.game_height * blockSize + 20, config.game_width * blockSize, progBar.height);


          if (gameDrawCells) {
            viewerContext.strokeStyle = gameColours.cellLines;
            for (var loopX = 0; loopX < config.game_width; loopX++)     //Draws squares around cells
            {
              for (var loopY = 0; loopY < config.game_height; loopY++) {
                viewerContext.strokeRect(startX + loopX * blockSize, startY + loopY * blockSize, blockSize, blockSize);
              }
            }
          }


          //Apple
          var appleCoords = gameState.apple.split(' ');
          if (appleCoords.length > 1 && gameState.apple !== "-1 -1") {

            var appleX = parseInt(appleCoords[0]);
            var appleY = parseInt(appleCoords[1]);
            if (loadedAllAppleImages) {
              var appleIndex = Math.ceil(6-appleHealth);
              if(appleIndex > 10)
              {
                appleIndex=10;
              }
              if(appleIndex < 1)
              {
                appleIndex=1;
              }
              viewerContext.drawImage(appleImagesArr[appleIndex], startX + appleX * blockSize - blockSize / 3, startY + appleY * blockSize - blockSize / 3);
            }
            else {
              viewerContext.fillStyle = gameColours.apple;
              viewerContext.fillRect(startX + (appleX+1) * blockSize, startY + appleY * blockSize, blockSize, blockSize); //Draws coloured sqaure in viewer
            }
          }


          //Obstacles
          viewerContext.fillStyle = gameColours.obstacles;
          var obsStartIndex = 0;
          var i;

          //Obstacle 0
          var obsRectsObj = parseCoords(gameState.obstacle0, obsStartIndex);
          var obsRects = obsRectsObj.rects;
          for (i = 0; i < obsRects.length; i++) {
            viewerContext.fillRect(startX + obsRects[i]['startX'] * blockSize, startY + obsRects[i]['startY'] * blockSize, obsRects[i]['width'] * blockSize, obsRects[i]['height'] * blockSize); //Draws coloured sqaure in viewer
          }

          //Obstacle 1
          obsRectsObj = parseCoords(gameState.obstacle1, obsStartIndex);
          obsRects = obsRectsObj.rects;
          for (i = 0; i < obsRects.length; i++) {
            viewerContext.fillRect(startX + obsRects[i]['startX'] * blockSize, startY + obsRects[i]['startY'] * blockSize, obsRects[i]['width'] * blockSize, obsRects[i]['height'] * blockSize); //Draws coloured sqaure in viewer
          }

          //Obstacle 2
          obsRectsObj = parseCoords(gameState.obstacle2, obsStartIndex);
          obsRects = obsRectsObj.rects;
          for (i = 0; i < obsRects.length; i++) {
            viewerContext.fillRect(startX + obsRects[i]['startX'] * blockSize, startY + obsRects[i]['startY'] * blockSize, obsRects[i]['width'] * blockSize, obsRects[i]['height'] * blockSize); //Draws coloured sqaure in viewer
          }


          //Snakes
          //Snake 0
          var snakeStartIndex = 6;
          viewerContext.fillStyle = gameColours.snake0;

          var snakeRectsObj = parseCoords(gameState.snake0.coords, snakeStartIndex);
          var snakeRects = snakeRectsObj.rects;
          for (i = 0; i < snakeRects?.length; i++) {
            viewerContext.fillRect(startX + snakeRects[i]['startX'] * blockSize, startY + snakeRects[i]['startY'] * blockSize, snakeRects[i]['width'] * blockSize, snakeRects[i]['height'] * blockSize); //Draws coloured sqaure in viewer
          }
          if (snakeRectsObj.head && snakeRectsObj.head !== null) {
            viewerContext.fillStyle = gameColours.background;
            viewerContext.beginPath();
            viewerContext.arc(startX + snakeRectsObj.head[0] * blockSize + blockSize / 4, startY + snakeRectsObj.head[1] * blockSize + blockSize / 4, blockSize / 3, 0, 2 * Math.PI);
            viewerContext.fill();
            viewerContext.closePath();

            viewerContext.fillStyle = gameColours.obstacles;
            viewerContext.beginPath();
            viewerContext.arc(startX + snakeRectsObj.head[0] * blockSize + blockSize / 4, startY + snakeRectsObj.head[1] * blockSize + blockSize / 4, blockSize / 4, 0, 2 * Math.PI);
            viewerContext.fill();
            viewerContext.closePath();
          }

          //Snake 1
          viewerContext.fillStyle = gameColours.snake1;

          snakeRectsObj = parseCoords(gameState.snake1.coords, snakeStartIndex);
          snakeRects = snakeRectsObj.rects;
          for (i = 0; i < snakeRects?.length; i++) {
            viewerContext.fillRect(startX + snakeRects[i]['startX'] * blockSize, startY + snakeRects[i]['startY'] * blockSize, snakeRects[i]['width'] * blockSize, snakeRects[i]['height'] * blockSize); //Draws coloured sqaure in viewer
          }
          if (snakeRectsObj.head && snakeRectsObj.head !== null) {
            viewerContext.fillStyle = gameColours.background;
            viewerContext.beginPath();
            viewerContext.arc(startX + snakeRectsObj.head[0] * blockSize + blockSize / 4, startY + snakeRectsObj.head[1] * blockSize + blockSize / 4, blockSize / 3, 0, 2 * Math.PI);
            viewerContext.fill();
            viewerContext.closePath();

            viewerContext.fillStyle = gameColours.obstacles;
            viewerContext.beginPath();
            viewerContext.arc(startX + snakeRectsObj.head[0] * blockSize + blockSize / 4, startY + snakeRectsObj.head[1] * blockSize + blockSize / 4, blockSize / 4, 0, 2 * Math.PI);
            viewerContext.fill();
            viewerContext.closePath();
          }

          //Snake 2
          viewerContext.fillStyle = gameColours.snake2;

          snakeRectsObj = parseCoords(gameState.snake2.coords, snakeStartIndex);
          snakeRects = snakeRectsObj.rects;
          for (i = 0; i < snakeRects?.length; i++) {
            viewerContext.fillRect(startX + snakeRects[i]['startX'] * blockSize, startY + snakeRects[i]['startY'] * blockSize, snakeRects[i]['width'] * blockSize, snakeRects[i]['height'] * blockSize); //Draws coloured sqaure in viewer
          }
          if (snakeRectsObj.head && snakeRectsObj.head !== null) {
            viewerContext.fillStyle = gameColours.background;
            viewerContext.beginPath();
            viewerContext.arc(startX + snakeRectsObj.head[0] * blockSize + blockSize / 4, startY + snakeRectsObj.head[1] * blockSize + blockSize / 4, blockSize / 3, 0, 2 * Math.PI);
            viewerContext.fill();
            viewerContext.closePath();

            viewerContext.fillStyle = gameColours.obstacles;
            viewerContext.beginPath();
            viewerContext.arc(startX + snakeRectsObj.head[0] * blockSize + blockSize / 4, startY + snakeRectsObj.head[1] * blockSize + blockSize / 4, blockSize / 4, 0, 2 * Math.PI);
            viewerContext.fill();
            viewerContext.closePath();
          }


          //Snake 3
          viewerContext.fillStyle = gameColours.snake3;

          snakeRectsObj = parseCoords(gameState.snake3.coords, snakeStartIndex);
          snakeRects = snakeRectsObj.rects;
          for (i = 0; i < snakeRects?.length; i++) {
            viewerContext.fillRect(startX + snakeRects[i]['startX'] * blockSize, startY + snakeRects[i]['startY'] * blockSize, snakeRects[i]['width'] * blockSize, snakeRects[i]['height'] * blockSize); //Draws coloured sqaure in viewer
          }
          if (snakeRectsObj.head && snakeRectsObj.head !== null) {
            viewerContext.fillStyle = gameColours.background;
            viewerContext.beginPath();
            viewerContext.arc(startX + snakeRectsObj.head[0] * blockSize + blockSize / 4, startY + snakeRectsObj.head[1] * blockSize + blockSize / 4, blockSize / 3, 0, 2 * Math.PI);
            viewerContext.fill();
            viewerContext.closePath();

            viewerContext.fillStyle = gameColours.obstacles;
            viewerContext.beginPath();
            viewerContext.arc(startX + snakeRectsObj.head[0] * blockSize + blockSize / 4, startY + snakeRectsObj.head[1] * blockSize + blockSize / 4, blockSize / 4, 0, 2 * Math.PI);
            viewerContext.fill();
            viewerContext.closePath();
          }

          //gamestate multiplier
          if(gamestateMulti!=1)
          {
            viewerContext.fillStyle = gameColours.obstacles;

            viewerContext.font = "20px Verdana";

            viewerContext.fillText(""+gamestateMulti+"x", startX + 15, startY + 25);
          }

          if (loadedSnakeImage) {
            viewerContext.drawImage(snakeHeadImg, progBar.x + (currentGamestate / config.gameFrames) * (config.game_height * blockSize) - 3, progBar.y - 2);
          }
        }
      }

      requestAnimationFrame(drawGameboard);
    }

    function drawServerDown() {
      if (!gameServerUp) {
        var startLoadingY = 26;
        var loadingYLength = 3;
        var i;
        var snakeStartIndex = 4;
        var loopX;
        var loopY;
        var snakePos = loadingBarSnake.x + "," + loadingBarSnake.y + " " + (loadingBarSnake.x + 5) + "," + loadingBarSnake.y;
        var snakeRects = parseCoords("0 alive 0 0 " + snakePos, snakeStartIndex);

        loadingBarSnake.count++;
        if (loadingBarSnake.count > 10) {
          loadingBarSnake.count = 0;
          loadingBarSnake.x++;
          if (loadingBarSnake.x > 44) {
            loadingBarSnake.x = 0;
          }
        }


        if (serverDownContext) {
          serverDownContext.fillStyle = gameColours.background;     //Clears area
          serverDownContext.fillRect(0, 0, canvasWidth, canvasHeight);
          serverDownContext.fillRect(startX, startY + config.game_width * blockSize + 20, loadingYLength * blockSize, 10);

          serverDownContext.strokeStyle = gameColours.border;          //Draws square around viewer and progress bar
          serverDownContext.strokeRect(startX, startY + startLoadingY * blockSize, config.game_width * blockSize, loadingYLength * blockSize);

          serverDownContext.strokeStyle = gameColours.cellLines;

          for (loopX = 0; loopX < config.game_width; loopX++)     //Draws squares around cells
          {
            for (loopY = startLoadingY; loopY < (startLoadingY + loadingYLength); loopY++) {
              serverDownContext.strokeRect(startX + loopX * blockSize, startY + loopY * blockSize, blockSize, blockSize);
            }
          }

          serverDownContext.fillStyle = gameColours.snake0;

          for (i = 0; i < snakeRects.length; i++) {
            serverDownContext.fillRect(startX + snakeRects[i]['startX'] * blockSize, startY + snakeRects[i]['startY'] * blockSize, snakeRects[i]['width'] * blockSize, snakeRects[i]['height'] * blockSize); //Draws coloured sqaure in viewer
          }
        }

        if (serverDownContext2) {
          serverDownContext2.fillStyle = gameColours.background;     //Clears area
          serverDownContext2.fillRect(0, 0, canvasWidth, canvasHeight);
          serverDownContext2.fillRect(startX, startY + config.game_width * blockSize + 20, loadingYLength * blockSize, 10);

          serverDownContext2.strokeStyle = gameColours.border;          //Draws square around viewer and progress bar
          serverDownContext2.strokeRect(startX, startY + startLoadingY * blockSize, config.game_width * blockSize, loadingYLength * blockSize);

          serverDownContext2.strokeStyle = gameColours.cellLines;

          for (loopX = 0; loopX < config.game_width; loopX++)     //Draws squares around cells
          {
            for (loopY = startLoadingY; loopY < (startLoadingY + loadingYLength); loopY++) {
              serverDownContext2.strokeRect(startX + loopX * blockSize, startY + loopY * blockSize, blockSize, blockSize);
            }
          }

          serverDownContext2.fillStyle = gameColours.snake0;

          for (i = 0; i < snakeRects.length; i++) {
            serverDownContext2.fillRect(startX + snakeRects[i]['startX'] * blockSize, startY + snakeRects[i]['startY'] * blockSize, snakeRects[i]['width'] * blockSize, snakeRects[i]['height'] * blockSize); //Draws coloured sqaure in viewer
          }
        }
      }


      requestAnimationFrame(drawServerDown);
    }

    function drawStats() {
      if (gameServerUp) {
        if (statsContext) {

          statsContext.fillStyle = gameColours.background;     //Clears area
          statsContext.fillRect(0, 0, canvasWidth, canvasHeight);
          statsContext.fillRect(startX, startY + config.game_width * blockSize + 20, config.game_height * blockSize, 10);

          statsContext.strokeStyle = gameColours.border;          //Draws square around viewer and progress bar
          statsContext.strokeRect(startX, startY, config.game_width * blockSize, config.game_height * blockSize);

          statsContext.font = "30px Verdana";

          statsContext.fillStyle = gameColours.obstacles;
          if (gameCurrStatsUser && gameCurrStatsUser.id !== (-1)) {
            statsContext.fillText(gameCurrStatsUser.username, startX + ((config.game_width) * blockSize - (statsContext.measureText(gameCurrStatsUser.username).width)) / 2, startY + 5 * blockSize);

            statsContext.font = "20px Verdana";

            statsContext.fillText("Maximum length:", startX + 5 * blockSize, startY + 15 * blockSize);
            statsContext.fillText("Average score:", startX + 5 * blockSize, startY + 20 * blockSize);
            statsContext.fillText("Total kills:", startX + 5 * blockSize, startY + 25 * blockSize);

            statsContext.fillText(gameCurrStatsUser.max_length, startX + 40 * blockSize, startY + 15 * blockSize);
            statsContext.fillText(gameCurrStatsUser.avg_length, startX + 40 * blockSize, startY + 20 * blockSize);
            statsContext.fillText(gameCurrStatsUser.no_of_kills, startX + 40 * blockSize, startY + 25 * blockSize);
          }
          else if (gameCurrStatsDivision && gameCurrStatsDivision.id !== (-1)) {
            statsContext.fillText(gameCurrStatsDivision.division, startX + ((config.game_width) * blockSize - (statsContext.measureText(gameCurrStatsDivision.division).width)) / 2, startY + 5 * blockSize);

            statsContext.font = "20px Verdana";

            statsContext.fillText("Average score:", startX + 5 * blockSize, startY + 15 * blockSize);
            statsContext.fillText("Average deaths:", startX + 5 * blockSize, startY + 20 * blockSize);
            statsContext.fillText("Average time to apple:", startX + 5 * blockSize, startY + 25 * blockSize);

            statsContext.fillText(gameCurrStatsDivision.avg_score, startX + 40 * blockSize, startY + 15 * blockSize);
            statsContext.fillText(gameCurrStatsDivision.avg_deaths, startX + 40 * blockSize, startY + 20 * blockSize);
            statsContext.fillText(gameCurrStatsDivision.avg_time_to_apple, startX + 40 * blockSize, startY + 25 * blockSize);
          }
        }
      }

      requestAnimationFrame(drawStats);
    }

  function drawScoreboard() {
    if(gameServerUp)
    {
      if(scoreboardContext && gameState)
      {

        scoreboardContext.fillStyle = gameColours.background;     //Clears area
        scoreboardContext.fillRect(0,0, canvasWidth-150, canvasHeight-200);

        scoreboardContext.font = "bold 17px Verdana";

        scoreboardContext.fillStyle = gameColours.border;

        scoreboardContext.fillText("Max",startX+ 2*blockSize,startY+2*blockSize);
        scoreboardContext.fillText("Now",startX+ 9*blockSize,startY+2*blockSize);
        scoreboardContext.fillText("Kills",startX+ 16*blockSize,startY+2*blockSize);
        scoreboardContext.fillText("Name",startX+ 23*blockSize,startY+2*blockSize);

        scoreboardContext.font = "17px Verdana";

        let sortedSnakesByScore = sortSnakes(gameState.snake0,gameState.snake1,gameState.snake2,gameState.snake3);

        let colorDict = {};

        colorDict[gameState.snake0.name] = gameColours.snake0;
        colorDict[gameState.snake1.name] = gameColours.snake1;
        colorDict[gameState.snake2.name] = gameColours.snake2;
        colorDict[gameState.snake3.name] = gameColours.snake3;

        var yOffset = 1;
        for(var i = 0; i < 4; i++)
        {
          scoreboardContext.fillStyle = colorDict[sortedSnakesByScore[i].name];

          var offset = yOffset*3+5;

          scoreboardContext.fillText(sortedSnakesByScore[i].score,startX+ 2*blockSize,startY+offset*blockSize);
          scoreboardContext.fillText(sortedSnakesByScore[i].length,startX+ 9*blockSize,startY+offset*blockSize);
          scoreboardContext.fillText(sortedSnakesByScore[i].kills,startX+ 16*blockSize,startY+offset*blockSize);
          scoreboardContext.fillText(sortedSnakesByScore[i].name,startX+ 23*blockSize,startY+offset*blockSize);

          yOffset++;
        }

        /*
        var snake0YOffset = 1*3 + 5;
        var snake1YOffset = 2*3 + 5;
        var snake2YOffset = 3*3 + 5;
        var snake3YOffset = 4*3 + 5;
        
        var snake0YOffset = (-1)*(gameState.snake0Position)*3 + 5;
        var snake1YOffset = (-1)*(gameState.snake1Position)*3 + 5;
        var snake2YOffset = (-1)*(gameState.snake2Position)*3 + 5;
        var snake3YOffset = (-1)*(gameState.snake3Position)*3 + 5;
        

        scoreboardContext.fillStyle = gameColours.snake0;

        scoreboardContext.fillText(gameState.snake0.score,startX+ 2*blockSize,startY+(snake0YOffset)*blockSize);
        scoreboardContext.fillText(gameState.snake0.length,startX+ 9*blockSize,startY+(snake0YOffset)*blockSize);
        scoreboardContext.fillText(gameState.snake0.kills,startX+ 16*blockSize,startY+(snake0YOffset)*blockSize);
        scoreboardContext.fillText(gameState.snake0.name,startX+ 23*blockSize,startY+(snake0YOffset)*blockSize);

        scoreboardContext.fillStyle = gameColours.snake1;

        scoreboardContext.fillText(gameState.snake1.score,startX+ 2*blockSize,startY+(snake1YOffset)*blockSize);
        scoreboardContext.fillText(gameState.snake1.length,startX+ 9*blockSize,startY+(snake1YOffset)*blockSize);
        scoreboardContext.fillText(gameState.snake1.kills,startX+ 16*blockSize,startY+(snake1YOffset)*blockSize);
        scoreboardContext.fillText(gameState.snake1.name,startX+ 23*blockSize,startY+(snake1YOffset)*blockSize);

        scoreboardContext.fillStyle = gameColours.snake2;

        scoreboardContext.fillText(gameState.snake2.score,startX+ 2*blockSize,startY+(snake2YOffset)*blockSize);
        scoreboardContext.fillText(gameState.snake2.length,startX+ 9*blockSize,startY+(snake2YOffset)*blockSize);
        scoreboardContext.fillText(gameState.snake2.kills,startX+ 16*blockSize,startY+(snake2YOffset)*blockSize);
        scoreboardContext.fillText(gameState.snake2.name,startX+ 23*blockSize,startY+(snake2YOffset)*blockSize);

        scoreboardContext.fillStyle = gameColours.snake3;

        scoreboardContext.fillText(gameState.snake3.score,startX+ 2*blockSize,startY+(snake3YOffset)*blockSize);
        scoreboardContext.fillText(gameState.snake3.length,startX+ 9*blockSize,startY+(snake3YOffset)*blockSize);
        scoreboardContext.fillText(gameState.snake3.kills,startX+ 16*blockSize,startY+(snake3YOffset)*blockSize);
        scoreboardContext.fillText(gameState.snake3.name,startX+ 23*blockSize,startY+(snake3YOffset)*blockSize);
        */

      }
    }

    requestAnimationFrame(drawScoreboard);
  }

  function getConfig() {

      config =
      {
        game_time: 300,
        game_mode: 'GROW',
        game_speed: 50,
        apple_growth: 5,
        starting_length: 5,
        num_snakes: 4,
        num_apples: 1,
        special_apple: true,
        apple_limit: 200,
        decay_rate: 0.1,
        game_width: 50,
        game_height: 50,
        between_rounds: 10000,
        num_obstacles: 3,
        num_zombies: -1,
        zombie_speed: -1,
        invisibility_period: -1,
        gameFrames: 300 * (1000 / 50)  //game_time * (1000 ms / game speed)
      };

    }


    async function cacheGame(game) {
      window.sessionStorage.clear();
      window.sessionStorage.setItem("cachedGame", JSON.stringify(game));              //Crashes after storing too many games, so set to only store last 1
      let tempGameStateArr = {};
      tempGameStateArr = JSON.parse(sessionStorage.getItem("cachedGame")!);
      if (tempGameStateArr && tempGameStateArr !== null) {
        setIsGameCached(true);
      }
    }

    function resetGamestate() {
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

    function updateGameState() {
      //This will fetch the current game state from the server

      if(fakeGamestate)
      {
        gameGamestates = require('./fakeGamestate.json');
      }
      if (gameGamestates && gameGamestates!==null) {
        if (realtimeGamestate > config.gameFrames) {
          setGameRef(prevState => (prevState + 1));
          cacheGame(gameStateArr);
          resetGamestate();
        }
        
      if (!gamePaused)
      {
        if (gameRewind || gameFfwd) {
          currentGamestate += gamestateMulti;
  
          if (currentGamestate <= 0 || currentGamestate >= realtimeGamestate) {
            setRewind(false);
            setFfwd(false);
            setRealtime(true);
            gamestateMulti=1;
          }
        }
        else  {
          currentGamestate++;
          if(currentGamestate>config.gameFrames)
          {
            currentGamestate = 0;
          }
        }
      
      
      if (gameGamestates.count > 0) {
        if(!gameGamestates.states[currentGamestate] || gameGamestates.states[currentGamestate]===null)
        {
          return;
        }
        gameState = parseGamestate(gameGamestates.states[currentGamestate]["state"], gameGamestates.states[currentGamestate]["index"]);
        if(!gameState || gameState===null)
        {
          return;
        }
        appleX = gameState.apple.split(' ')[0];
        appleY = gameState.apple.split(' ')[1];

        if (appleX === lastAppleX && appleY === lastAppleY) {
          appleHealth -= 1.0*gamestateMulti*config.decay_rate;
          if(appleHealth < -5 && gamestateMulti<0)
          {
            appleHealth += 10; 
          }
        }
        else {
          appleHealth = 5;
          lastAppleX = appleX;
          lastAppleY = appleY;
        }

        if (appleHealth < -5) {
          appleX = Math.floor(Math.random() * config.game_width);
          appleY = Math.floor(Math.random() * config.game_height);
        }

        if(!readEntireGame && gameGamestates.count === config.gameFrames)
        {
          setReadEntireGame(true);
          realtimeGamestate = config.gameFrames;
          if(currentGamestate !== realtimeGamestate)
          {
            setRealtime(false);
          }
        }
        else{
          realtimeGamestate++;
        }

        

        appleCol.r = (appleHealth + 5) * 25.5;
        appleCol.g = (appleHealth + 5) * 21.5;

        gameColours.apple = 'rgb(' + appleCol.r + ',' + appleCol.g + ',' + appleCol.b + ')';

      }
    }
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
      setSelectedDivisionStr("Division "+e);
    }

    function initVars() {
      gamePaused = paused;
      gameFfwd = ffwd;
      gameRewind = rewind;
      gameRealtime = realtime;
      gameDrawCells = drawCells;
      gameServerUp = serverUp;
    }

    function loadImages()
    {
      snakeHeadImg.src = '/assets/snake.png'
      snakeHeadImg.onload = (event) => {
        loadedSnakeImage = true;
        }

      var appleImg = new Image();
      appleImg.src = '/assets/apple.png'
      var counter = 0;
      for(var i = 1; i <= 10; i ++)
      {
        appleImagesArr[i] = new Image();
        appleImagesArr[i].src = '/assets/apples/apple_'+i+'.png';
        appleImagesArr[i].onload = (event) => {
          loadedAppleImagesCounter += Math.pow(10,counter);
          counter++;
          if(loadedAppleImagesCounter===1111111111)
            {
              loadedAllAppleImages = true;
            }
          }
      }
    }

    const getPlayerData = async () => {
      const response = await axios.get(PlayerURL)
      return response;
    }

    const getGamestatesData = async () => {
      const response = await axios.get(DivisionGamestatesURL + selectedDivision)
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
      let headerElement = ['score', 'name', 'division']
      return headerElement.map((key, index) => {
        return <th key={index}>{key.toUpperCase()}</th>
      })
    }

    const renderTableBody = () => {
      if (serverUp) {
        return players && players.map(({ id, name, score, currentGame }) => {
          return (
            <tr key={id}>
              <td>{Math.round(10000 * score) / 10000}</td>
              <td className='opration'>
                <a className='button' onClick={() => handleUsernameClick(name)}>{name}</a>
              </td>
              <td className='opration'>
                <a className='button' onClick={() => handleDivisionClick(currentGame)}>{currentGame}</a>
              </td>
            </tr>
          )
        })
      }
      else {
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

    function logChange(event) {
      setSelectedDivision(event.target.value.split(" ")[1]);
      setSelectedDivisionStr(event.target.value);
    };

    const renderDivisionSelect = () => {
      if (serverUp) {
        return (
          <div>
            {['division'].map(key => (
              <select key={key} value={selectedDivisionStr} onChange={logChange}>
                {divisions.map(({ [key]: value }) => <option key={value}>{value}</option>)}
              </select>
            ))}
          </div>
        )
      }
      else {
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
        <canvas
         ref={scoreboardRef}
         width={canvasWidth-150}
         height={canvasHeight-300}
         style={{
           border: '2px solid #000',
           marginTop: 125,
           marginLeft: 10,
           marginBottom: 10,
          visibility: (index === 0 && serverUp && scoreboardContext && gameState) ? "visible" : "hidden" 
         }}
       ></canvas>
        </div>
          <div className="column middle">
            <div className="custom_carousel_main">
              <Carousel activeIndex={index} onSelect={handleSelect} controls={true} indicators={false} interval={null} wrap={true}>
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
              <div style={{ visibility: (index === 0 && serverUp) ? "visible" : "hidden" }} id="viewerTimeControls" className="buttonscenteredRow">
                    <button onClick={() => { gamestateMulti = 1; setPaused(false); setRewind(false); setFfwd(false); setRealtime(false); currentGamestate = startedViewingGamestate }}><i className="material-icons">skip_previous</i></button>
                    <button onClick={() => { if(rewind)
                      {
                        gamestateMulti *=2;
                        if(gamestateMulti <=-16)
                        {
                          gamestateMulti = 1;
                          setPaused(false); setRewind(false); setFfwd(false); setRealtime(false); 
                        }
                      }else{
                        gamestateMulti = -2;
                        setPaused(false); setRewind(true); setFfwd(false); setRealtime(false); 
                      }}}><i className="material-icons">fast_rewind</i></button>
                    <button onClick={() => {gamestateMulti = 1; setPaused(prevState => !prevState); setRewind(false); setFfwd(false); setRealtime(false); }}><i className="material-icons">{paused ? "play_circle_outline" : "pause_circle_outline"}</i></button>
                    <button onClick={() => {if(ffwd)
                      {
                        gamestateMulti *=2;
                        if(gamestateMulti >=16)
                        {
                          gamestateMulti = 1;
                          setPaused(false); setRewind(false); setFfwd(false); setRealtime(false); 
                        }
                      }else{
                        gamestateMulti = 2;
                        setPaused(false); setRewind(false); setFfwd(true); setRealtime(false);
                      }}}><i className="material-icons">fast_forward</i></button>
                    <button style={{ visibility: (realtime || (index !== 0 || !serverUp)) ? "hidden" : "visible" }} onClick={() => { gamestateMulti = 1;setPaused(false); setRewind(false); setFfwd(false); setRealtime(true); currentGamestate = realtimeGamestate }}>{<i className="material-icons">skip_next</i>}</button>
                  </div>
                  <div style={{ visibility: (index === 0 && serverUp) ? "visible" : "hidden" }} id="viewerLookControls" className="buttonscenteredSingle">
                    <button onClick={() => { setDrawCells(prevState => !prevState) }}><i className="material-icons">{drawCells ? "grid_on" : "grid_off"}</i></button>
                    <button style={{ visibility: (index === 0 && serverUp && isGameCached) ? "visible" : "collapse" }} onClick={() => { setPaused(false); setRewind(false); setFfwd(false); setRealtime(false); currentGamestate = startedViewingGamestate; }}><i className="material-icons">settings_backup_restore</i></button>
                  </div>
            </div>


          </div>
          <div className="column right" style={{ float: 'right' }}>
            <h2>Division</h2>
            {renderDivisionSelect()}
            <div style={{ marginBottom: '3cm' }}>
              <button onClick={() => handleDivisionStatsClick(1)}>
                Stats
              </button>
            </div>
            <h1 id='title'>Leaderboard</h1>
            <table id='player'>
              <thead>
                <tr>{renderTableHeader()}</tr>
              </thead>
              <tbody>
                {renderTableBody()}
              </tbody>
            </table>
            <div style={{ visibility: "collapse" }} id="hiddenButtons" className="buttons">
              <button onClick={() => { handleUsernameClick("1"); handleDivisionClick(1); }}>
                {<i>triggerClickFunctions</i>}
              </button>
            </div>
          </div>
          <div style={{ visibility: "collapse" }} id="hiddenButtons" className="buttons">
            <button onClick={() => { setPaused(prevState => prevState); }}>
              {<i>triggerLogicUpdate</i>}
            </button>
            <button onClick={() => { resetGamestate(); cacheGame(1); }}>
              {<i>triggerMiscFunctions</i>}
            </button>
            <button onClick={() => { 
              loadedSnakeImage = false;
              fakeGamestate = true;
              updateGameState();
              gamePaused = true;
              gameFfwd = false;
              gameRewind = false;
              updateGameState();
              gamePaused = false;
              gameFfwd = true;
              gameRewind = false;
              updateGameState();
              gamePaused = false;
              gameFfwd = false;
              gameRewind = true;
              updateGameState();
              drawGameboard();
              drawScoreboard();
              loadingBarSnake.count = 8;
              drawServerDown(); }}>
              {<i>triggerDrawGameboard</i>}
            </button>
            <button onClick={() => { 
              gameCurrStatsUser = {
                id: 1,
                username: "",
                max_length: "",
                avg_length: "",
                no_of_kills: "",
                score: ""
              }; 
              gameCurrStatsDivision = gameCurrStatsDivisionEmpty;
              drawStats(); 

              gameCurrStatsDivision =
              {
                id: 1,
                division: "",
                avg_deaths: "",
                avg_score: "",
                avg_time_to_apple: ""
              };
              gameCurrStatsUser = gameCurrStatsUserEmpty;
              drawStats(); }}>
              {<i>triggerDrawStats</i>}
            </button>
            <button onClick={() => { handleUsernameClick('Easy'); handleDivisionClick(0) }}>
              {<i>triggerStatsUser</i>}
            </button>
            <button onClick={() => { handleDivisionStatsClick(1); }}>
              {<i>triggerStatsDivisionFromSelect</i>}
            </button>
          </div>
        </div>
      </>
    );
  }

  export default App;
