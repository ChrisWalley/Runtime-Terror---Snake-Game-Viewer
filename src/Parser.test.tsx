import {configure} from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import '@testing-library/jest-dom/extend-expect';
const parseCoords = require('./parseCoords');
const parseGamestate = require('./parseGamestate');

configure({ adapter: new Adapter() });

test('Tests parsing coordinates - Object', () => {
  expect(parseCoords("0 1,1 1,2 2,2 2,3 3,3", 1).rects[0]['startX']).toBe(1);
});

test('Tests parsing coordinates - Snake', () => {
  expect(parseCoords("0 2 alive 4 30,21 29,21 28,21 27,21 26,26", 4).rects[3]['height']).toBe(6);
});

test('Tests parsing coordinates - Empty', () => {
  expect(parseCoords("", 1).length).toBe(0);
});

test('Tests parsing gamestate - bad format', () => {
  var GS = "0 43"+
  "41,0 41,1 41,2 41,3 41,4"+
  "39,10 40,10 41,10 42,10 43,10"+
  "23,41 23,40 23,39 23,38 23,37\n"+
  "5 -1 Medium alive 5 0 17,34 20,34 20,33"+
  "5 -2 Easy alive 5 0 6,6 9,6 9,5\n"+
  "5 -3 VeryEasy alive 5 0 8,42 12,42\n"+
  "5 -4 Random alive 5 0 33,40 31,40 31,38";

  expect(parseGamestate(GS, 1)).toBe(null);
});

test('Tests parsing gamestate - Empty', () => {
  var GS = "";
  expect(parseGamestate(GS, 1)).toBe(null);
});

test('Tests parsing gamestate', () => {
  var GS = "0 43\n"+
  "41,0 41,1 41,2 41,3 41,4\n"+
  "39,10 40,10 41,10 42,10 43,10\n"+
  "23,41 23,40 23,39 23,38 23,37\n"+
  "5 -1 Medium alive 5 0 17,34 20,34 20,33\n"+
  "5 -2 Easy alive 5 0 6,6 9,6 9,5\n"+
  "5 -3 VeryEasy alive 5 0 8,42 12,42\n"+
  "5 -4 Random alive 5 0 33,40 31,40 31,38";

  expect(parseGamestate(GS, 1).state).toBe(1);
});


