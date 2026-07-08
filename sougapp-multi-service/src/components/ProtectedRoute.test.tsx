import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthContext } from '../contexts/AuthContext';

import type { Session, User } from '@supabase/supabase-js';

const mockUser: User = { id: '1', email: 'test@test.com', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: new Date().toISOString(), role: '' };
const mockSession: Session = { user: mockUser, access_token: 'tok', refresh_token: 'ref', expires_in: 3600, token_type: 'bearer' };

const mockAuth = (role: string | null) => ({
  session: role ? mockSession : null,
  user: role ? mockUser : null,
  role,
  loading: false,
  signOut: vi.fn(),
});

describe('ProtectedRoute', () => {
  it('renders children when authorized', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthContext.Provider value={mockAuth('super_admin')}>
          <Routes>
            <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
              <Route path="/" element={<div>Protected Content</div>} />
            </Route>
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );
    expect(screen.getByText('Protected Content')).toBeTruthy();
  });

  it('redirects when not authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AuthContext.Provider value={mockAuth(null)}>
          <Routes>
            <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
              <Route path="/admin" element={<div>Protected Content</div>} />
            </Route>
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );
    expect(screen.queryByText('Protected Content')).toBeNull();
  });
});
