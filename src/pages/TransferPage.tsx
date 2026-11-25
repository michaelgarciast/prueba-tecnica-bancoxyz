import { ReactNode, useEffect, useState } from 'react';
import { BalanceResponse, getBalance } from '../api';
import { useAuth } from '../auth/AuthContext';
import TransferForm from '../components/TransferForm';
import { spentLocalTransfers } from '../utils/localTransfers';

export default function TransferPage() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<BalanceResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getBalance()
      .then(setBalance)
      .catch(() => setError('No se pudo cargar la moneda de la cuenta'));
  }, []);

  const availableBalance = balance
    ? balance.accountBalance - (user ? spentLocalTransfers(user.id) : 0)
    : 0;

  let content: ReactNode;
  if (error) {
    content = (
      <p className="alert alert-error" role="alert">
        {error}
      </p>
    );
  } else if (balance) {
    content = (
      <TransferForm currency={balance.currency} availableBalance={availableBalance} />
    );
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
