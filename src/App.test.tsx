import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils'
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import App from './App';

const parseCoords = require('./parseCoords');

test('test header', () => {

  act(() => {
    render(<App />);
  });
  const linkElement = screen.getByText(/Snake Game/i);

  expect(linkElement).toBeInTheDocument();
});

test('tests parsing of a coordinate string', () => {
  expect(parseCoords("0 30,21 29,21 28,21 27,21 26,21", 1)[0]['startX']).toBe(29);
});

test('tests parsing of a coordinate string', () => {
  expect(parseCoords("0 30,21 29,21 28,21 27,21 26,21", 1)[2]['startX']).toBe(27);
});

test('tests parsing of a coordinate string', () => {
  expect(parseCoords("0 30,21 29,28 28,21 27,21 26,21", 1)[2]['startY']).toBe(21);
});

test('tests parsing of a coordinate string', () => {
  expect(parseCoords("0 30,21 29,21 28,21 27,21 26,21", 1)[0]['width']).toBe(2);
});

test('tests parsing of a coordinate string', () => {
  expect(parseCoords("0 30,21 29,21 28,21 27,21 26,26", 1)[3]['height']).toBe(6);
});

test('tests parsing of a coordinate string', () => {
  expect(parseCoords("0 30,21 29,21 28,21 27,21 26,26", 1)[3]['height']).toBe(6);
});


test('tests parsing of a coordinate string', () => {
  expect(parseCoords("0 2 alive 4 30,21 29,21 28,21 27,21 26,26", 4)[3]['height']).toBe(6);
});


test('tests parsing of a coordinate string', () => {
  expect(parseCoords("0 30,21 29,21 28,21 27,21 26,26", 1)[3]['height']).toBe(6);
});
