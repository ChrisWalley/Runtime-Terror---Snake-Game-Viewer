import {configure} from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import '@testing-library/jest-dom/extend-expect';
const sortSnakes = require('./sortSnakes');

configure({ adapter: new Adapter() });

test('Tests sorting of snakes - all the same', () => {

  var snakeA = {
    score:1,
    kills:1,
    length:1
  };

  var snakeB = {
    score:1,
    kills:1,
    length:1
  };

  var snakeC = {
    score:1,
    kills:1,
    length:1
  };

  var snakeD = {
    score:1,
    kills:1,
    length:1
  };
  expect(sortSnakes(snakeA, snakeB, snakeC, snakeD).length).toBe(4);
});

test('Tests sorting of snakes - A > B > C > D', () => {

  var snakeA = {
    score:4
  };

  var snakeB = {
    score:3
  };

  var snakeC = {
    score:2
  };

  var snakeD = {
    score:1
    };
  expect(sortSnakes(snakeA, snakeB, snakeC, snakeD).length).toBe(4);
});


test('Tests sorting of snakes - B > D > A > C', () => {

  var snakeA = {
    score:2
  };

  var snakeB = {
    score:4
  };

  var snakeC = {
    score:1
  };

  var snakeD = {
    score:3
    };
  expect(sortSnakes(snakeA, snakeB, snakeC, snakeD).length).toBe(4);
});

test('Tests sorting of snakes - C > D > A > B', () => {

  var snakeA = {
    score:2
  };

  var snakeB = {
    score:1
  };

  var snakeC = {
    score:4
  };

  var snakeD = {
    score:3
    };
  expect(sortSnakes(snakeA, snakeB, snakeC, snakeD).length).toBe(4);
});

test('Tests sorting of snakes - B > A > D > C', () => {

  var snakeA = {
    score:3
  };

  var snakeB = {
    score:4
  };

  var snakeC = {
    score:1
  };

  var snakeD = {
    score:2
    };
  expect(sortSnakes(snakeA, snakeB, snakeC, snakeD).length).toBe(4);
});