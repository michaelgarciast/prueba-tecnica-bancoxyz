import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium no-underline transition-colors ${
    isActive ? 'bg-white font-semibold text-[#21006f]' : 'text-[#f1eef8] hover:bg-white/10 hover:text-white'
  }`;

export default function Navbar() {
  const { user, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-20 bg-[#4a1596] text-white shadow-md">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-lg font-bold text-[#00e991] ring-1 ring-white/20"
            aria-hidden="true"
          >
            B
          </span>
          <strong className="text-lg tracking-tight">
            Banco<span className="text-[#00e991]">XYZ</span>
          </strong>
        </div>
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
        <div className="ml-auto flex items-center gap-2 text-sm text-[#f1eef8]">
          <span className="hidden sm:inline">{user?.name}</span>
          <button type="button" className="btn btn-secondary h-9 px-3 text-sm" onClick={signOut}>
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
