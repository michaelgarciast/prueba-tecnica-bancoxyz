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

const submit = () => userEvent.click(screen.getByRole('button', { name: 'Transferir' }));
const confirm = () => userEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

test('does not submit when the value is not greater than 0', () => {
  render(<TransferForm currency="COP" accountBalance={10000} />);
  fill('0');
  submit();
  expect(screen.getByRole('alert')).toHaveTextContent('El valor debe ser mayor a 0');
  expect(mockedCreateTransfer).not.toHaveBeenCalled();
});

test('sends the correct body for an immediate transfer', async () => {
  mockedCreateTransfer.mockResolvedValue({ status: 'success' });
  render(<TransferForm currency="COP" accountBalance={10000} />);
  fill('500', ' 999 ');
  submit();
  expect(screen.getByRole('heading', { name: 'Confirma la transferencia' })).toBeInTheDocument();
  expect(mockedCreateTransfer).not.toHaveBeenCalled();
  confirm();
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

test('does not submit when the value exceeds the available balance', () => {
  render(<TransferForm currency="COP" accountBalance={100} />);
  fill('500');
  submit();
  expect(screen.getByRole('alert')).toHaveTextContent('El valor excede el saldo disponible');
  expect(mockedCreateTransfer).not.toHaveBeenCalled();
});

test('shows an error and keeps the form when the api rejects the transfer', async () => {
  mockedCreateTransfer.mockResolvedValue({ status: 'error', message: 'Bad request' });
  render(<TransferForm currency="COP" accountBalance={10000} />);
  fill('100');
  submit();
  confirm();
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo realizar la transferencia');
  expect(screen.getByLabelText(/Valor/)).toHaveValue(100);
  expect(localStorage.getItem('transfers:1')).toBeNull();
});

test('sends transfers with the same balance returned by the api', async () => {
  mockedCreateTransfer.mockResolvedValue({ status: 'success' });
  render(<TransferForm currency="COP" accountBalance={1000} />);
  fill('400');
  submit();
  confirm();
  await screen.findByRole('status');
  fill('400');
  submit();
  confirm();
  expect(await screen.findByRole('status')).toHaveTextContent('Transferencia realizada con éxito');
  expect(mockedCreateTransfer).toHaveBeenCalledTimes(2);
  expect(mockedCreateTransfer).toHaveBeenLastCalledWith(
    expect.objectContaining({ value: 400 })
  );
});

test('sends the future date for a scheduled transfer', async () => {
  mockedCreateTransfer.mockResolvedValue({ status: 'success' });
  render(<TransferForm currency="COP" accountBalance={10000} />);
  fill('100');
  fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2999-01-31' } });
  submit();
  expect(screen.getByText('31/01/2999 (agendada)')).toBeInTheDocument();
  confirm();
  expect(await screen.findByRole('status')).toHaveTextContent('Transferencia agendada para el 31/01/2999');
  expect(mockedCreateTransfer).toHaveBeenCalledWith(
    expect.objectContaining({ value: 100, transferDate: '2999-01-31' })
  );
});

test('goes back to the form with the data when editing from the confirmation', () => {
  render(<TransferForm currency="COP" accountBalance={10000} />);
  fill('250', '777');
  submit();
  userEvent.click(screen.getByRole('button', { name: 'Editar' }));
  expect(screen.getByLabelText(/Valor/)).toHaveValue(250);
  expect(screen.getByLabelText('Documento del destinatario')).toHaveValue('777');
  expect(mockedCreateTransfer).not.toHaveBeenCalled();
});
