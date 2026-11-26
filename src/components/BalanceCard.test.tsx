import { fireEvent, render, screen } from '@testing-library/react';
import BalanceCard from './BalanceCard';
import { getBalance } from '../api';

jest.mock('../api');

jest.mock('../auth/AuthContext', () => {
  const user = { id: 1, name: 'Gabriel', email: 'gabriel@topaz.com' };
  return { useAuth: () => ({ user }) };
});

const mockedGetBalance = getBalance as jest.MockedFunction<typeof getBalance>;

beforeEach(() => localStorage.clear());

test('shows the formatted balance', async () => {
  mockedGetBalance.mockResolvedValue({ currency: 'USD', accountBalance: 1234.5 });
  render(<BalanceCard />);
  expect(screen.getByText('Cargando...')).toBeInTheDocument();
  const balance = await screen.findByText(/1\.234,50/);
  expect(balance).toHaveTextContent(/US\$|USD/);
});

test('hides and shows the available balance', async () => {
  mockedGetBalance.mockResolvedValue({ currency: 'USD', accountBalance: 1234.5 });
  render(<BalanceCard />);
  expect(await screen.findByText(/1\.234,50/)).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Ocultar saldo disponible' }));
  expect(screen.queryByText(/1\.234,50/)).not.toBeInTheDocument();
  expect(screen.getByText('••••••••')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Mostrar saldo disponible' }));
  expect(screen.getByText(/1\.234,50/)).toBeInTheDocument();
});

test('subtracts due local transfers from the api balance', async () => {
  localStorage.setItem(
    'transfers:1',
    JSON.stringify([
      { value: 200, date: '2020-01-01', currency: 'USD', payeer: { document: '1', name: '1' } },
      { value: 300, date: '2999-01-01', currency: 'USD', payeer: { document: '2', name: '2' } },
    ])
  );
  mockedGetBalance.mockResolvedValue({ currency: 'USD', accountBalance: 1000 });
  render(<BalanceCard />);
  expect(await screen.findByText(/800,00/)).toBeInTheDocument();
});

test('shows an error message when the request fails', async () => {
  mockedGetBalance.mockRejectedValue(new Error('fail'));
  render(<BalanceCard />);
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar el saldo');
});
