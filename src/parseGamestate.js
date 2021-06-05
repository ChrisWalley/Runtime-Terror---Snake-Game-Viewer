/*

"0 43
41,0 41,1 41,2 41,3 41,4
39,10 40,10 41,10 42,10 43,10
23,41 23,40 23,39 23,38 23,37
5 -1 Medium alive 5 0 17,34 20,34 20,33
5 -2 Easy alive 5 0 6,6 9,6 9,5
5 -3 VeryEasy alive 5 0 8,42 12,42
5 -4 Random alive 5 0 33,40 31,40 31,38
"
*/
function parseGamestate(gamestate, index)
{

  var lines = gamestate.split('\n');
  if(lines.length < 7)
  {
    return null;
  }

  var gameStatePackage =
  {
  state: index,
  apple: lines[0],
  obstacle0: lines[1],
  obstacle1: lines[2],
  obstacle2: lines[3],
  snake0: lines[4],
  snake1: lines[5],
  snake2: lines[6],
  snake3: lines[7],
  snake0Score: lines[4].split(" ")[0],
  snake1Score: lines[5].split(" ")[0],
  snake2Score: lines[6].split(" ")[0],
  snake3Score: lines[7].split(" ")[0]
  };


  return gameStatePackage;
}
module.exports = parseGamestate;
