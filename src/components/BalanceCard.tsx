import { ReactNode, useEffect, useState } from 'react';
import { BalanceResponse, getBalance } from '../api';
import { useAuth } from '../auth/AuthContext';
import { formatCurrency } from '../utils/format';
import { spentLocalTransfers } from '../utils/localTransfers';

export default function BalanceCard() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<BalanceResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getBalance()
      .then((b) => {
        // La API no descuenta las transferencias: se restan las locales ya vencidas
        // (las agendadas a futuro descuentan cuando llegue su fecha).
        const spent = user ? spentLocalTransfers(user.id) : 0;
        setBalance({ ...b, accountBalance: b.accountBalance - spent });
      })
      .catch(() => setError('No se pudo cargar el saldo'));
  }, [user]);

  let content: ReactNode;
  if (error) {
    content = (
      <p className="alert-error" role="alert">
        {error}
      </p>
    );
  } else if (balance) {
    content = (
      <p className="text-3xl font-semibold tabular-nums text-slate-900">
        {formatCurrency(balance.accountBalance, balance.currency)}
      </p>
    );
  } else {
    content = <p className="loading">Cargando...</p>;
  }

  return (
    <section className="card">
      <h2 className="mb-1 text-sm font-medium text-slate-500">Saldo disponible</h2>
      {content}
    </section>
  );
}
