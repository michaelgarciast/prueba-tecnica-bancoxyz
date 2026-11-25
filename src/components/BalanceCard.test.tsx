import { render, screen } from '@testing-library/react';
import BalanceCard from './BalanceCard';
import { getBalance } from '../api';

jest.mock('../api');

const mockedGetBalance = getBalance as jest.MockedFunction<typeof getBalance>;

test('shows the formatted balance', async () => {
  mockedGetBalance.mockResolvedValue({ currency: 'USD', accountBalance: 1234.5 });
  render(<BalanceCard />);
  expect(screen.getByText('Cargando...')).toBeInTheDocument();
  const balance = await screen.findByText(/1\.234,50/);
  expect(balance).toHaveTextContent(/US\$|USD/);
});

test('shows an error message when the request fails', async () => {
  mockedGetBalance.mockRejectedValue(new Error('fail'));
  render(<BalanceCard />);
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar el saldo');
});
