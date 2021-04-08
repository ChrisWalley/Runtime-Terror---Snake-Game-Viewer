import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils'
import { render, screen } from '@testing-library/react';
import App from './App';

test('test header', () => {

  act(() => {
    render(<App />);
  });
  const linkElement = screen.getByText(/Snake Game/i);


  expect(linkElement).toBeInTheDocument();
});
