import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/config';

const renderHeader = () => render(
  <BrowserRouter>
    <I18nextProvider i18n={i18n}>
      <Header onMenuClick={() => {}} />
    </I18nextProvider>
  </BrowserRouter>
);

describe('Header', () => {
  it('renders without crashing', () => {
    renderHeader();
    expect(screen.getByRole('banner')).toBeTruthy();
  });
});
