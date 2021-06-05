/*

"0 43
41,0 41,1 41,2 41,3 41,4
39,10 40,10 41,10 42,10 43,10
23,41 23,40 23,39 23,38 23,37
max -position name alive now kills 17,34 20,34 20,33
5 -2 Easy alive 5 0 6,6 9,6 9,5
5 -3 VeryEasy alive 5 0 8,42 12,42
5 -4 Random alive 5 0 33,40 31,40 31,38
"

"index":2962,"globalIndex":8116191,"state":"42 1
9,16 10,16 11,16 12,16 13,16
13,46 14,46 15,46 16,46 17,46
35,37 35,36 35,35 35,34 35,33
45 -2 Easy alive 9 16 21,32 13,32
50 -1 Medium alive 26 20 26,10 22,10 22,31
19 -3 VeryEasy alive 6 4 26,0 22,0 22,1
5 -4 Random alive 5 0 28,39 30,39 30,40 29,40
","timeCreated":1622583077559
*/
function parseGamestate(gamestate, index)
{

  var lines = gamestate.split('\n');
  if(lines.length < 7)
  {
    return null;
  }

  var snake0Split = lines[4].split(" ");
  var snake1Split = lines[5].split(" ");
  var snake2Split = lines[6].split(" ");
  var snake3Split = lines[7].split(" ");


  var gameStatePackage =
  {
  state: index,
  apple: lines[0],
  obstacle0: lines[1],
  obstacle1: lines[2],
  obstacle2: lines[3],

  snake0: 
    {
      coords:lines[4],
      score: parseInt(snake0Split[0]),
      position: parseInt(snake0Split[1]),
      name: (snake0Split[2] === "" ? "Bot Ash" :snake0Split[2]),
      length: parseInt(snake0Split[4]),
      kills: parseInt(snake0Split[5]),
    },

  snake1: 
    {
      coords:lines[5],
      score: parseInt(snake1Split[0]),
      position: parseInt(snake1Split[1]),
      name: (snake1Split[2] === "" ? "Bot Oak" :snake1Split[2]),
      length: parseInt(snake1Split[4]),
      kills: parseInt(snake1Split[5]),
    },

  snake2: 
    {
      coords:lines[6],
      score: parseInt(snake2Split[0]),
      position: parseInt(snake2Split[1]),
      name: (snake2Split[2] === "" ? "Bot Brock" :snake2Split[2]),
      length: parseInt(snake2Split[4]),
      kills: parseInt(snake2Split[5]),
    },

  snake3: 
    {
      coords:lines[7],
      score: parseInt(snake3Split[0]),
      position: parseInt(snake3Split[1]),
      name: (snake3Split[2] === "" ? "Bot Misty" :snake3Split[2]),
      length: parseInt(snake3Split[4]),
      kills: parseInt(snake3Split[5]),
    }

  };


  return gameStatePackage;
}
module.exports = parseGamestate;
