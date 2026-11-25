import { useAuth } from '../auth/AuthContext';

export default function Navbar() {
  const { user, signOut } = useAuth();
  return (
    <header className="navbar">
      <strong>BancoXYZ</strong>
      <span>{user?.name}</span>
      <button type="button" onClick={signOut}>
        Salir
      </button>
    </header>
  );
}
