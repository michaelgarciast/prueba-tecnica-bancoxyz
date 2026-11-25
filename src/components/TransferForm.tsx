import { SubmitEvent, useState } from 'react';
import { TransferRequest, createTransfer } from '../api';
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
  const [payeerDocument, setPayeerDocument] = useState('');
  const [date, setDate] = useState(todayLocal());
  const [error, setError] = useState<FormError | null>(null);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<TransferRequest | null>(null);
  const today = todayLocal();
  const amount = Number(value);
  const availableBalance = accountBalance - (user ? spentLocalTransfers(user.id) : 0);

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess('');
    const doc = payeerDocument.trim();
    if (amount <= 0) return setError({ field: 'value', message: 'El valor debe ser mayor a 0' });
    if (amount > availableBalance)
      return setError({ field: 'value', message: 'El valor excede el saldo disponible' });
    if (!doc) return setError({ field: 'document', message: 'El documento del destinatario es requerido' });
    if (date < today) return setError({ field: 'date', message: 'La fecha no puede ser pasada' });
    setPending({ value: amount, currency, payeerDocument: doc, transferDate: date });
  };

  const confirm = async (transfer: TransferRequest) => {
    setLoading(true);
    try {
      const res = await createTransfer(transfer);
      if (res.status === 'error') throw new Error(res.message);
      const { payeerDocument: doc, transferDate } = transfer;
      if (user)
        saveLocalTransfer(user.id, {
          value: transfer.value,
          date: transferDate,
          currency,
          payeer: { document: doc, name: doc },
        });
      setSuccess(
        transferDate > today
          ? `Transferencia agendada para el ${formatDate(transferDate)}`
          : 'Transferencia realizada con éxito'
      );
      setValue('');
      setPayeerDocument('');
      setDate(today);
    } catch {
      setError({ message: 'No se pudo realizar la transferencia. Revisa los datos e intenta de nuevo.' });
    } finally {
      setLoading(false);
      setPending(null);
    }
  };

  if (pending) {
    const scheduled = pending.transferDate > today;
    return (
      <section className="card flex max-w-lg flex-col gap-4" aria-labelledby="confirm-title">
        <h2 id="confirm-title" className="text-lg font-semibold">
          Confirma la transferencia
        </h2>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
          <dt className="text-slate-500">Valor</dt>
          <dd className="font-semibold tabular-nums">{formatCurrency(pending.value, currency)}</dd>
          <dt className="text-slate-500">Destinatario</dt>
          <dd>{pending.payeerDocument}</dd>
          <dt className="text-slate-500">Fecha</dt>
          <dd>{scheduled ? `${formatDate(pending.transferDate)} (agendada)` : 'Hoy (inmediata)'}</dd>
        </dl>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" className="btn" disabled={loading} onClick={() => confirm(pending)} autoFocus>
            {loading ? 'Enviando...' : 'Confirmar'}
          </button>
          <button type="button" className="btn btn-secondary" disabled={loading} onClick={() => setPending(null)}>
            Editar
          </button>
        </div>
      </section>
    );
  }

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
            {amount > 0 && `${formatCurrency(amount, currency)} · `}
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
          inputMode="numeric"
          autoComplete="off"
          value={payeerDocument}
          onChange={(e) => setPayeerDocument(e.target.value)}
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
          min={today}
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
      <button type="submit" className="btn">
        Transferir
      </button>
    </form>
  );
}
