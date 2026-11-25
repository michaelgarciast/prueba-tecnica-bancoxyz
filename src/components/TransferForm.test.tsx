import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TransferForm from './TransferForm';
import { createTransfer } from '../api';
import { todayLocal } from '../utils/format';

jest.mock('../api', () => ({
  ...jest.requireActual('../api'),
  createTransfer: jest.fn(),
}));

jest.mock('../auth/AuthContext', () => ({
  useAuth: () => ({ user: { id: 1, name: 'Gabriel', email: 'gabriel@topaz.com' } }),
}));

const mockedCreateTransfer = createTransfer as jest.MockedFunction<typeof createTransfer>;

beforeEach(() => {
  jest.resetAllMocks();
  localStorage.clear();
});

const fill = (value: string, document = '123') => {
  userEvent.type(screen.getByLabelText(/Valor/), value);
  userEvent.type(screen.getByLabelText('Documento del destinatario'), document);
};

test('does not submit when the value is not greater than 0', () => {
  render(<TransferForm currency="COP" />);
  fill('0');
  userEvent.click(screen.getByRole('button', { name: 'Transferir' }));
  expect(screen.getByRole('alert')).toHaveTextContent('El valor debe ser mayor a 0');
  expect(mockedCreateTransfer).not.toHaveBeenCalled();
});

test('sends the correct body for an immediate transfer', async () => {
  mockedCreateTransfer.mockResolvedValue({ status: 'success' });
  render(<TransferForm currency="COP" />);
  fill('500', ' 999 ');
  userEvent.click(screen.getByRole('button', { name: 'Transferir' }));
  expect(await screen.findByRole('status')).toHaveTextContent('Transferencia realizada con éxito');
  expect(mockedCreateTransfer).toHaveBeenCalledWith({
    value: 500,
    currency: 'COP',
    payeerDocument: '999',
    transferDate: todayLocal(),
  });
  expect(JSON.parse(localStorage.getItem('transfers:1') ?? '[]')).toEqual([
    expect.objectContaining({ value: 500, payeer: { document: '999', name: '999' } }),
  ]);
});

test('sends the future date for a scheduled transfer', async () => {
  mockedCreateTransfer.mockResolvedValue({ status: 'success' });
  render(<TransferForm currency="COP" />);
  fill('100');
  fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2999-01-31' } });
  userEvent.click(screen.getByRole('button', { name: 'Transferir' }));
  expect(await screen.findByRole('status')).toHaveTextContent('Transferencia agendada para el 31/01/2999');
  expect(mockedCreateTransfer).toHaveBeenCalledWith(
    expect.objectContaining({ value: 100, transferDate: '2999-01-31' })
  );
});
