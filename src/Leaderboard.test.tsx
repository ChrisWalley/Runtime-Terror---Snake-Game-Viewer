import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils'
import {mount, shallow, configure} from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import App from './App';

configure({ adapter: new Adapter() });

test('Leaderboard', () => {
  act(() => {
    render(<App />);
  });

  const linkElementName = screen.getByText(/name/i);
  expect(linkElementName).toBeInTheDocument();

  const linkElementHeader = screen.getByText(/Leaderboard/i);
  expect(linkElementHeader).toBeInTheDocument();

  const linkElementFunctionTests = screen.getByText(/triggerClickFunctions/i);
  expect(linkElementFunctionTests).toBeInTheDocument();
  fireEvent.click(linkElementFunctionTests);

  const linkElementScore = screen.getByText(/score/i);
  expect(linkElementScore).toBeInTheDocument();

});
