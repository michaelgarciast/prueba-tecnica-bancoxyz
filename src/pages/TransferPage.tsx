import { ReactNode, useEffect, useState } from 'react';
import { BalanceResponse, getBalance } from '../api';
import { useAuth } from '../auth/AuthContext';
import TransferForm from '../components/TransferForm';
import { availableBalance } from '../utils/localTransfers';

export default function TransferPage() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<BalanceResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getBalance()
      .then((r) => {
        setBalance({
          ...r,
          accountBalance: user ? availableBalance(r.accountBalance, user.id) : r.accountBalance,
        });
      })
      .catch(() => setError('No se pudo cargar el saldo de la cuenta'));
  }, [user]);

  let content: ReactNode;
  if (error) {
    content = (
      <p className="alert-error" role="alert">
        {error}
      </p>
    );
  } else if (balance) {
    content = <TransferForm currency={balance.currency} accountBalance={balance.accountBalance} />;
  } else {
    content = <p className="loading">Cargando...</p>;
  }

  return (
    <main>
      <h1>Transferir</h1>
      {content}
    </main>
  );
}
