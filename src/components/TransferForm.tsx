import { FormEvent, useState } from 'react';
import { ApiError, createTransfer } from '../api';
import { todayLocal } from '../utils/format';

interface Props {
  currency: string;
}

export default function TransferForm({ currency }: Props) {
  const [value, setValue] = useState('');
  const [document, setDocument] = useState('');
  const [date, setDate] = useState(todayLocal());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const amount = Number(value);
    if (!(amount > 0)) return setError('El valor debe ser mayor a 0');
    if (!document.trim()) return setError('El documento del destinatario es requerido');
    if (date < todayLocal()) return setError('La fecha no puede ser pasada');

    setLoading(true);
    try {
      const res = await createTransfer({
        value: amount,
        currency,
        payeerDocument: document.trim(),
        transferDate: date,
      });
      if (res.status === 'error') throw new ApiError(400, res.message ?? '');
      setSuccess(date > todayLocal() ? 'Transferencia agendada con éxito' : 'Transferencia realizada con éxito');
      setValue('');
      setDocument('');
      setDate(todayLocal());
    } catch (err) {
      setError(err instanceof ApiError && err.message ? err.message : 'No se pudo realizar la transferencia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <label>
        Valor ({currency})
        <input type="number" step="any" value={value} onChange={(e) => setValue(e.target.value)} />
      </label>
      <label>
        Documento del destinatario
        <input value={document} onChange={(e) => setDocument(e.target.value)} />
      </label>
      <label>
        Fecha
        <input type="date" min={todayLocal()} value={date} onChange={(e) => setDate(e.target.value)} />
      </label>
      {error && <p role="alert">{error}</p>}
      {success && <p role="status">{success}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Enviando...' : 'Transferir'}
      </button>
    </form>
  );
}
