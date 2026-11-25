import { SubmitEvent, useState } from 'react';
import { ApiError, createTransfer } from '../api';
import { useAuth } from '../auth/AuthContext';
import { formatCurrency, formatDate, todayLocal } from '../utils/format';
import { saveLocalTransfer, spentLocalTransfers } from '../utils/localTransfers';

interface Props {
  currency: string;
  accountBalance: number;
}

type Field = 'value' | 'document' | 'date';

interface FormError {
  field?: Field;
  message: string;
}

export default function TransferForm({ currency, accountBalance }: Readonly<Props>) {
  const { user } = useAuth();
  const [value, setValue] = useState('');
  const [document, setDocument] = useState('');
  const [date, setDate] = useState(todayLocal());
  const [error, setError] = useState<FormError | null>(null);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const availableBalance = accountBalance - (user ? spentLocalTransfers(user.id) : 0);

  const handleSubmit = async (e: SubmitEvent) => {
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

  const fieldProps = (field: Field, hintId?: string) => {
    const invalid = error?.field === field;
    return {
      'aria-invalid': invalid || undefined,
      'aria-describedby': (invalid ? `${field}-error` : hintId) || undefined,
    };
  };

  const fieldError = (field: Field) =>
    error?.field === field && (
      <p id={`${field}-error`} className="field-error" role="alert">
        {error.message}
      </p>
    );

  return (
    <form className="card flex max-w-lg flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="transfer-value">Valor ({currency})</label>
        <input
          className="input"
          id="transfer-value"
          name="value"
          type="number"
          step="any"
          min="0"
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          {...fieldProps('value', 'value-hint')}
        />
        {fieldError('value') || (
          <p id="value-hint" className="hint">
            Disponible: {formatCurrency(availableBalance, currency)}
          </p>
        )}
      </div>
      <div className="field">
        <label htmlFor="transfer-document">Documento del destinatario</label>
        <input
          className="input"
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
          className="input"
          id="transfer-date"
          name="transferDate"
          type="date"
          min={todayLocal()}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          {...fieldProps('date', 'date-hint')}
        />
        {fieldError('date') || (
          <p id="date-hint" className="hint">
            Hoy se envía de inmediato; elige una fecha futura para agendarla.
          </p>
        )}
      </div>
      {error && !error.field && (
        <p className="alert-error" role="alert">
          {error.message}
        </p>
      )}
      {success && (
        <p className="alert-success" role="status">
          {success}
        </p>
      )}
      <button type="submit" className="btn" disabled={loading}>
        {loading ? 'Enviando...' : 'Transferir'}
      </button>
    </form>
  );
}
