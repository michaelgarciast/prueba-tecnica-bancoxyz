import { useEffect, useMemo, useState } from 'react';
import { Transfer, getTransfers } from '../api';
import TransferFilters from '../components/TransferFilters';
import { emptyFilters, filterTransfers } from '../utils/filterTransfers';
import { formatCurrency, formatDate } from '../utils/format';

export default function TransferListPage() {
  const [transfers, setTransfers] = useState<Transfer[] | null>(null);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(emptyFilters);

  useEffect(() => {
    getTransfers()
      .then((r) => setTransfers(r.transfers))
      .catch(() => setError('No se pudo cargar el historial'));
  }, []);

  const filtered = useMemo(() => filterTransfers(transfers ?? [], filters), [transfers, filters]);

  return (
    <main>
      <h1>Historial de transferencias</h1>
      <TransferFilters filters={filters} onChange={setFilters} />
      {error ? (
        <p role="alert">{error}</p>
      ) : !transfers ? (
        <p>Cargando...</p>
      ) : filtered.length === 0 ? (
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
            {filtered.map((t, i) => (
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
