import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/config';
import { LanguageSwitcher } from './LanguageSwitcher';

const renderIt = () =>
  render(
    <I18nextProvider i18n={i18n}>
      <LanguageSwitcher />
    </I18nextProvider>,
  );

afterEach(async () => {
  await i18n.changeLanguage('fr');
});

describe('LanguageSwitcher', () => {
  it('offers the three supported languages', () => {
    renderIt();
    expect(screen.getByRole('option', { name: 'Français' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'العربية' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'English' })).toBeTruthy();
  });

  it('switches the active language on selection', async () => {
    renderIt();
    await userEvent.selectOptions(screen.getByRole('combobox'), 'ar');
    await waitFor(() => expect(i18n.language).toBe('ar'));
  });
});
