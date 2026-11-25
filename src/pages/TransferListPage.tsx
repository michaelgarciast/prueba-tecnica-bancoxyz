import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Transfer, getTransfers } from '../api';
import { useAuth } from '../auth/AuthContext';
import TransferFilters from '../components/TransferFilters';
import { emptyFilters, filterTransfers } from '../utils/filterTransfers';
import { formatCurrency, formatDate, todayLocal } from '../utils/format';
import { loadLocalTransfers } from '../utils/localTransfers';

export default function TransferListPage() {
  const { user } = useAuth();
  const [transfers, setTransfers] = useState<Transfer[] | null>(null);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(emptyFilters);

  useEffect(() => {
    getTransfers()
      .then((r) => {
        const all = [...(user ? loadLocalTransfers(user.id) : []), ...r.transfers];
        all.sort((a, b) => b.date.localeCompare(a.date));
        setTransfers(all);
      })
      .catch(() => setError('No se pudo cargar el historial'));
  }, [user]);

  const filtered = useMemo(() => filterTransfers(transfers ?? [], filters), [transfers, filters]);

  const today = todayLocal();
  const th = 'whitespace-nowrap px-4 py-2 font-semibold';
  const td = 'whitespace-nowrap px-4 py-3';

  let content: ReactNode;
  if (error) {
    content = (
      <p className="alert-error" role="alert">
        {error}
      </p>
    );
  } else if (!transfers) {
    content = <p className="loading">Cargando...</p>;
  } else if (transfers.length === 0) {
    content = <p className="card text-slate-500">Aún no hay transferencias</p>;
  } else if (filtered.length === 0) {
    content = (
      <p className="card text-slate-500" role="status">
        Sin resultados para los filtros aplicados
      </p>
    );
  } else {
    content = (
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left">
          <thead className="border-b border-slate-200 bg-slate-50 text-sm text-slate-500">
            <tr>
              <th scope="col" className={th}>
                Destinatario
              </th>
              <th scope="col" className={`${th} text-right`}>
                Valor
              </th>
              <th scope="col" className={th}>
                Fecha
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.map((t, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className={td}>{t.payeer.name}</td>
                <td className={`${td} text-right tabular-nums`}>{formatCurrency(t.value, t.currency)}</td>
                <td className={td}>
                  {formatDate(t.date)}
                  {t.date.slice(0, 10) > today && (
                    <span className="ml-2 rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                      Agendada
                    </span>
                  )}
                </td>
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
