import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils'
import {mount, shallow, configure} from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { render, fireEvent, screen, queryByAttribute } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import App from './App';

configure({ adapter: new Adapter() });

test('Test buttons', () => {
  act(() => {
    render(<App />);
  });

  const linkElementBtnskip_previous = screen.getByText(/skip_previous/i);
  fireEvent.click(linkElementBtnskip_previous);

  const linkElementBtnfast_rewind = screen.getByText(/fast_rewind/i);
  fireEvent.click(linkElementBtnfast_rewind);

  const linkElementBtnfast_forward = screen.getByText(/fast_forward/i);
  fireEvent.click(linkElementBtnfast_forward);

  const linkElementBtnskip_next = screen.getByText(/skip_next/i);
  fireEvent.click(linkElementBtnskip_next);

  const linkElementBtnpause_circle_outline = screen.getByText(/pause_circle_outline/i);
  fireEvent.click(linkElementBtnpause_circle_outline);

  const linkElementBtnplay_circle_outline = screen.getByText(/play_circle_outline/i);
  expect(linkElementBtnplay_circle_outline).toBeInTheDocument();
  fireEvent.click(linkElementBtnplay_circle_outline);

  expect(linkElementBtnpause_circle_outline).toBeInTheDocument();

  const linkElementBtngrid_on = screen.getByText(/grid_off/i);
  fireEvent.click(linkElementBtngrid_on);

  const linkElementBtngrid_off = screen.getByText(/grid_on/i);
  expect(linkElementBtngrid_off).toBeInTheDocument();
  fireEvent.click(linkElementBtngrid_off);

  expect(linkElementBtngrid_on).toBeInTheDocument();

  const linkElementBtntriggerLogicUpdate = screen.getByText(/triggerLogicUpdate/i);
  fireEvent.click(linkElementBtntriggerLogicUpdate);
});



test('Test leaderboard interaction', () => {
  act(() => {
    render(<App />);
  });
  
  const linkElementTerror = screen.getByText(/Terror/i);
  expect(linkElementTerror).toBeInTheDocument();
  fireEvent.click(linkElementTerror);

  const linkElementBtntriggerDrawStats = screen.getByText(/triggerDrawStats/i);
  fireEvent.click(linkElementBtntriggerDrawStats);
  

  const linkElementBtntriggerStatsUser = screen.getByText(/triggerStatsUser/i);
  fireEvent.click(linkElementBtntriggerStatsUser);
  

  
  const linkElementBtntriggerStatsDivisionButton = screen.getByText(/triggerStatsDivisionFromSelect/i);
  fireEvent.click(linkElementBtntriggerStatsDivisionButton);


});


test('Test header links', () => {
  act(() => {
    render(<App />);
  });

  const linkElementWatch = screen.getByText(/Watch/i);
  expect(linkElementWatch).toBeInTheDocument();

  const linkElementHome = screen.getByText(/Home/i);
  expect(linkElementHome).toBeInTheDocument();

  const linkElementDocs = screen.getByText(/Docs/i);
  expect(linkElementDocs).toBeInTheDocument();

  const linkElementDownloads = screen.getByText(/Downloads/i);
  expect(linkElementDownloads).toBeInTheDocument();

  const linkElementHelp = screen.getByText(/Help/i);
  expect(linkElementHelp).toBeInTheDocument();
});


test('Test other functions', () => {
  act(() => {
    render(<App />);
  });

  const linkElementBtntriggerMiscFunctions = screen.getByText(/triggerMiscFunctions/i);
  fireEvent.click(linkElementBtntriggerMiscFunctions);

  const linkElementBtntriggerDrawGameboard = screen.getByText(/triggerDrawGameboard/i);
  fireEvent.click(linkElementBtntriggerDrawGameboard);
  
  const linkElementBtntriggerDrawStats = screen.getByText(/triggerDrawStats/i);
  fireEvent.click(linkElementBtntriggerDrawStats);

  
  const linkElementTerror = screen.getByText(/Terror/i);
  expect(linkElementTerror).toBeInTheDocument();
  fireEvent.click(linkElementTerror);
  

  fireEvent.click(linkElementBtntriggerMiscFunctions);
  fireEvent.click(linkElementBtntriggerDrawGameboard);
  fireEvent.click(linkElementBtntriggerDrawStats);

});


