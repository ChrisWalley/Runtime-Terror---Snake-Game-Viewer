import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('test header', () => {
  render(<App />);
  const linkElement = screen.getByText(/Snake Game/i);
  expect(linkElement).toBeInTheDocument();
});
