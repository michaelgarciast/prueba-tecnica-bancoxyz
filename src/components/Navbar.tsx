import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Navbar() {
  const { user, signOut } = useAuth();
  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <strong className="navbar-brand">BancoXYZ</strong>
        <nav aria-label="Principal">
          <NavLink to="/" end>
            Inicio
          </NavLink>
          <NavLink to="/transfer">Transferir</NavLink>
          <NavLink to="/transfers">Historial</NavLink>
        </nav>
        <div className="navbar-user">
          <span>{user?.name}</span>
          <button type="button" className="btn-secondary" onClick={signOut}>
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
