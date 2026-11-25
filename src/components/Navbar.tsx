import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-1.5 text-sm no-underline ${
    isActive ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-600 hover:text-slate-900'
  }`;

export default function Navbar() {
  const { user, signOut } = useAuth();
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <strong className="text-blue-700">BancoXYZ</strong>
        <nav aria-label="Principal" className="order-last flex w-full gap-1 sm:order-none sm:w-auto">
          <NavLink to="/" end className={linkClass}>
            Inicio
          </NavLink>
          <NavLink to="/transfer" className={linkClass}>
            Transferir
          </NavLink>
          <NavLink to="/transfers" className={linkClass}>
            Historial
          </NavLink>
        </nav>
        <div className="ml-auto flex items-center gap-2 text-sm text-slate-600">
          <span>{user?.name}</span>
          <button type="button" className="btn btn-secondary h-8 px-3 text-sm" onClick={signOut}>
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
