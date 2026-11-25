import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { AuthProvider } from '../auth/AuthContext';
import * as api from '../api';

jest.mock('../api', () => ({
  ...jest.requireActual('../api'),
  login: jest.fn(),
  getBalance: jest.fn(),
  setUnauthorizedHandler: jest.fn(),
}));

const mockedApi = api as jest.Mocked<typeof api>;

const renderLogin = (path = '/login') =>
  render(
    <MemoryRouter
      initialEntries={[path]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>
  );

const fillAndSubmit = () => {
  userEvent.type(screen.getByLabelText('Correo electrónico'), 'gabriel@topaz.com');
  userEvent.type(screen.getByLabelText('Contraseña'), '1111');
  userEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
};

beforeEach(() => {
  localStorage.clear();
  jest.resetAllMocks();
});

test('shows an error with invalid credentials', async () => {
  mockedApi.login.mockRejectedValue(new api.ApiError(401, 'Unauthorized'));
  renderLogin();
  fillAndSubmit();
  expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales inválidas');
  expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
});

test('redirects to home with valid credentials', async () => {
  mockedApi.login.mockResolvedValue({
    token: 'abc',
    user: { id: 1, name: 'Gabriel', email: 'gabriel@topaz.com' },
  });
  mockedApi.getBalance.mockResolvedValue({ currency: 'COP', accountBalance: 1000 });
  renderLogin();
  fillAndSubmit();
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Inicio' })).toBeInTheDocument());
  expect(mockedApi.login).toHaveBeenCalledWith('gabriel@topaz.com', '1111');
});

test('tells the user when the session expired', async () => {
  localStorage.setItem(
    'session',
    JSON.stringify({ token: 'old', user: { id: 1, name: 'Gabriel', email: 'gabriel@topaz.com' } })
  );
  mockedApi.getBalance.mockReturnValue(new Promise(() => {}));
  renderLogin('/');
  const onUnauthorized = mockedApi.setUnauthorizedHandler.mock.calls[0][0];
  act(() => onUnauthorized());
  expect(await screen.findByRole('status')).toHaveTextContent('Tu sesión expiró');
  expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
});
