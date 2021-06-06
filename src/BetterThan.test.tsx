import {configure} from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import '@testing-library/jest-dom/extend-expect';
const betterThan = require('./betterThan');

configure({ adapter: new Adapter() });

test('Tests snakes - A has higher max than B', () => {

  var snakeA = {
    score:2,
    kills:1,
    length:1
  };

  var snakeB = {
    score:1,
    kills:1,
    length:1
  };
  expect(betterThan(snakeA, snakeB)).toBe(true);
});

test('Tests snakes - A has lower max than B', () => {

  var snakeA = {
    score:1,
    kills:1,
    length:1
  };

  var snakeB = {
    score:2,
    kills:1,
    length:1
  };
  expect(betterThan(snakeA, snakeB)).toBe(false);
});

test('Tests snakes - same score A has higher kills than B', () => {

  var snakeA = {
    score:1,
    kills:2,
    length:1
  };

  var snakeB = {
    score:1,
    kills:1,
    length:1
  };
  expect(betterThan(snakeA, snakeB)).toBe(true);
});

test('Tests snakes - same score A has higher kills than B', () => {

  var snakeA = {
    score:1,
    kills:1,
    length:1
  };

  var snakeB = {
    score:1,
    kills:2,
    length:1
  };
  expect(betterThan(snakeA, snakeB)).toBe(false);
});

test('Tests snakes - same score and kills A is longer than B', () => {

  var snakeA = {
    score:1,
    kills:1,
    length:2
  };

  var snakeB = {
    score:1,
    kills:1,
    length:1
  };
  expect(betterThan(snakeA, snakeB)).toBe(true);
});