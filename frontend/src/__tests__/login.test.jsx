import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import Login from '../pages/Login';
import { LanguageProvider } from '../context/LanguageContext';
import { AuthProvider } from '../context/AuthContext';

const login = vi.fn(() => Promise.resolve({ user: { id: '1', role: 'ADMIN' } }));

vi.mock('../api/endpoints', () => ({
  authApi: {
    me: vi.fn(() => Promise.resolve({ user: null })),
    login: (...args) => login(...args),
    logout: vi.fn(() => Promise.resolve())
  }
}));

function renderLogin() {
  return render(
    <MemoryRouter>
      <LanguageProvider>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </LanguageProvider>
    </MemoryRouter>
  );
}

describe('Login page', () => {
  it('renders the French interface by default', () => {
    renderLogin();
    // t('auth.welcome') === 'Bon retour' in French.
    expect(screen.getByText('Bon retour')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('admin@agencyflow.local')).toBeInTheDocument();
  });

  it('submits the credentials', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByPlaceholderText('admin@agencyflow.local'), 'admin@agencyflow.local');
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123');
    await user.click(screen.getByRole('button', { name: /se connecter/i }));
    expect(login).toHaveBeenCalledWith({ email: 'admin@agencyflow.local', password: 'password123' });
  });

  it('switches to English when the language toggle is clicked', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByRole('button', { name: 'English' }));
    expect(await screen.findByText('Welcome back')).toBeInTheDocument();
  });
});
