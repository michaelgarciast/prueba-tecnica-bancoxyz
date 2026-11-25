import { useEffect, useState } from 'react';
import { BalanceResponse, getBalance } from '../api';
import { formatCurrency } from '../utils/format';

export default function BalanceCard() {
  const [balance, setBalance] = useState<BalanceResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getBalance()
      .then(setBalance)
      .catch(() => setError('No se pudo cargar el saldo'));
  }, []);

  return (
    <section className="card">
      <h2>Saldo disponible</h2>
      {error ? (
        <p role="alert">{error}</p>
      ) : balance ? (
        <p className="balance">{formatCurrency(balance.accountBalance, balance.currency)}</p>
      ) : (
        <p>Cargando...</p>
      )}
    </section>
  );
}
