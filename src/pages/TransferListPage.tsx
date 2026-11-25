import { useEffect, useState } from 'react';
import { Transfer, getTransfers } from '../api';
import { formatCurrency, formatDate } from '../utils/format';

export default function TransferListPage() {
  const [transfers, setTransfers] = useState<Transfer[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getTransfers()
      .then((r) => setTransfers(r.transfers))
      .catch(() => setError('No se pudo cargar el historial'));
  }, []);

  return (
    <main>
      <h1>Historial de transferencias</h1>
      {error ? (
        <p role="alert">{error}</p>
      ) : !transfers ? (
        <p>Cargando...</p>
      ) : transfers.length === 0 ? (
        <p>Sin resultados</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Destinatario</th>
              <th>Valor</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {transfers.map((t, i) => (
              <tr key={i}>
                <td>{t.payeer.name}</td>
                <td>{formatCurrency(t.value, t.currency)}</td>
                <td>{formatDate(t.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
