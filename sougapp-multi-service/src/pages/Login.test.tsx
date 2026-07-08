import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/config';
import { Login } from './Login';

describe('Login', () => {
  it('renders login form', () => {
    render(
      <MemoryRouter>
        <I18nextProvider i18n={i18n}>
          <Login />
        </I18nextProvider>
      </MemoryRouter>
    );
    expect(screen.getByText('SougApp')).toBeTruthy();
  });
});
