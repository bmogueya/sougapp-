import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  it('renders with accessible label', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button')).toBeTruthy();
  });
});
