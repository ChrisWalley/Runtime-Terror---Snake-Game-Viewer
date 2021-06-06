const betterThan = require('./betterThan');

function sortSnakes(snakeA,snakeB,snakeC,snakeD)
    {
      var low1;
      var high1;
      var low2;
      var high2;
      var lowest;
      var middle1;
      var middle2;
      var highest;

      if (betterThan(snakeB, snakeA))
      {
        low1 = snakeA;
        high1 = snakeB;
      }
      else 
      {
        low1 = snakeB;
        high1 = snakeA;
      }
  
      if (betterThan(snakeD, snakeC))
      {
        low2 = snakeC;
        high2 = snakeD
      }
      else
      {
        low2 = snakeD;
        high2 = snakeC;
      }
  
      if (betterThan(low2,low1))
      {
        lowest = low1;
        middle1 = low2;
      }
      else
      {
        lowest = low2;
        middle1 = low1;
      }
  
      if (betterThan(high1, high2))
      {
        highest = high1;
        middle2 = high2;
      }
      else
      {
        highest = high2;
        middle2 = high1;
      }
          
  
      if (betterThan(middle2, middle1))
      {
        return [highest,middle2,middle1,lowest];
      }
      else
      {
        return [highest,middle1,middle2,lowest];
      }
    }  

module.exports = sortSnakes;
