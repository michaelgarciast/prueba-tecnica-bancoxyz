import { ReactNode, useEffect, useState } from 'react';
import { BalanceResponse, getBalance } from '../api';
import { useAuth } from '../auth/AuthContext';
import { formatCurrency } from '../utils/format';
import { availableBalance } from '../utils/localTransfers';

export default function BalanceCard() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<BalanceResponse | null>(null);
  const [error, setError] = useState('');
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  useEffect(() => {
    getBalance()
      .then((b) => {
        // La API no descuenta las transferencias: se resta el total de las locales ya vencidas.
        setBalance({
          ...b,
          accountBalance: user ? availableBalance(b.accountBalance, user.id) : b.accountBalance,
        });
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
      <p id="available-balance" className="text-3xl font-bold tracking-tight tabular-nums text-white sm:text-4xl">
        {isBalanceVisible ? formatCurrency(balance.accountBalance, balance.currency) : '••••••••'}
      </p>
    );
  } else {
    content = <p className="loading">Cargando...</p>;
  }

  return (
    <section className="card balance-card">
      <div className="mb-2 flex items-center justify-between gap-4">
        <h2 className="text-sm font-medium text-[#f1eef8]">Saldo disponible</h2>
        {balance && !error && (
          <button
            type="button"
            className="rounded text-sm font-medium text-white underline decoration-white/50 underline-offset-4 hover:decoration-white"
            aria-label={isBalanceVisible ? 'Ocultar saldo disponible' : 'Mostrar saldo disponible'}
            aria-controls="available-balance"
            onClick={() => setIsBalanceVisible((visible) => !visible)}
          >
            {isBalanceVisible ? 'Ocultar' : 'Mostrar'}
          </button>
        )}
      </div>
      {content}
    </section>
  );
}
