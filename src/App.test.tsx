import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils'
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import App from './App';

const parseCoords = require('./parseCoords');

test('Test header', () => {

  act(() => {
    render(<App />);
  });
  const linkElementHeader = screen.getByText(/Snake AI Competition/i);
  expect(linkElementHeader).toBeInTheDocument();
});

test('Test header links', () => {

  act(() => {
    render(<App />);
  });
  //const linkElementWatch = screen.getByText(/Watch/i);
//  expect(linkElementWatch).toBeInTheDocument();

  const linkElementHome = screen.getByText(/Home/i);
  expect(linkElementHome).toBeInTheDocument();

  const linkElementDocs = screen.getByText(/Docs/i);
  expect(linkElementDocs).toBeInTheDocument();

  const linkElementDownloads = screen.getByText(/Downloads/i);
  expect(linkElementDownloads).toBeInTheDocument();

  const linkElementHelp = screen.getByText(/Help/i);
  expect(linkElementHelp).toBeInTheDocument();
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
