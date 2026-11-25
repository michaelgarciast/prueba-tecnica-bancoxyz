import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Navbar() {
  const { user, signOut } = useAuth();
  return (
    <header className="navbar">
      <strong>BancoXYZ</strong>
      <nav>
        <NavLink to="/" end>
          Inicio
        </NavLink>
        <NavLink to="/transfer">Transferir</NavLink>
        <NavLink to="/transfers">Historial</NavLink>
      </nav>
      <span>{user?.name}</span>
      <button type="button" onClick={signOut}>
        Salir
      </button>
    </header>
  );
}
