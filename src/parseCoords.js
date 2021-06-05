
function parseCoords(corrdsString, startIndex)
{
  let rectsArr = [];// as any;

  var coordsArr = corrdsString.split(' ');
  if(corrdsString.length === 0 || coordsArr.length <= startIndex)
  {
    return rectsArr;
  }

  var oldPos = coordsArr[startIndex].split(',');
  var headPos = oldPos;
  var i;
  for (i = startIndex+1; i < coordsArr.length; i++) {
    var newPos = coordsArr[i].split(',');
    var startX;
    var startY;
    var width;
    var height;

//parsing coords on x and y plain
//15,12 15,7 5,7
    if(parseInt(oldPos[0]) < parseInt(newPos[0]))//X position and width
    {
      startX = oldPos[0];
      width =  parseInt(newPos[0]) -  parseInt(oldPos[0]) + 1;
    }
    else
    {
      startX = newPos[0];
      width =  parseInt(oldPos[0]) -  parseInt(newPos[0]) + 1;
    }

    if(parseInt(oldPos[1]) < parseInt(newPos[1]))//Y position and height
    {
      startY = oldPos[1];
      height =  parseInt(newPos[1]) -  parseInt(oldPos[1]) + 1;
    }
    else
    {
      startY = newPos[1];
      height =  parseInt(oldPos[1]) -  parseInt(newPos[1]) + 1;
    }

    let rect = {
      startX: parseInt(startX),
      startY: parseInt(startY),
      width: parseInt(width),
      height: parseInt(height)
    };

    rectsArr.push(rect);

    oldPos = newPos;
  }
  return {head:headPos, rects:rectsArr};
}
module.exports = parseCoords;
