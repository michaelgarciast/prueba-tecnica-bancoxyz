import { useEffect, useState } from 'react';
import { BalanceResponse, getBalance } from '../api';
import { useAuth } from '../auth/AuthContext';
import { formatCurrency, todayLocal } from '../utils/format';
import { loadLocalTransfers } from '../utils/localTransfers';

export default function BalanceCard() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<BalanceResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getBalance()
      .then((b) => {
        // La API no descuenta las transferencias: se restan las locales ya vencidas
        // (las agendadas a futuro descuentan cuando llegue su fecha).
        const spent = user
          ? loadLocalTransfers(user.id)
              .filter((t) => t.date.slice(0, 10) <= todayLocal())
              .reduce((sum, t) => sum + t.value, 0)
          : 0;
        setBalance({ ...b, accountBalance: b.accountBalance - spent });
      })
      .catch(() => setError('No se pudo cargar el saldo'));
  }, [user]);

  return (
    <section className="card">
      <h2 className="balance-label">Saldo disponible</h2>
      {error ? (
        <p className="alert alert-error" role="alert">
          {error}
        </p>
      ) : balance ? (
        <p className="balance">{formatCurrency(balance.accountBalance, balance.currency)}</p>
      ) : (
        <p className="loading">Cargando...</p>
      )}
    </section>
  );
}
