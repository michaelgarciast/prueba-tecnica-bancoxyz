import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Transfer, getTransfers } from '../api';
import { useAuth } from '../auth/AuthContext';
import TransferFilters from '../components/TransferFilters';
import { emptyFilters, filterTransfers } from '../utils/filterTransfers';
import { formatCurrency, formatDate } from '../utils/format';
import { loadLocalTransfers } from '../utils/localTransfers';

export default function TransferListPage() {
  const { user } = useAuth();
  const [transfers, setTransfers] = useState<Transfer[] | null>(null);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(emptyFilters);

  useEffect(() => {
    getTransfers()
      .then((r) => setTransfers([...(user ? loadLocalTransfers(user.id) : []), ...r.transfers]))
      .catch(() => setError('No se pudo cargar el historial'));
  }, [user]);

  const filtered = useMemo(() => filterTransfers(transfers ?? [], filters), [transfers, filters]);

  let content: ReactNode;
  if (error) {
    content = (
      <p className="alert alert-error" role="alert">
        {error}
      </p>
    );
  } else if (!transfers) {
    content = <p className="loading">Cargando...</p>;
  } else if (transfers.length === 0) {
    content = <p className="card muted">Aún no hay transferencias</p>;
  } else if (filtered.length === 0) {
    content = (
      <p className="card muted" role="status">
        Sin resultados para los filtros aplicados
      </p>
    );
  } else {
    content = (
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Destinatario</th>
              <th scope="col" className="num">
                Valor
              </th>
              <th scope="col">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => (
              <tr key={i}>
                <td>{t.payeer.name}</td>
                <td className="num">{formatCurrency(t.value, t.currency)}</td>
                <td>{formatDate(t.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <main>
      <h1>Historial de transferencias</h1>
      <TransferFilters filters={filters} onChange={setFilters} />
      {content}
    </main>
  );
}
