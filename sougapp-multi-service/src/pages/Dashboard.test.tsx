import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/config';
import { Dashboard } from './Dashboard';

describe('Dashboard', () => {
  it('renders dashboard sections', () => {
    render(
      <MemoryRouter>
        <I18nextProvider i18n={i18n}>
          <Dashboard />
        </I18nextProvider>
      </MemoryRouter>
    );
    expect(screen.getByText('Tableau de bord')).toBeTruthy();
  });
});
