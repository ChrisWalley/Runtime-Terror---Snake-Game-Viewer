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

test('Tests parsing coordinates - Object', () => {
  expect(parseCoords("0 1,1 1,2 2,2 2,3 3,3", 1)[0]['startX']).toBe(1);
});


test('Tests parsing coordinates - Snake', () => {
  expect(parseCoords("0 2 alive 4 30,21 29,21 28,21 27,21 26,26", 4)[3]['height']).toBe(6);
});

test('Tests parsing coordinates - Empty', () => {
  expect(parseCoords("", 1).length).toBe(0);
});

//Add test for client socket gamestate update
// Add test for loop method
