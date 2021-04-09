
function parseCoords(corrdsString, startIndex)
{
  let rectsArr = [];// as any;

  var coordsArr = corrdsString.split(' ');
  if(coordsArr.length <= startIndex)
  {
    return rectsArr;
  }

  var oldPos = coordsArr[startIndex].split(',');
  var i;
  for (i = startIndex+1; i < coordsArr.length; i++) {
    var newPos = coordsArr[i].split(',');
    var startX;
    var startY;
    var width;
    var height;

    if(oldPos[0] < newPos[0])//X position and width
    {
      startX = oldPos[0];
      width =  newPos[0] -  oldPos[0] + 2;
    }
    else
    {
      startX = newPos[0];
      width =  oldPos[0] -  newPos[0] + 2;
    }

    if(oldPos[1] < newPos[1])//Y position and height
    {
      startY = oldPos[1];
      height =  newPos[1] -  oldPos[1] + 2;
    }
    else
    {
      startY = newPos[1];
      height =  oldPos[1] -  newPos[1] + 2;
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
  return rectsArr;
}
module.exports = parseCoords;
