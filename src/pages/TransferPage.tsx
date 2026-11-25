import { useEffect, useState } from 'react';
import { getBalance } from '../api';
import TransferForm from '../components/TransferForm';

export default function TransferPage() {
  const [currency, setCurrency] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getBalance()
      .then((b) => setCurrency(b.currency))
      .catch(() => setError('No se pudo cargar la moneda de la cuenta'));
  }, []);

  return (
    <main>
      <h1>Transferir</h1>
      {error ? (
        <p className="alert alert-error" role="alert">
          {error}
        </p>
      ) : currency ? (
        <TransferForm currency={currency} />
      ) : (
        <p className="loading">Cargando...</p>
      )}
    </main>
  );
}
