function betterThan(snakeA, snakeB)
    {
      if(snakeA.score > snakeB.score)
      {
        return true;
      }
      else if(snakeA.score < snakeB.score)
      {
        return false;
      }
      else
      {
        if(snakeA.kills > snakeB.kills)
        {
          return true;
        }
        else if(snakeA.kills < snakeB.kills)
        {
          return false;
        }
        else
        {
          return (snakeA.length > snakeB.length);
        }
      }
    }
module.exports = betterThan;
