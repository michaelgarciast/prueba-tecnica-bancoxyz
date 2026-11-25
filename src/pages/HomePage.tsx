import { Link } from 'react-router-dom';
import BalanceCard from '../components/BalanceCard';

export default function HomePage() {
  return (
    <main>
      <h1>Inicio</h1>
      <BalanceCard />
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Link to="/transfer" className="btn">
          Transferir
        </Link>
        <Link to="/transfers" className="btn btn-secondary">
          Ver historial
        </Link>
      </div>
    </main>
  );
}
