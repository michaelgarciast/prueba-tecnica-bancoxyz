import { FormEvent, useState } from 'react';
import { ApiError, createTransfer } from '../api';
import { useAuth } from '../auth/AuthContext';
import { formatDate, todayLocal } from '../utils/format';
import { saveLocalTransfer } from '../utils/localTransfers';

interface Props {
  currency: string;
  availableBalance: number;
}

type Field = 'value' | 'document' | 'date';

interface FormError {
  field?: Field;
  message: string;
}

export default function TransferForm({ currency, availableBalance }: Props) {
  const { user } = useAuth();
  const [value, setValue] = useState('');
  const [document, setDocument] = useState('');
  const [date, setDate] = useState(todayLocal());
  const [error, setError] = useState<FormError | null>(null);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess('');
    const amount = Number(value);
    if (amount <= 0) return setError({ field: 'value', message: 'El valor debe ser mayor a 0' });
    if (amount > availableBalance)
      return setError({ field: 'value', message: 'El valor excede el saldo disponible' });
    if (!document.trim())
      return setError({ field: 'document', message: 'El documento del destinatario es requerido' });
    if (date < todayLocal()) return setError({ field: 'date', message: 'La fecha no puede ser pasada' });

    setLoading(true);
    try {
      const res = await createTransfer({
        value: amount,
        currency,
        payeerDocument: document.trim(),
        transferDate: date,
      });
      if (res.status === 'error') throw new ApiError(400, res.message ?? '');
      if (user)
        saveLocalTransfer(user.id, {
          value: amount,
          date,
          currency,
          payeer: { document: document.trim(), name: document.trim() },
        });
      setSuccess(
        date > todayLocal()
          ? `Transferencia agendada para el ${formatDate(date)}`
          : 'Transferencia realizada con éxito'
      );
      setValue('');
      setDocument('');
      setDate(todayLocal());
    } catch (err) {
      setError({
        message: err instanceof ApiError && err.message ? err.message : 'No se pudo realizar la transferencia',
      });
    } finally {
      setLoading(false);
    }
  };

  const fieldProps = (field: Field) =>
    error?.field === field ? { 'aria-invalid': true, 'aria-describedby': `${field}-error` } : {};

  const fieldError = (field: Field) =>
    error?.field === field && (
      <p id={`${field}-error`} className="field-error" role="alert">
        {error.message}
      </p>
    );

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="transfer-value">Valor ({currency})</label>
        <input
          id="transfer-value"
          name="value"
          type="number"
          step="any"
          min="0"
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          {...fieldProps('value')}
        />
        {fieldError('value')}
      </div>
      <div className="field">
        <label htmlFor="transfer-document">Documento del destinatario</label>
        <input
          id="transfer-document"
          name="payeerDocument"
          value={document}
          onChange={(e) => setDocument(e.target.value)}
          {...fieldProps('document')}
        />
        {fieldError('document')}
      </div>
      <div className="field">
        <label htmlFor="transfer-date">Fecha</label>
        <input
          id="transfer-date"
          name="transferDate"
          type="date"
          min={todayLocal()}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          {...fieldProps('date')}
        />
        {fieldError('date')}
      </div>
      {error && !error.field && (
        <p className="alert alert-error" role="alert">
          {error.message}
        </p>
      )}
      {success && (
        <p className="alert alert-success" role="status">
          {success}
        </p>
      )}
      <button type="submit" disabled={loading}>
        {loading ? 'Enviando...' : 'Transferir'}
      </button>
    </form>
  );
}
